function Modal({ mostrar, cerrar, titulo, children }) {
  if (!mostrar) return null;

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="modal-cerrar" onClick={cerrar}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;


