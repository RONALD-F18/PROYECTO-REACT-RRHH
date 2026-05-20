import {
  escribirCacheListaSesion,
  invalidarCacheListaSesion,
  leerCacheListaSesion,
} from './cacheListaSesion';

/** Reutilizar listados entre módulos y recargas (memoria + sessionStorage). */
export const TTL_CACHE_LISTAS_MS = 300_000;

/**
 * @param {() => Promise<unknown>} fetcher
 * @param {{ ttlMs?: number, claveSesion?: string }} [opciones]
 */
export function crearPeticionCompartida(fetcher, { ttlMs = 0, claveSesion = '' } = {}) {
  let enVuelo = null;
  let cache = null;
  let cacheAt = 0;

  function ejecutarPeticionCompartida({ forzar = false } = {}) {
    const ahora = Date.now();

    if (!forzar && claveSesion && ttlMs > 0) {
      const desdeSesion = leerCacheListaSesion(claveSesion, ttlMs);
      if (desdeSesion != null) {
        cache = desdeSesion;
        cacheAt = ahora;
        return Promise.resolve(desdeSesion);
      }
    }

    if (!forzar && ttlMs > 0 && cache != null && ahora - cacheAt < ttlMs) {
      return Promise.resolve(cache);
    }

    if (!forzar && enVuelo) {
      return enVuelo;
    }

    enVuelo = fetcher()
      .then((resultado) => {
        if (ttlMs > 0) {
          cache = resultado;
          cacheAt = Date.now();
          if (claveSesion) escribirCacheListaSesion(claveSesion, resultado);
        }
        return resultado;
      })
      .finally(() => {
        enVuelo = null;
      });

    return enVuelo;
  }

  ejecutarPeticionCompartida.invalidar = () => {
    cache = null;
    cacheAt = 0;
    enVuelo = null;
    if (claveSesion) invalidarCacheListaSesion(claveSesion);
  };

  return ejecutarPeticionCompartida;
}
