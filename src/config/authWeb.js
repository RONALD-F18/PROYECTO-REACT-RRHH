/**
 * URL absoluta del formulario de recuperación en Laravel (Blade).
 * En producción apunta a reset-password.html en el mismo dominio (no a rutas React).
 * Si está vacía, el login usa la ruta React `/recuperar-contrasena` (POST a la API).
 */

// Obtiene la URL de recuperación de contraseña
export function getUrlRecuperacionContrasenaWeb() {
  const u = import.meta.env.VITE_RECUPERAR_CONTRASENA_URL;
  return typeof u === 'string' && u.trim() ? u.trim() : '';
}
