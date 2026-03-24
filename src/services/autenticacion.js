import api, { API_REQUEST_TIMEOUT_MS } from './api';
import {
  CLAVE_SESION_LOCAL,
  leerPayloadSesion,
  limpiarAlmacenSesionCliente,
  obtenerTokenBearerDesdeSesion,
} from './sesionLocal';

function guardarSesionLocal(data) {
  try {
    const payload = {
      user: data?.user ?? null,
      raw: data ?? null,
      timestamp: Date.now(),
    };
    localStorage.setItem(CLAVE_SESION_LOCAL, JSON.stringify(payload));
  } catch {
    /* sin bloqueo si localStorage no está disponible */
  }
}

export function haySesionLocalActiva() {
  return leerPayloadSesion() != null;
}

/** Empleados: cualquier sesión válida (administrador, funcionario, etc.). Solo `/usuarios` queda reservado a admin en rutas y menú. */
export function puedeAccederModuloEmpleadosSesion() {
  return haySesionLocalActiva();
}

function nombreRolDesdeUsuario(user) {
  if (!user || typeof user !== 'object') return '';
  if (typeof user.rol === 'string') return user.rol;
  if (typeof user.role === 'string') return user.role;
  if (user.rol && typeof user.rol === 'object' && typeof user.rol.nombre_rol === 'string') {
    return user.rol.nombre_rol;
  }
  if (user.roles && typeof user.roles === 'object' && typeof user.roles.nombre_rol === 'string') {
    return user.roles.nombre_rol;
  }
  if (Array.isArray(user.roles)) {
    const rolPlano = user.roles.find((r) => typeof r === 'string');
    if (rolPlano) return rolPlano;
    const rolObj = user.roles.find((r) => r && typeof r === 'object' && typeof r.nombre_rol === 'string');
    if (rolObj) return rolObj.nombre_rol;
  }
  if (typeof user.nombre_rol === 'string') return user.nombre_rol;
  if (user.role && typeof user.role === 'object' && typeof user.role.nombre_rol === 'string') {
    return user.role.nombre_rol;
  }
  return '';
}

function esRolAdminTexto(rol) {
  if (typeof rol !== 'string') return false;
  const s = rol.trim().toLowerCase();
  return s.includes('admin') || s.includes('administrador');
}

/**
 * `cod_usuario` del usuario autenticado (login). Útil cuando no se puede listar `/usuarios` (funcionario).
 */
export function codUsuarioSesionLocal() {
  try {
    const almacenado = leerPayloadSesion();
    if (!almacenado) return null;
    const respuestaLogin = almacenado.raw ?? {};
    const user =
      (almacenado.user && typeof almacenado.user === 'object' ? almacenado.user : null) ??
      (respuestaLogin.user && typeof respuestaLogin.user === 'object' ? respuestaLogin.user : null) ??
      (respuestaLogin.data?.user && typeof respuestaLogin.data.user === 'object'
        ? respuestaLogin.data.user
        : null);
    if (!user || typeof user !== 'object') return null;
    const c = user.cod_usuario ?? user.id ?? user.user_id;
    if (c == null || c === '') return null;
    const n = Number(c);
    return Number.isFinite(n) ? n : c;
  } catch {
    return null;
  }
}

export function esAdminSesionLocal() {
  try {
    const almacenado = leerPayloadSesion();
    if (!almacenado) return false;
    const respuestaLogin = almacenado?.raw ?? {};
    const user =
      (almacenado?.user && typeof almacenado.user === 'object' ? almacenado.user : null) ??
      (respuestaLogin?.user && typeof respuestaLogin.user === 'object' ? respuestaLogin.user : null) ??
      (respuestaLogin?.data?.user && typeof respuestaLogin.data.user === 'object'
        ? respuestaLogin.data.user
        : null);

    const rolRaiz =
      respuestaLogin?.role ??
      respuestaLogin?.rol ??
      respuestaLogin?.nombre_rol ??
      respuestaLogin?.data?.role ??
      respuestaLogin?.data?.rol;
    if (rolRaiz && typeof rolRaiz === 'object' && typeof rolRaiz.nombre_rol === 'string') {
      if (esRolAdminTexto(rolRaiz.nombre_rol)) return true;
    }
    if (esRolAdminTexto(rolRaiz)) return true;
    if (respuestaLogin?.es_admin === true || respuestaLogin?.es_admin === 1) return true;
    if (respuestaLogin?.data?.es_admin === true || respuestaLogin?.data?.es_admin === 1) return true;

    if (user) {
      if (user.esAdmin === true) return true;
      if (user.is_admin === true) return true;
      if (user.es_admin === true || user.es_admin === 1) return true;
      const rolUsuario = nombreRolDesdeUsuario(user);
      if (esRolAdminTexto(rolUsuario)) return true;
    }

    return false;
  } catch {
    return false;
  }
}

export async function iniciarSesion(credenciales) {
  const { data } = await api.post('/login', {
    email_usuario: credenciales.email_usuario,
    contrasena_usuario: credenciales.contrasena_usuario,
  });
  guardarSesionLocal(data);
  return data;
}

/**
 * Cierra sesión en el cliente de inmediato (evita parpadeos al /login) y luego intenta revocar en el servidor.
 * El POST puede tardar o fallar: no bloquea la UI si llamas sin await y navegas después.
 */
export async function cerrarSesion() {
  const bearer = obtenerTokenBearerDesdeSesion();
  limpiarAlmacenSesionCliente();
  try {
    const config = { timeout: Math.min(60_000, API_REQUEST_TIMEOUT_MS) };
    if (bearer) {
      config.headers = { Authorization: `Bearer ${bearer}` };
    }
    await api.post('/logout', {}, config);
  } catch {
    /* cookie JWT o red: igual ya limpiamos el cliente */
  }
}
