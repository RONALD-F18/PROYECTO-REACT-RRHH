import { createPortal } from 'react-dom';
import IconoBuho from '../../../componentes/comunes/IconoBuho';

/**
 * Portal a document.body para que ningún padre (overflow/transform) lo oculte.
 * z-index por debajo del modal del chat (9999).
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
