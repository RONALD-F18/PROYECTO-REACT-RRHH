/**
 * Varias llamadas simultáneas al mismo recurso comparten una sola petición HTTP.
 * Al terminar (éxito o error) se libera; la siguiente navegación vuelve a pedir datos frescos.
 * Mitiga React Strict Mode (doble montaje) y efectos que disparan el mismo GET a la vez.
 */
export function crearPeticionCompartida(fetcher) {
  let enVuelo = null;
  return function ejecutarPeticionCompartida() {
    if (!enVuelo) {
      enVuelo = fetcher().finally(() => {
        enVuelo = null;
      });
    }
    return enVuelo;
  };
}
