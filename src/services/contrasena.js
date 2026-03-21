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
 * Restablece la contraseña con token del correo (ruta pública API v1).
 * Útil si más adelante expones el formulario en React; el flujo por Blade no lo requiere.
 */
export async function restablecerContrasenaConToken({
  email,
  token,
  password,
  password_confirmation,
}) {
  const { data } = await apiPublica.post('/reset-password', {
    email: String(email || '').trim(),
    token: String(token || '').trim(),
    password,
    password_confirmation,
  });
  return data;
}
