/**
 * URL absoluta del formulario de recuperación en Laravel (Blade).
 * Si está definida, el login enlaza ahí (navegación completa al backend).
 * Si está vacía, se usa la ruta React `/recuperar-contrasena` (POST a la API).
 */
export function getUrlRecuperacionContrasenaWeb() {
  const u = import.meta.env.VITE_RECUPERAR_CONTRASENA_URL;
  return typeof u === 'string' && u.trim() ? u.trim() : '';
}
