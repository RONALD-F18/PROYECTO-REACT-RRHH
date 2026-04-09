import { useState, useCallback, forwardRef } from 'react';

const MAX = 8000;

const ChatInput = forwardRef(function ChatInput({ onEnviar, deshabilitado, errorInline }, ref) {
  const [texto, setTexto] = useState('');

  const enviar = useCallback(() => {
    const t = texto.trim();
    if (!t || deshabilitado) return;
    void onEnviar(t);
    setTexto('');
  }, [deshabilitado, onEnviar, texto]);

  return (
    <div className="chat-asistente-input-wrap">
      <p className="chat-asistente-input-hint">¿Prefieres escribir? Usa el cuadro de abajo (opcional).</p>
      {errorInline ? (
        <p className="chat-asistente-input-error" role="alert">
          {errorInline}
        </p>
      ) : null}
      <div className="chat-asistente-input-fila">
        <label htmlFor="chat-asistente-textarea" className="visually-hidden">
          Mensaje para el asistente
        </label>
        <textarea
          ref={ref}
          id="chat-asistente-textarea"
          className="chat-asistente-textarea"
          rows={2}
          maxLength={MAX}
          placeholder="Escribe tu consulta…"
          value={texto}
          disabled={deshabilitado}
          onChange={(e) => setTexto(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
        />
        <button
          type="button"
          className="chat-asistente-btn-enviar"
          disabled={deshabilitado || !texto.trim()}
          onClick={enviar}
        >
          {deshabilitado ? '…' : 'Enviar'}
        </button>
      </div>
      <span className="chat-asistente-contador">{texto.length}/{MAX}</span>
    </div>
  );
});

export default ChatInput;
