/**
 * Varias llamadas simultáneas al mismo recurso comparten una sola petición HTTP.
 * Al terminar (éxito o error) se libera; la siguiente navegación vuelve a pedir datos frescos al API.
 */
export function crearPeticionCompartida(fetcher) {
  let enVuelo = null;
  return function ejecutarPeticionCompartida({ forzar = false } = {}) {
    if (!forzar && enVuelo) {
      return enVuelo;
    }
    enVuelo = fetcher().finally(() => {
      enVuelo = null;
    });
    return enVuelo;
  };

  ejecutarPeticionCompartida.invalidar = () => {
    enVuelo = null;
  };

  return ejecutarPeticionCompartida;
}
