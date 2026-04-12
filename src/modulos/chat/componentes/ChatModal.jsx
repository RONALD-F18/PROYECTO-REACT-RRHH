import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import IconoBuho from '../../../componentes/comunes/IconoBuho';
import { useChatSession } from '../hooks/useChatSession';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import { esSugerenciaFueraDeModulo } from '../utils/filtrarSugerenciasFueraDeModulo';
import { esChipAyudaRuidoso } from '../utils/filtrarRuidoAyuda';

function etiquetaModuloAmigable(clave) {
  const m = {
    general: 'General',
    prestaciones_sociales: 'Prestaciones sociales',
    empleados: 'Empleados',
    contratos: 'Contratos',
    incapacidades: 'Incapacidades',
    afiliaciones: 'Afiliaciones',
    certificaciones: 'Certificaciones',
    inasistencias: 'Inasistencias',
    calendario: 'Calendario',
    reportes: 'Reportes',
    disciplinarias: 'Disciplinarias',
    administracion_usuarios: 'Usuarios',
    autenticacion: 'Acceso',
    asistente_chat: 'Este asistente',
    empresas: 'Empresas',
    cargos: 'Cargos',
    bancos: 'Bancos',
    catalogos_incapacidad: 'Catálogos incapacidad',
    catalogos_afiliacion: 'Catálogos afiliación',
  };
  return m[clave] || String(clave || '').replace(/_/g, ' ');
}

function truncar(texto, max = 46) {
  const t = String(texto || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function ChatModal({ abierto, cerrar }) {
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const chat = useChatSession(abierto);

  const {
    conversacionId,
    conversaciones,
    mensajes,
    queryModuloAyuda,
    navegarAyudaModulo,
    cargandoAyuda,
    esShapeV2,
    catalogoModulos,
    moduloContexto,
    accionesNavegacion,
    temasAgrupadosUi,
    sugerenciasRapidasLegacy,
    chipsPalabrasLegacy,
    mostrarPanelAyuda,
    restablecerPanelAyuda,
    cargando,
    cargandoInicial,
    enviando,
    error,
    errorEnvio,
    seleccionarConversacion,
    nuevaConversacion,
    borrarConversacionActiva,
    ultimoMensajeEnviado,
    postTurnoSugerencias,
    enviar,
    reiniciarAlCerrar,
  } = chat;
  const [ultimoGrupoSeleccionado, setUltimoGrupoSeleccionado] = useState(null);

  const manejarCerrar = useCallback(() => {
    reiniciarAlCerrar();
    cerrar();
  }, [cerrar, reiniciarAlCerrar]);

  const ejecutarAccionNav = useCallback(
    (accion) => {
      if (!accion || typeof accion !== 'object') return;
      const tipo = String(accion.tipo || '');
      if (tipo === 'filtrar_ayuda') {
        const m = accion.parametros?.modulo;
        navegarAyudaModulo(m === undefined || m === null ? null : m);
        return;
      }
      if (tipo === 'foco_input') {
        inputRef.current?.focus();
      }
    },
    [navegarAyudaModulo],
  );

  const enviarDesdeTema = useCallback(
    (grupo, pregunta) => {
      if (!pregunta?.enviar) return;
      setUltimoGrupoSeleccionado({
        key: grupo?.key ?? null,
        titulo: grupo?.titulo ?? 'Tema',
        preguntas: Array.isArray(grupo?.preguntas) ? grupo.preguntas : [],
        enviada: String(pregunta.enviar),
      });
      void enviar(pregunta.enviar);
    },
    [enviar],
  );

  useEffect(() => {
    if (!abierto) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const trap = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        manejarCerrar();
      }
    };
    window.addEventListener('keydown', trap);
    const t = window.setTimeout(() => panelRef.current?.querySelector('textarea, button')?.focus(), 100);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener('keydown', trap);
      window.clearTimeout(t);
    };
  }, [abierto, manejarCerrar]);

  const sugerenciasLegacyFiltradas = useMemo(
    () =>
      sugerenciasRapidasLegacy.filter(
        (c) =>
          !esSugerenciaFueraDeModulo(c, queryModuloAyuda) && !esChipAyudaRuidoso(c.etiqueta, c.enviar),
      ),
    [sugerenciasRapidasLegacy, queryModuloAyuda],
  );

  const sugerenciasRelacionadas = useMemo(() => {
    if (mostrarPanelAyuda) return [];
    const excl = String(ultimoMensajeEnviado || '').trim().toLowerCase();
    const seen = new Set();

    const incluir = (lista, p) => {
      const env = String(p?.enviar || '').trim();
      if (!env) return;
      if (env.toLowerCase() === excl) return;
      if (esChipAyudaRuidoso(p.etiqueta, p.enviar)) return;
      if (esSugerenciaFueraDeModulo(p, queryModuloAyuda)) return;
      const k = env.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      lista.push(p);
    };

    const out = [];
    if (ultimoGrupoSeleccionado?.preguntas?.length) {
      for (const p of ultimoGrupoSeleccionado.preguntas) {
        if (String(p.enviar) === String(ultimoGrupoSeleccionado.enviada)) continue;
        incluir(out, p);
      }
    }
    for (const g of temasAgrupadosUi) {
      for (const p of g.preguntas) {
        if (out.length >= 10) return out;
        incluir(out, p);
      }
    }
    return out.slice(0, 10);
  }, [mostrarPanelAyuda, ultimoGrupoSeleccionado, temasAgrupadosUi, ultimoMensajeEnviado, queryModuloAyuda]);

  const ultimoUsuarioMensaje = useMemo(() => {
    if (!mensajes?.length) return null;
    for (let i = mensajes.length - 1; i >= 0; i--) {
      if (String(mensajes[i].rol || '').toLowerCase() === 'usuario') return mensajes[i];
    }
    return null;
  }, [mensajes]);

  const anclaSugerencias = useMemo(() => {
    if (mostrarPanelAyuda) return null;
    if (postTurnoSugerencias) {
      return {
        usuarioCod: postTurnoSugerencias.usuarioCod,
        usuarioCreatedAt: postTurnoSugerencias.usuarioCreatedAt,
      };
    }
    if (!ultimoUsuarioMensaje) return null;
    return {
      usuarioCod: ultimoUsuarioMensaje.cod_chat_mensaje ?? null,
      usuarioCreatedAt: ultimoUsuarioMensaje.created_at ?? null,
    };
  }, [mostrarPanelAyuda, postTurnoSugerencias, ultimoUsuarioMensaje]);

  const chipsDebajoUsuario = useMemo(() => {
    if (mostrarPanelAyuda) return [];
    if (postTurnoSugerencias?.chips?.length) return postTurnoSugerencias.chips;
    return sugerenciasRelacionadas;
  }, [mostrarPanelAyuda, postTurnoSugerencias, sugerenciasRelacionadas]);

  const registroEstiloChat = postTurnoSugerencias?.registroEstilo || 'mensajeria';

  if (!abierto) return null;

  const enviarDeshabilitado = enviando || cargandoInicial || conversacionId == null;
  const listaVacia = !cargandoInicial && (!mensajes || mensajes.length === 0);

  const tituloContexto = moduloContexto?.etiqueta || (queryModuloAyuda ? etiquetaModuloAmigable(queryModuloAyuda) : 'Módulos');

  const vistaCatalogo = esShapeV2 && queryModuloAyuda == null && catalogoModulos.length > 0;
  const vistaModuloV2 =
    esShapeV2 &&
    queryModuloAyuda != null &&
    (moduloContexto != null || temasAgrupadosUi.length > 0 || accionesNavegacion.length > 0);

  const legacyHay =
    sugerenciasLegacyFiltradas.length > 0 || chipsPalabrasLegacy.length > 0;
  const mostrarLegacy =
    mostrarPanelAyuda &&
    legacyHay &&
    (!esShapeV2 || (!vistaCatalogo && !vistaModuloV2 && !cargandoAyuda));

  const mostrarTemasModulo = mostrarPanelAyuda && vistaModuloV2 && temasAgrupadosUi.length > 0;
  const mostrarAcciones = mostrarPanelAyuda && vistaModuloV2 && accionesNavegacion.length > 0;
  const mostrarCatalogo = mostrarPanelAyuda && vistaCatalogo;

  const hayPanelSoloAcciones =
    mostrarPanelAyuda &&
    vistaModuloV2 &&
    mostrarAcciones &&
    !mostrarTemasModulo &&
    !mostrarCatalogo &&
    !mostrarLegacy;

  const hayPanelTemasVisible =
    mostrarPanelAyuda &&
    (mostrarCatalogo || mostrarTemasModulo || mostrarLegacy || hayPanelSoloAcciones);

  const renderPanelAyudaContenido = () => {
    if (mostrarCatalogo) {
      return (
        <section className="chat-asistente-suggest-box" aria-label="Áreas del sistema">
          <p className="chat-asistente-catalogo-titulo">Elige un módulo</p>
          <div className="chat-asistente-catalogo-grid">
            {catalogoModulos.map((item, i) => {
              const modTarget = item?.parametros?.modulo ?? item?.clave;
              const key = `${item?.clave ?? i}-${String(modTarget ?? '')}`;
              return (
                <button
                  key={key}
                  type="button"
                  className="chat-asistente-modulo-card"
                  onClick={() => navegarAyudaModulo(modTarget != null && modTarget !== '' ? String(modTarget) : null)}
                >
                  <span className="chat-asistente-modulo-card-titulo">{truncar(item.etiqueta || item.clave, 30)}</span>
                </button>
              );
            })}
          </div>
        </section>
      );
    }

    if (mostrarTemasModulo) {
      return (
        <section className="chat-asistente-suggest-box" aria-label="Preguntas por tema">
          <p className="chat-asistente-pills-contexto">
            Módulo: <strong>{truncar(tituloContexto, 32)}</strong>
          </p>
          {mostrarAcciones ? (
            <div className="chat-asistente-acciones-nav" role="toolbar" aria-label="Acciones">
              {accionesNavegacion.map((a) => (
                <button
                  key={String(a.id ?? a.etiqueta)}
                  type="button"
                  className="chat-asistente-btn-accion-nav"
                  onClick={() => ejecutarAccionNav(a)}
                >
                  {truncar(a.etiqueta, 26)}
                </button>
              ))}
            </div>
          ) : null}
          <div className="chat-asistente-temas-wrap">
            {temasAgrupadosUi.map((grupo) => (
              <div key={grupo.key} className="chat-asistente-tema-grupo">
                <p className="chat-asistente-tema-grupo-titulo">{truncar(grupo.titulo, 56)}</p>
                <div className="chat-asistente-pills-col" role="group">
                  {grupo.preguntas.slice(0, 8).map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className="chat-asistente-pill chat-asistente-pill--principal"
                            onClick={() => enviarDesdeTema(grupo, p)}
                      disabled={enviarDeshabilitado}
                      title={p.etiqueta}
                    >
                      {truncar(p.etiqueta, 42)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (hayPanelSoloAcciones) {
      return (
        <section className="chat-asistente-suggest-box" aria-label="Acciones del módulo">
          <p className="chat-asistente-pills-contexto">
            Módulo: <strong>{truncar(tituloContexto, 32)}</strong>
          </p>
          <div className="chat-asistente-acciones-nav" role="toolbar" aria-label="Acciones">
            {accionesNavegacion.map((a) => (
              <button
                key={String(a.id ?? a.etiqueta)}
                type="button"
                className="chat-asistente-btn-accion-nav"
                onClick={() => ejecutarAccionNav(a)}
              >
                {truncar(a.etiqueta, 26)}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (mostrarLegacy) {
      return (
        <section className="chat-asistente-suggest-box" aria-label="Sugerencias">
          <p className="chat-asistente-pills-contexto">
            Módulo: <strong>{truncar(tituloContexto, 32)}</strong>
          </p>
          {sugerenciasLegacyFiltradas.length > 0 ? (
            <div className="chat-asistente-pills-col" role="group">
              {sugerenciasLegacyFiltradas.slice(0, 8).map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="chat-asistente-pill chat-asistente-pill--principal"
                  onClick={() => void enviar(c.enviar)}
                  disabled={enviarDeshabilitado}
                  title={c.etiqueta}
                >
                  {truncar(c.etiqueta, 36)}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      );
    }

    return null;
  };

  return createPortal(
    <div
      className="chat-asistente-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) manejarCerrar();
      }}
    >
      <div
        className="chat-asistente-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-asistente-titulo"
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="chat-asistente-header">
          <div className="chat-asistente-header-titulo">
            <span className="chat-asistente-buho--modal-header">
              <IconoBuho className="chat-asistente-buho--modal" title="" />
            </span>
            <div>
              <h2 id="chat-asistente-titulo">Asistente RRHH</h2>
              <p className="chat-asistente-subtitulo">
                Elige un área o una pregunta; también puedes escribir abajo. No sustituye asesoría legal ni expediente.
              </p>
            </div>
          </div>
          <button type="button" className="chat-asistente-cerrar" onClick={manejarCerrar} aria-label="Cerrar asistente">
            ×
          </button>
        </header>

        <div className="chat-asistente-cuerpo">
          <aside className="chat-asistente-sidebar" aria-label="Conversaciones">
            <div className="chat-asistente-sidebar-acciones">
              <button type="button" className="chat-asistente-btn-sec" onClick={() => void nuevaConversacion()} disabled={cargando}>
                Nueva conversación
              </button>
              <button
                type="button"
                className="chat-asistente-btn-peligro"
                onClick={() => void borrarConversacionActiva()}
                disabled={cargando || conversacionId == null}
              >
                Eliminar hilo
              </button>
            </div>
            <ul className="chat-asistente-hilos">
              {conversaciones.map((c) => {
                const id = Number(c.cod_chat_conversacion);
                const activo = conversacionId != null && id === Number(conversacionId);
                return (
                  <li key={String(id)}>
                    <button
                      type="button"
                      className={`chat-asistente-hilo ${activo ? 'activo' : ''}`}
                      onClick={() => void seleccionarConversacion(id)}
                    >
                      {c.titulo?.trim() || `Conversación ${id}`}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="chat-asistente-main">
            {error ? (
              <div className="chat-asistente-banner-error" role="alert">
                {error}
              </div>
            ) : null}

            <div className="chat-asistente-hilo-column">
              {cargandoAyuda ? (
                <p className="chat-asistente-placeholder chat-asistente-placeholder--inline chat-asistente-ayuda-cargando">
                  Cargando temas de ayuda…
                </p>
              ) : null}

              <div className="chat-asistente-messages-scroll">
                {listaVacia ? (
                  <div className="chat-asistente-bienvenida">
                    <div className="chat-asistente-burbuja chat-asistente-burbuja--asistente">
                      <span className="chat-asistente-burbuja-rol">Asistente</span>
                      <p className="chat-asistente-burbuja-texto">Hola 👋 Elige un tema o escribe tu consulta.</p>
                    </div>
                  </div>
                ) : null}

                {!mostrarPanelAyuda && mensajes?.length > 0 ? (
                  <div className="chat-asistente-toolbar-chat">
                    <button type="button" className="chat-asistente-mostrar-temas" onClick={restablecerPanelAyuda}>
                      Volver al menú de temas
                    </button>
                  </div>
                ) : null}

                <div className="chat-asistente-chat-zone chat-asistente-chat-zone--principal">
                  <ChatMessageList
                    mensajes={mensajes}
                    cargando={cargandoInicial}
                    vacioSilencioso
                    anclaSugerencias={anclaSugerencias}
                    chipsDebajoUsuario={chipsDebajoUsuario}
                    registroEstilo={registroEstiloChat}
                    onChipEnviar={(txt) => void enviar(txt)}
                    chipsDeshabilitados={enviarDeshabilitado}
                  />
                </div>

                {!cargandoAyuda &&
                esShapeV2 &&
                !mostrarCatalogo &&
                !vistaModuloV2 &&
                !mostrarLegacy &&
                mostrarPanelAyuda &&
                queryModuloAyuda == null ? (
                  <p className="chat-asistente-sin-temas">
                    El servidor aún no devuelve el catálogo de módulos. Cuando esté disponible, verás tarjetas por área
                    (Prestaciones, Empleados…).
                  </p>
                ) : null}

                {!cargandoAyuda &&
                esShapeV2 &&
                queryModuloAyuda != null &&
                !mostrarTemasModulo &&
                !mostrarLegacy &&
                mostrarPanelAyuda ? (
                  <p className="chat-asistente-sin-temas">No hay preguntas sugeridas para este módulo.</p>
                ) : null}
              </div>
            </div>

            {hayPanelTemasVisible ? (
              <div className="chat-asistente-ayuda-compacta" aria-label="Temas de ayuda">
                {renderPanelAyudaContenido()}
              </div>
            ) : null}

            {!mostrarPanelAyuda ? (
              <div className="chat-asistente-ver-sugerencias-bar">
                <button type="button" className="chat-asistente-mostrar-temas" onClick={restablecerPanelAyuda}>
                  Ver sugerencias de temas
                </button>
              </div>
            ) : null}

            <ChatInput ref={inputRef} onEnviar={enviar} deshabilitado={enviarDeshabilitado} errorInline={errorEnvio} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ChatModal;
