import { apiPublica } from './api';

function mensajeDesdeCuerpo(data) {
  if (!data || typeof data !== 'object') return '';
  const m = data.message ?? data.mensaje ?? data.status;
  if (typeof m === 'string' && m.trim()) return m.trim();
  if (Array.isArray(m) && m.length) return m.filter(Boolean).join(' ');
  return '';
}

/**
 * Solicita el correo con el enlace de restablecimiento (ruta pública API v1).
 * Usa cliente sin credenciales para reducir errores de CORS en POST anónimos.
 */
export async function solicitarEnlaceRecuperacion(correoElectronico) {
  const email = String(correoElectronico || '').trim();
  const { data, status } = await apiPublica.post('/forgot-password', {
    email,
    email_usuario: email,
  });
  return {
    mensajeServidor: mensajeDesdeCuerpo(data),
    status,
    data,
  };
}

/**
 * Restablece la contraseña con token del correo (POST /reset-password, API v1).
 */
export async function restablecerContrasenaConToken({
  email,
  email_usuario,
  token,
  contrasena_usuario,
  contrasena_usuario_confirmation,
}) {
  const correo = String(email_usuario ?? email ?? '').trim();
  const { data, status } = await apiPublica.post('/reset-password', {
    email_usuario: correo,
    token: String(token || '').trim(),
    contrasena_usuario,
    contrasena_usuario_confirmation,
  });
  return {
    data,
    status,
    mensajeServidor: mensajeDesdeCuerpo(data),
  };
}
