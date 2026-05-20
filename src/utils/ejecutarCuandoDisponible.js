/**
 * Ejecuta trabajo pesado después de pintar la UI (catálogos, selects, etc.).
 */
export function ejecutarCuandoDisponible(fn, timeoutMs = 80) {
  if (typeof window === 'undefined') {
    void fn();
    return;
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => void fn(), { timeout: timeoutMs });
    return;
  }
  window.setTimeout(() => void fn(), 16);
}
