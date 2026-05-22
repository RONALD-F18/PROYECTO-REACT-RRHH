/**
 * Varias llamadas simultáneas al mismo recurso comparten una sola petición HTTP.
 * Al terminar (éxito o error) se libera; la siguiente navegación vuelve a pedir datos frescos al API.
 */
export function crearPeticionCompartida(fetcher) {
  let enVuelo = null;

  function ejecutarPeticionCompartida({ forzar = false } = {}) {
    if (!forzar && enVuelo) {
      return enVuelo;
    }
    enVuelo = fetcher().finally(() => {
      enVuelo = null;
    });
    return enVuelo;
  }

  ejecutarPeticionCompartida.invalidar = () => {
    enVuelo = null;
  };

  return ejecutarPeticionCompartida;
}

/** Invalida un ejecutor sin romper si el bundle viejo no tenía `.invalidar`. */
export function invalidarEjecutorCompartido(ejecutor) {
  if (ejecutor && typeof ejecutor.invalidar === 'function') {
    ejecutor.invalidar();
  }
}

/** Invalida todos los ejecutores de un Map y lo vacía (listas paginadas). */
export function invalidarMapaEjecutoresCompartidos(mapa) {
  if (!mapa || typeof mapa.forEach !== 'function') return;
  mapa.forEach((ej) => invalidarEjecutorCompartido(ej));
  mapa.clear();
}
