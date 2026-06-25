function primerMensajeCampo(val) {
  if (Array.isArray(val) && val.length > 0) return String(val[0]).trim();
  if (typeof val === 'string') return val.trim();
  return '';
}

/**
 * Para 422 con `errors` de Laravel: mensajes por campo del perfil de usuario.
 * @returns {null | { nombre: string, email: string, contrasena: string, confirmacion: string }}
 */
export function mapaErroresValidacionPerfilUsuario(error) {
  if (error?.response?.status !== 422) return null;
  const raw = error.response.data;
  if (!raw || typeof raw !== 'object' || !raw.errors || typeof raw.errors !== 'object') return null;
  const e = raw.errors;

  const pick = (keys) => {
    for (const k of keys) {
      if (e[k] == null) continue;
      const msg = primerMensajeCampo(e[k]);
      if (msg) return msg;
    }
    return '';
  };

  return {
    nombre: pick(['nombre_usuario', 'nombre']),
    email: pick(['email_usuario', 'email']),
    contrasena: pick(['contrasena_usuario', 'password']),
    confirmacion: pick(['contrasena_usuario_confirmation']),
  };
}

/** Une mensajes de validación Laravel */
function unirErroresLaravel(errors) {
  if (!errors || typeof errors !== 'object') return '';
  return Object.values(errors)
    .flat()
    .filter(Boolean)
    .join(' ');
}

/** Primer mensaje de un 422 Laravel (un solo campo, sin saturar). */
export function primerMensajeValidacionApi(error) {
  if (error?.response?.status !== 422) return '';
  const raw = error.response.data;
  if (!raw || typeof raw !== 'object') return '';
  if (raw.errors && typeof raw.errors === 'object') {
    for (const val of Object.values(raw.errors)) {
      const msg = primerMensajeCampo(val);
      if (msg) return msg;
    }
  }
  const candidato = raw.message ?? raw.error ?? raw.mensaje;
  if (typeof candidato === 'string' && candidato.trim()) return candidato.trim();
  return '';
}

/** Texto legible desde error de red o respuesta HTTP (para mostrar al usuario final). */
export function mensajeErrorApi(error) {
  const urlPedido = String(error?.config?.url ?? '');
  const esLogin = urlPedido.includes('/login');

  if (!error.response) {
    const codigo = error.code;
    if (codigo === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'No hay conexión. Compruebe su internet o la red de la empresa e intente de nuevo. Si el problema continúa, consulte al administrador del sistema.';
    }
    if (codigo === 'ECONNABORTED' || codigo === 'ETIMEDOUT') {
      return 'La operación tardó demasiado y se canceló. Intente de nuevo en unos minutos. Si se repite, consulte al administrador del sistema.';
    }
    return error.message?.trim() || 'No se pudo completar la conexión. Intente de nuevo o consulte al administrador del sistema.';
  }

  const status = error.response.status;
  const raw = error.response.data;

  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) {
      return textoPorCodigoHttp(status);
    }
    if (t.startsWith('<!') || t.includes('<!DOCTYPE') || t.includes('<html')) {
      return 'La respuesta no es la esperada. Compruebe la dirección del sistema o consulte al administrador.';
    }
    return t.length > 320 ? `${t.slice(0, 320)}…` : t;
  }

  if (raw && typeof raw === 'object') {
    if (status === 401) {
      const m = String(raw.message ?? raw.error ?? '').toLowerCase();
      if (
        m.includes('unauthenticated') ||
        m.includes('no autenticado') ||
        m.includes('not authenticated') ||
        m.includes('debe autenticarse')
      ) {
        return 'Su sesión expiró o no se pudo verificar su identidad. Cierre sesión e inicie de nuevo.';
      }
    }
    const candidato = raw.message ?? raw.error ?? raw.mensaje;
    if (typeof candidato === 'string' && candidato.trim()) {
      const t = candidato.trim();
      if (/^server error$/i.test(t)) {
        return textoPorCodigoHttp(status);
      }
      return t;
    }
    if (Array.isArray(candidato) && candidato.length) {
      return candidato.filter(Boolean).join(' ');
    }
    const deErrores = unirErroresLaravel(raw.errors);
    if (deErrores) return deErrores;
    if (raw.success === false && typeof raw.message === 'string') {
      return raw.message;
    }
  }

  if (status === 401 && !esLogin) {
    return 'Su sesión expiró o no es válida. Cierre sesión e inicie de nuevo.';
  }

  return textoPorCodigoHttp(status);
}

/** Texto bruto del cuerpo de error (para detectar SQL/FK). */
function textoCrudoRespuestaError(error) {
  if (!error?.response?.data) return String(error?.message ?? '').trim();
  const raw = error.response.data;
  if (typeof raw === 'string') return raw.trim();
  if (raw && typeof raw === 'object') {
    const m = raw.message ?? raw.error ?? raw.exception;
    if (typeof m === 'string' && m.trim()) return m.trim();
    try {
      return JSON.stringify(raw);
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * DELETE bloqueado por integridad referencial (MySQL 1451 / SQLSTATE 23000, etc.).
 */
export function esErrorViolacionFkEliminacion(error) {
  const t = `${textoCrudoRespuestaError(error)} ${error?.message ?? ''}`.toLowerCase();
  return (
    t.includes('foreign key') ||
    t.includes('integrity constraint') ||
    t.includes('sqlstate[23000]') ||
    t.includes('cannot delete or update a parent row') ||
    t.includes('1451') ||
    t.includes('a foreign key constraint fails')
  );
}

/**
 * Mensaje legible al fallar eliminar contrato o empleado (evita mostrar SQL crudo).
 * @param {'contrato' | 'empleado'} tipo
 */
export function mensajeErrorEliminacion(error, tipo) {
  const status = error?.response?.status;
  if (status === 409 && tipo === 'empleado') {
    return 'No se puede borrar este empleado del registro. Lo habitual es marcarlo como «Retirado» desde su ficha, sin eliminar el historial.';
  }
  if (esErrorViolacionFkEliminacion(error)) {
    if (tipo === 'contrato') {
      return 'No se puede eliminar este contrato porque hay registros que dependen de él (por ejemplo certificaciones, prestaciones u otros módulos). Elimina o desvincula primero esa información y vuelve a intentarlo.';
    }
    return 'No se puede eliminar este empleado porque tiene datos vinculados (contratos, certificaciones, novedades, etc.). Resuelve esas relaciones antes de borrar el registro.';
  }
  const base = mensajeErrorApi(error);
  if (base.length > 320 && (base.includes('SQLSTATE') || base.includes('SQL:'))) {
    return 'No se pudo eliminar porque hay información relacionada (contratos, certificaciones u otros registros). Revise esos datos o consulte al administrador.';
  }
  return base;
}

function textoPorCodigoHttp(status) {
  switch (status) {
    case 401:
      return 'Correo o contraseña incorrectos.';
    case 403:
      return 'No tiene permiso para acceder. Si cree que es un error, consulte al administrador.';
    case 404:
      return 'No se encontró lo solicitado. Verifique la dirección o consulte al administrador.';
    case 419:
      return 'La página dejó de ser válida por seguridad. Recargue e intente de nuevo.';
    case 422:
      return 'Algunos datos no son válidos. Revíselos e intente de nuevo.';
    case 429:
      return 'Demasiadas solicitudes. Espere unos segundos e intente de nuevo.';
    case 500:
    case 502:
    case 503:
      return 'El sistema tuvo un fallo temporal. Intente más tarde o consulte al administrador.';
    default:
      return status
        ? `No se pudo completar la operación (código ${status}). Intente de nuevo o consulte al administrador.`
        : 'Ocurrió un error inesperado. Intente de nuevo o consulte al administrador.';
  }
}
