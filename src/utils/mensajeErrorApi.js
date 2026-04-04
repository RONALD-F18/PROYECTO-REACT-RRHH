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

/** Texto legible desde error de Axios (Laravel, red, CORS, HTML, etc.) */
export function mensajeErrorApi(error) {
  if (!error.response) {
    const codigo = error.code;
    if (codigo === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'No hay conexión con el servidor. Comprueba que Laravel esté en marcha, la variable VITE_API_URL en .env y que CORS permita tu origen con credenciales.';
    }
    if (codigo === 'ECONNABORTED' || codigo === 'ETIMEDOUT') {
      return 'La petición tardó demasiado (tiempo agotado). Revisa que Laravel responda, que VITE_API_URL termine en /api/v1 y CORS permita credenciales. Si el back es lento (Docker, muchos datos), sube VITE_API_TIMEOUT_MS en .env (p. ej. 180000 o 300000). En desarrollo puedes usar VITE_API_URL=/api/v1 con el proxy de Vite para evitar CORS.';
    }
    return error.message?.trim() || 'No se pudo conectar con el servidor.';
  }

  const status = error.response.status;
  const raw = error.response.data;

  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) {
      return textoPorCodigoHttp(status);
    }
    if (t.startsWith('<!') || t.includes('<!DOCTYPE') || t.includes('<html')) {
      return `El servidor devolvió una página HTML (${status}), no JSON. Suele indicar URL incorrecta: revisa VITE_API_URL (debe terminar en /api/v1) y la ruta POST /login.`;
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
        return 'Tu sesión expiró o el servidor no recibió la autenticación (cookie o token). Cierra sesión e inicia de nuevo.';
      }
    }
    const candidato = raw.message ?? raw.error ?? raw.mensaje;
    if (typeof candidato === 'string' && candidato.trim()) {
      return candidato.trim();
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
    return 'No se puede eliminar físicamente a este empleado: el servidor rechazó la operación (conflicto). La baja habitual es marcar el estado como «Retirado» (baja lógica) desde el detalle del empleado, no borrar el registro.';
  }
  if (esErrorViolacionFkEliminacion(error)) {
    if (tipo === 'contrato') {
      return 'No se puede eliminar este contrato porque hay registros que dependen de él (por ejemplo certificaciones, prestaciones u otros módulos). Elimina o desvincula primero esa información y vuelve a intentarlo.';
    }
    return 'No se puede eliminar este empleado porque tiene datos vinculados (contratos, certificaciones, novedades, etc.). Resuelve esas relaciones antes de borrar el registro.';
  }
  const base = mensajeErrorApi(error);
  if (base.length > 320 && (base.includes('SQLSTATE') || base.includes('SQL:'))) {
    return 'El servidor rechazó la eliminación. Suele deberse a datos relacionados en otros módulos. Revisa certificaciones, contratos y demás registros asociados, o consulta al administrador.';
  }
  return base;
}

function textoPorCodigoHttp(status) {
  switch (status) {
    case 401:
      return 'Correo o contraseña incorrectos.';
    case 403:
      return 'Acceso denegado. Tu usuario no puede iniciar sesión desde aquí.';
    case 404:
      return 'No se encontró esa ruta en el API (404). Verifica VITE_API_URL (debe ser …/api/v1) y que existan las rutas públicas POST /forgot-password y /login en Laravel.';
    case 419:
      return 'Token de seguridad expirado (419). Recarga la página e inténtalo de nuevo.';
    case 422:
      return 'Los datos enviados no son válidos. Revisa correo y contraseña.';
    case 429:
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    case 500:
    case 502:
    case 503:
      return 'Error en el servidor. Revisa los logs de Laravel o inténtalo más tarde.';
    default:
      return status
        ? `Respuesta del servidor no reconocida (código ${status}).`
        : 'Respuesta inesperada del servidor.';
  }
}
