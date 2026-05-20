/** Clave única: misma que usa autenticacion.js */
export const CLAVE_SESION_LOCAL = 'rrhh_sesion_usuario';

export function leerPayloadSesion() {
  try {
    const raw = localStorage.getItem(CLAVE_SESION_LOCAL);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

/** Sanctum / JWT: distintas formas en las que Laravel devuelve el token en el login. */
export function extraerTokenDeRespuestaLogin(data) {
  if (!data || typeof data !== 'object') return null;

  const candidatos = [
    data.access_token,
    data.token,
    data.plainTextToken,
    data.data?.access_token,
    data.data?.token,
    data.data?.plainTextToken,
    data.user?.access_token,
    data.user?.token,
    data.data?.user?.access_token,
  ];

  for (const t of candidatos) {
    if (typeof t === 'string' && t.trim().length > 0) return t.trim();
  }

  const buscarEnObjeto = (obj, profundidad = 0) => {
    if (!obj || typeof obj !== 'object' || profundidad > 4) return null;
    for (const [clave, valor] of Object.entries(obj)) {
      if (
        (clave === 'access_token' || clave === 'token' || clave === 'plainTextToken') &&
        typeof valor === 'string' &&
        valor.trim().length > 0
      ) {
        return valor.trim();
      }
    }
    for (const valor of Object.values(obj)) {
      if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
        const anidado = buscarEnObjeto(valor, profundidad + 1);
        if (anidado) return anidado;
      }
    }
    return null;
  };

  return buscarEnObjeto(data);
}

/**
 * Token Bearer guardado tras el login (obligatorio en GitHub Pages + API en otro dominio).
 */
export function obtenerTokenBearerDesdeSesion() {
  const almacenado = leerPayloadSesion();
  if (!almacenado) return null;
  return extraerTokenDeRespuestaLogin(almacenado.raw ?? almacenado);
}

export function limpiarAlmacenSesionCliente() {
  try {
    localStorage.removeItem(CLAVE_SESION_LOCAL);
  } catch {
    /* noop */
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('rrhh_lista:')) {
        sessionStorage.removeItem(k);
      }
    }
  } catch {
    /* noop */
  }
}

/**
 * Actualiza en localStorage los campos del usuario (nombre, correo, etc.) tras guardar el perfil.
 */
export function fusionarUsuarioEnSesion(parcial) {
  if (!parcial || typeof parcial !== 'object') return;
  const almacenado = leerPayloadSesion();
  if (!almacenado) return;
  const merge = (u) =>
    u && typeof u === 'object' && !Array.isArray(u) ? { ...u, ...parcial } : u;

  const next = {
    ...almacenado,
    user: merge(almacenado.user),
    raw:
      almacenado.raw && typeof almacenado.raw === 'object'
        ? { ...almacenado.raw }
        : almacenado.raw,
  };
  if (next.raw && typeof next.raw === 'object') {
    if (next.raw.user) next.raw.user = merge(next.raw.user);
    if (next.raw.data && typeof next.raw.data === 'object' && next.raw.data.user) {
      next.raw.data = { ...next.raw.data, user: merge(next.raw.data.user) };
    }
  }
  try {
    localStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(next));
  } catch {
    /* noop */
  }
}
