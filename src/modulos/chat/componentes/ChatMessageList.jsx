import { useEffect, useRef, Fragment } from 'react';

/** Convierte **negrita** del backend en <strong>; resto texto plano. */
function fragmentosMarkdownLigero(texto) {
  const s = String(texto ?? '');
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function formatearHora(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function ChatMessageList({ mensajes, cargando, vacioSilencioso = false }) {
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  if (cargando && (!mensajes || mensajes.length === 0)) {
    return (
      <div className="chat-asistente-mensajes chat-asistente-mensajes--vacio">
        <p className="chat-asistente-placeholder">Cargando conversación…</p>
      </div>
    );
  }

  if (!mensajes?.length) {
    if (vacioSilencioso) return null;
    return (
      <div className="chat-asistente-mensajes chat-asistente-mensajes--vacio">
        <p className="chat-asistente-placeholder">
          Escribe una consulta sobre el uso de Talent Sphere o elige una sugerencia abajo. El asistente no sustituye
          asesoría legal ni datos de expediente.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-asistente-mensajes" role="log" aria-live="polite" aria-relevant="additions">
      {mensajes.map((m) => {
        const esUsuario = String(m.rol || '').toLowerCase() === 'usuario';
        return (
          <div
            key={String(m.cod_chat_mensaje ?? `${m.rol}-${m.created_at}-${m.contenido?.slice(0, 20)}`)}
            className={`chat-asistente-burbuja ${esUsuario ? 'chat-asistente-burbuja--usuario' : 'chat-asistente-burbuja--asistente'}`}
          >
            <span className="chat-asistente-burbuja-rol">{esUsuario ? 'Tú' : 'Asistente'}</span>
            <p className="chat-asistente-burbuja-texto">
              {esUsuario ? m.contenido : fragmentosMarkdownLigero(m.contenido)}
            </p>
            <time className="chat-asistente-burbuja-hora" dateTime={m.created_at}>
              {formatearHora(m.created_at)}
            </time>
          </div>
        );
      })}
      <div ref={finRef} />
    </div>
  );
}

export default ChatMessageList;
