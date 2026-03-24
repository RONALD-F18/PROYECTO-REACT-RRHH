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
