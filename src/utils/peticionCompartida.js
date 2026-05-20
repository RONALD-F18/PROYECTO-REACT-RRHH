/** Reutilizar listados recién cargados al navegar entre módulos (p. ej. dashboard → empleados). */
export const TTL_CACHE_LISTAS_MS = 60_000;

/**
 * Varias llamadas simultáneas al mismo recurso comparten una sola petición HTTP.
 * Con `ttlMs`, respuestas exitosas se reutilizan un tiempo sin volver a pedir al API.
 *
 * @param {() => Promise<unknown>} fetcher
 * @param {{ ttlMs?: number }} [opciones]
 */
export function crearPeticionCompartida(fetcher, { ttlMs = 0 } = {}) {
  let enVuelo = null;
  let cache = null;
  let cacheAt = 0;

  function ejecutarPeticionCompartida({ forzar = false } = {}) {
    const ahora = Date.now();
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
  };

  return ejecutarPeticionCompartida;
}
