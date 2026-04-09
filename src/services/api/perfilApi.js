import api from '../api';
import { codUsuarioSesionLocal } from '../autenticacion';
import { getUsuarioById, updateUsuario } from '../usuario';

/**
 * Ruta dedicada al usuario autenticado (recomendada en Laravel: sin exponer `cod_usuario` en la URL).
 * Si el backend aún no la define, se hace fallback a GET/PUT `/usuarios/{cod}` con el id de sesión.
 *
 * Backend sugerido (routes/api.php, grupo auth:sanctum):
 *   Route::get('/perfil', [PerfilController::class, 'show']);
 *   Route::put('/perfil', [PerfilController::class, 'update']);
 * con las mismas reglas de validación que `UsuarioController@update` para nombre, email y contraseña opcional.
 */
export const RUTA_API_PERFIL = '/perfil';

/**
 * @param {unknown} data
 * @returns {Record<string, unknown>|null}
 */
export function cuerpoRegistroUsuario(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;
  return data;
}

function debeUsarFallbackUsuarios(error) {
  const s = error?.response?.status;
  return s === 404 || s === 405;
}

/**
 * Obtiene el registro del usuario actual (preferencia: GET /perfil).
 */
export async function getMiPerfilApi() {
  try {
    const { data } = await api.get(RUTA_API_PERFIL);
    return data;
  } catch (e) {
    if (debeUsarFallbackUsuarios(e)) {
      const cod = codUsuarioSesionLocal();
      if (cod == null || cod === '') throw e;
      return getUsuarioById(cod);
    }
    throw e;
  }
}

/**
 * Actualiza perfil (preferencia: PUT /perfil con cuerpo mínimo).
 * El backend debe validar nombre_usuario, email_usuario y contraseña opcional.
 *
 * @param {{
 *   nombre_usuario: string,
 *   email_usuario: string,
 *   contrasena_usuario?: string,
 *   contrasena_usuario_confirmation?: string,
 *   cod_rol?: number,
 *   estado_usuario?: boolean,
 * }} cuerpo
 */
export async function updateMiPerfilApi(cuerpo) {
  const {
    nombre_usuario,
    email_usuario,
    contrasena_usuario,
    contrasena_usuario_confirmation,
    cod_rol,
    estado_usuario,
  } = cuerpo;

  const base = {
    nombre_usuario: nombre_usuario.trim(),
    email_usuario: email_usuario.trim(),
  };
  if (typeof contrasena_usuario === 'string' && contrasena_usuario.trim().length > 0) {
    base.contrasena_usuario = contrasena_usuario;
    base.contrasena_usuario_confirmation = contrasena_usuario_confirmation;
  }

  try {
    const { data } = await api.put(RUTA_API_PERFIL, base);
    return data;
  } catch (e) {
    if (!debeUsarFallbackUsuarios(e)) throw e;
    const cod = codUsuarioSesionLocal();
    if (cod == null || cod === '') throw e;
    const cr = cod_rol != null ? Number(cod_rol) : NaN;
    if (!Number.isFinite(cr)) {
      const err = new Error(
        'No se pudo actualizar el perfil con la configuración actual del sistema. Cierre sesión e inicie de nuevo. ' +
          'Si el problema continúa, consulte al administrador.',
      );
      err.isPerfilLegacySinRol = true;
      throw err;
    }
    const legacy = {
      ...base,
      cod_rol: cr,
      estado_usuario: estado_usuario !== false,
    };
    const { data } = await updateUsuario(cod, legacy);
    return data;
  }
}
