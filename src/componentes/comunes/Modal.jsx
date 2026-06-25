import { createContext, useCallback, useContext } from 'react';
import { confirmarCierreModal } from './ConfirmCloseModal';

const ModalCierreContext = createContext(null);

/** Cierre del modal con confirmación si el Modal tiene `confirmarAlCerrar`. */
export function useSolicitarCierreModal() {
  return useContext(ModalCierreContext);
}

/** Botón cancelar que respeta la confirmación del modal padre. */
export function BotonCancelarModal({
  className = 'btn-cancelar',
  disabled = false,
  children = 'Cancelar',
  onClick,
}) {
  const solicitarCierre = useSolicitarCierreModal();
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        solicitarCierre?.();
      }}
    >
      {children}
    </button>
  );
}

function Modal({
  mostrar,
  cerrar,
  titulo,
  children,
  classNameContenedor = '',
  confirmarAlCerrar = false,
  mensajeConfirmarCierre,
}) {
  const cerrarSeguro = useCallback(async () => {
    if (confirmarAlCerrar) {
      const ok = await confirmarCierreModal(
        mensajeConfirmarCierre ? { mensaje: mensajeConfirmarCierre } : undefined,
      );
      if (!ok) return;
    }
    cerrar();
  }, [cerrar, confirmarAlCerrar, mensajeConfirmarCierre]);

  const manejarOverlay = useCallback(async () => {
    await cerrarSeguro();
  }, [cerrarSeguro]);

  const manejarCerrar = useCallback(async () => {
    await cerrarSeguro();
  }, [cerrarSeguro]);

  if (!mostrar) return null;

  const clasesContenedor = ['modal-contenido', classNameContenedor].filter(Boolean).join(' ');

  return (
    <ModalCierreContext.Provider value={cerrarSeguro}>
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
    </ModalCierreContext.Provider>
  );
}

export default Modal;
