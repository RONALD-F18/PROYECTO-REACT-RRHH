/**
 * Carga por fases: primero el listado principal (la tabla deja de bloquearse),
 * luego catálogos/auxiliares en paralelo sin volver a poner cargando=true.
 *
 * @param {Object} params
 * @param {(opciones?: { forzar?: boolean }) => Promise<*>} params.principal
 * @param {Array<(opciones?: { forzar?: boolean }) => Promise<*>>} [params.secundarios]
 * @param {(valor: *, error: Error | null) => void} params.onPrincipal
 * @param {(indice: number, valor: *, error: Error | null) => void} [params.onSecundario]
 * @param {{ forzar?: boolean }} [params.opciones]
 */
export async function ejecutarCargaEnFases({
  principal,
  secundarios = [],
  onPrincipal,
  onSecundario,
  opciones = {},
}) {
  try {
    const valor = await principal(opciones);
    onPrincipal(valor, null);
  } catch (error) {
    onPrincipal(null, error);
  }

  if (secundarios.length === 0) return;

  await Promise.allSettled(
    secundarios.map(async (fn, indice) => {
      try {
        const valor = await fn(opciones);
        onSecundario?.(indice, valor, null);
      } catch (error) {
        onSecundario?.(indice, null, error);
      }
    }),
  );
}
