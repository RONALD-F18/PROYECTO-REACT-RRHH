import { leerCacheListaSesion } from './cacheListaSesion';
import { TTL_CACHE_LISTAS_MS } from './peticionCompartida';

/**
 * Pinta la tabla al instante si el listado ya está en sessionStorage (login prefetch o visita previa).
 * @returns {boolean} true si había datos en caché
 */
export function hidratarListaSiHayCache(claveSesion, extraer, aplicar) {
  const raw = leerCacheListaSesion(claveSesion, TTL_CACHE_LISTAS_MS);
  if (raw == null) return false;
  try {
    aplicar(extraer(raw));
    return true;
  } catch {
    return false;
  }
}
