import { confirmarAccion } from '../../utils/alertasSwal';

/**
 * Pide confirmación antes de cerrar un modal con datos no guardados.
 * @param {{ mensaje?: string, titulo?: string }} [opts]
 * @returns {Promise<boolean>} true si el usuario confirma cancelar
 */
export async function confirmarCierreModal(opts = {}) {
  const titulo = opts.titulo ?? '¿Desea cancelar?';
  const texto =
    opts.mensaje ?? 'Se perderán los datos no guardados.';
  return confirmarAccion({
    titulo,
    texto,
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Continuar editando',
    icon: 'warning',
    confirmButtonColor: '#dc2626',
  });
}
