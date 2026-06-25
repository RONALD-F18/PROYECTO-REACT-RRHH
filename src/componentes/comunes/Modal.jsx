import { useCallback } from 'react';
import { confirmarCierreModal } from './ConfirmCloseModal';

function Modal({
  mostrar,
  cerrar,
  titulo,
  children,
  classNameContenedor = '',
  confirmarAlCerrar = false,
  mensajeConfirmarCierre,
}) {
  const manejarOverlay = useCallback(async () => {
    if (confirmarAlCerrar) {
      const ok = await confirmarCierreModal(
        mensajeConfirmarCierre ? { mensaje: mensajeConfirmarCierre } : undefined,
      );
      if (!ok) return;
    }
    cerrar();
  }, [cerrar, confirmarAlCerrar, mensajeConfirmarCierre]);

  const manejarCerrar = useCallback(async () => {
    if (confirmarAlCerrar) {
      const ok = await confirmarCierreModal(
        mensajeConfirmarCierre ? { mensaje: mensajeConfirmarCierre } : undefined,
      );
      if (!ok) return;
    }
    cerrar();
  }, [cerrar, confirmarAlCerrar, mensajeConfirmarCierre]);

  if (!mostrar) return null;

  const clasesContenedor = ['modal-contenido', classNameContenedor].filter(Boolean).join(' ');

  return (
    <div className="modal-overlay" onClick={manejarOverlay}>
      <div className={clasesContenedor} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button type="button" className="modal-cerrar" onClick={manejarCerrar}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
