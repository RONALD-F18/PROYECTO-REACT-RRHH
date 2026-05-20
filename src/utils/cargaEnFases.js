import { ejecutarCuandoDisponible } from './ejecutarCuandoDisponible';

/**
 * Fase 1: listado principal (tabla visible).
 * Fase 2: catálogos en paralelo, diferidos para no competir con el primer pintado.
 */
export async function ejecutarCargaEnFases({
  principal,
  secundarios = [],
  onPrincipal,
  onSecundario,
  opciones = {},
  diferirSecundarios = true,
}) {
  try {
    const valor = await principal(opciones);
    onPrincipal(valor, null);
  } catch (error) {
    onPrincipal(null, error);
  }

  if (secundarios.length === 0) return;

  const ejecutarSecundarios = () =>
    Promise.allSettled(
      secundarios.map(async (fn, indice) => {
        try {
          const valor = await fn(opciones);
          onSecundario?.(indice, valor, null);
        } catch (error) {
          onSecundario?.(indice, null, error);
        }
      }),
    );

  if (diferirSecundarios) {
    ejecutarCuandoDisponible(() => void ejecutarSecundarios());
    return;
  }

  await ejecutarSecundarios();
}
