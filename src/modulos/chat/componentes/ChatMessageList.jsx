import { useEffect, useRef, Fragment, useMemo } from 'react';

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

function esRolUsuario(m) {
  return String(m?.rol || '').toLowerCase() === 'usuario';
}

function mensajeCoincideAncla(m, ancla) {
  if (!ancla || !esRolUsuario(m)) return false;
  if (ancla.usuarioCod != null && ancla.usuarioCod !== '') {
    if (String(m.cod_chat_mensaje) === String(ancla.usuarioCod)) return true;
  }
  if (ancla.usuarioCreatedAt && m.created_at) {
    if (String(m.created_at) === String(ancla.usuarioCreatedAt)) return true;
  }
  return false;
}

/** Chips solo tras el mensaje de usuario del turno, antes del siguiente bloque (asistente o fin). */
function debeMostrarChipsTrasUsuario(m, indice, ordenados, ancla, chips) {
  if (!chips?.length || !ancla) return false;
  if (!mensajeCoincideAncla(m, ancla)) return false;
  const siguiente = ordenados[indice + 1];
  if (!siguiente) return true;
  return !esRolUsuario(siguiente);
}

function truncar(texto, max = 44) {
  const t = String(texto || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * @param {object} props
 * @param {Array} props.mensajes
 * @param {boolean} props.cargando
 * @param {boolean} [props.vacioSilencioso]
 * @param {{ usuarioCod?: string|number|null, usuarioCreatedAt?: string|null }|null} [props.anclaSugerencias]
 * @param {Array<{key: string, etiqueta: string, enviar: string}>} [props.chipsDebajoUsuario]
 * @param {string} [props.registroEstilo] 'mensajeria' | otro
 * @param {(texto: string) => void} [props.onChipEnviar]
 * @param {boolean} [props.chipsDeshabilitados]
 */
function ChatMessageList({
  mensajes,
  cargando,
  vacioSilencioso = false,
  anclaSugerencias = null,
  chipsDebajoUsuario = [],
  registroEstilo = 'mensajeria',
  onChipEnviar,
  chipsDeshabilitados = false,
}) {
  const finRef = useRef(null);
  const esMensajeria = String(registroEstilo || 'mensajeria').toLowerCase() === 'mensajeria';

  const ordenados = useMemo(() => {
    if (!mensajes?.length) return [];
    return [...mensajes].sort((a, b) => {
      const ta = new Date(a?.created_at || 0).getTime();
      const tb = new Date(b?.created_at || 0).getTime();
      return ta - tb;
    });
  }, [mensajes]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando, chipsDebajoUsuario]);

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

  const claseLista = [
    'chat-asistente-mensajes',
    esMensajeria ? 'chat-asistente-mensajes--mensajeria' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={claseLista} role="log" aria-live="polite" aria-relevant="additions">
      {ordenados.map((m, i) => {
        const esUsuario = esRolUsuario(m);
        const key = String(m.cod_chat_mensaje ?? `${m.rol}-${m.created_at}-${m.contenido?.slice(0, 20)}`);
        const mostrarChips = esMensajeria && debeMostrarChipsTrasUsuario(m, i, ordenados, anclaSugerencias, chipsDebajoUsuario);

        return (
          <Fragment key={key}>
            <div
              className={`chat-asistente-msg-fila ${esUsuario ? 'chat-asistente-msg-fila--usuario' : 'chat-asistente-msg-fila--asistente'}`}
            >
              <div
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
            </div>
            {mostrarChips ? (
              <div
                className="chat-asistente-msg-fila chat-asistente-msg-fila--sugerencias"
                role="group"
                aria-label="Siguientes pasos sugeridos"
              >
                <div className="chat-asistente-chips-bajo-usuario">
                  {chipsDebajoUsuario.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className="chat-asistente-chip-sugerencia"
                      onClick={() => onChipEnviar?.(c.enviar)}
                      disabled={chipsDeshabilitados}
                      title={c.etiqueta}
                    >
                      {truncar(c.etiqueta, 52)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </Fragment>
        );
      })}
      <div ref={finRef} />
    </div>
  );
}

export default ChatMessageList;
