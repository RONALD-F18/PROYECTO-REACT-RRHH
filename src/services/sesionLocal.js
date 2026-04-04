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

/**
 * JWT / token plano que algunos backends devuelven en el login (además o en lugar de cookie).
 */
export function obtenerTokenBearerDesdeSesion() {
  const almacenado = leerPayloadSesion();
  if (!almacenado) return null;
  const r = almacenado.raw ?? {};
  const candidatos = [
    r.access_token,
    r.token,
    r.plainTextToken,
    r.data?.access_token,
    r.data?.token,
    almacenado.user?.access_token,
  ];
  for (const t of candidatos) {
    if (typeof t === 'string' && t.trim().length > 0) return t.trim();
  }
  return null;
}

export function limpiarAlmacenSesionCliente() {
  try {
    localStorage.removeItem(CLAVE_SESION_LOCAL);
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
