/**
 * Limita peticiones HTTP simultáneas al API (Azure suele ir más lento con 7+ GET a la vez).
 * Las peticiones se encolan y salen de a {@link MAX_PETICIONES_API_PARALELAS} en paralelo.
 */
export const MAX_PETICIONES_API_PARALELAS = 4;

let activas = 0;
const cola = [];

function despacharCola() {
  while (activas < MAX_PETICIONES_API_PARALELAS && cola.length > 0) {
    const trabajo = cola.shift();
    activas += 1;
    trabajo
      .fn()
      .then(trabajo.resolve, trabajo.reject)
      .finally(() => {
        activas -= 1;
        despacharCola();
      });
  }
}

export function ejecutarEnColaApi(fn) {
  return new Promise((resolve, reject) => {
    cola.push({ fn, resolve, reject });
    despacharCola();
  });
}

/**
 * Envuelve el adapter de Axios para serializar la concurrencia global.
 */
export function crearAdapterConCola(adapterBase) {
  if (typeof adapterBase !== 'function') {
    throw new Error('Adapter de Axios no disponible');
  }
  return (config) => ejecutarEnColaApi(() => adapterBase(config));
}
