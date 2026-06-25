export const EVENTO_SESION_EXPIRADA = 'rrhh:sesion-expirada';

export function notificarSesionExpirada() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA));
}
