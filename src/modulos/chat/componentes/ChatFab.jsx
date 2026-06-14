import { createPortal } from 'react-dom';
import IconoBuho from '../../../componentes/comunes/IconoBuho';

/**
 * Portal a document.body. Esquina inferior derecha, compacto para no tapar Acciones.
 */
function ChatFab({ onClick }) {
  return createPortal(
    <button
      type="button"
      className="chat-asistente-fab"
      onClick={onClick}
      aria-label="Abrir asistente de RRHH"
      title="Asistente Talent Sphere"
    >
      <IconoBuho className="chat-asistente-buho--fab chat-asistente-buho--fab-inner" title="" />
    </button>,
    document.body,
  );
}

export default ChatFab;
