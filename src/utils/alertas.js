import Swal from 'sweetalert2';

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

export async function confirmarAccion({
  titulo,
  texto,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  icon = 'warning',
}) {
  const res = await Swal.fire({
    title: titulo,
    text: texto,
    icon,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText,
    cancelButtonText,
  });
  return res.isConfirmed;
}
