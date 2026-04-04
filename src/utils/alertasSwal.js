import Swal from 'sweetalert2';
import { mensajeErrorApi, mensajeErrorEliminacion } from './mensajeErrorApi';

export const swalAncho = 'min(92vw, 26rem)';

const swalErrorBase = {
  confirmButtonText: 'Aceptar',
  confirmButtonColor: '#2563eb',
  width: swalAncho,
};

const swalConfirmEliminarBase = {
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Sí, eliminar',
  cancelButtonText: 'Cancelar',
  reverseButtons: true,
  confirmButtonColor: '#dc2626',
  cancelButtonColor: '#64748b',
  width: swalAncho,
};

function textoDesdeError(error) {
  if (typeof error === 'string') {
    const t = error.trim();
    if (t) return t;
  }
  return mensajeErrorApi(error);
}

/**
 * Diálogo de confirmación para eliminar (destructivo).
 * @param {{ titulo: string, texto?: string }} opts
 * @returns {Promise<boolean>} true si el usuario confirmó
 */
export function confirmarEliminacion({ titulo, texto = 'Esta acción no se puede deshacer.' }) {
  return Swal.fire({
    ...swalConfirmEliminarBase,
    title: titulo,
    text: texto,
  }).then((r) => r.isConfirmed);
}

export function alertaErrorEliminacion(error, tipo) {
  const titulo =
    tipo === 'contrato' ? 'No se pudo eliminar el contrato' : 'No se pudo eliminar el empleado';
  return Swal.fire({
    ...swalErrorBase,
    icon: 'error',
    title: titulo,
    text: mensajeErrorEliminacion(error, tipo),
  });
}

/**
 * Error de API o mensaje en texto plano (si `error` es string).
 * @param {string | undefined} titulo
 * @param {unknown} error — Axios error o string
 */
export function alertaErrorApi(titulo, error) {
  return Swal.fire({
    ...swalErrorBase,
    icon: 'error',
    title: titulo || 'Algo salió mal',
    text: textoDesdeError(error),
  });
}

/**
 * Aviso genérico (advertencia, información, éxito breve).
 * @param {{ titulo?: string, texto: string, icon?: 'warning' | 'info' | 'success' | 'error' | 'question' }} opts
 */
export function alertaMensaje({ titulo = 'Atención', texto, icon = 'info' }) {
  return Swal.fire({
    ...swalErrorBase,
    icon,
    title: titulo,
    text: texto || '',
  });
}

/** Toasts (esquina superior derecha) */
const toastBase = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
});

export function alertaExito(titulo, texto = '') {
  return toastBase.fire({ icon: 'success', title: titulo, text: texto });
}

export function alertaError(titulo, texto = '') {
  return toastBase.fire({ icon: 'error', title: titulo, text: texto });
}

export function alertaInfo(titulo, texto = '') {
  return toastBase.fire({ icon: 'info', title: titulo, text: texto });
}

/**
 * Confirmación genérica (título/texto/botones personalizables).
 * Si el texto del botón o el título sugieren “eliminar”, el botón de confirmación usa rojo.
 */
export async function confirmarAccion({
  titulo,
  texto = '',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  icon = 'warning',
  confirmButtonColor,
}) {
  const pareceEliminar =
    /eliminar/i.test(String(confirmButtonText)) || /eliminar/i.test(String(titulo ?? ''));
  const res = await Swal.fire({
    title: titulo,
    text: texto,
    icon,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: confirmButtonColor ?? (pareceEliminar ? '#dc2626' : '#2563eb'),
    cancelButtonColor: '#64748b',
    width: swalAncho,
  });
  return res.isConfirmed;
}
