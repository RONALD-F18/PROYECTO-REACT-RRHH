import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getAyudaChat,
  listarConversacionesChat,
  crearConversacionChat,
  eliminarConversacionChat,
  listarMensajesChat,
  enviarMensajeChat,
} from '../../../services/api/chatApi';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import { moduloInicialQueryDesdePathname, procesarRespuestaAyuda } from '../utils/mapearRutaModuloChat';
import {
  normalizarPayloadAyuda,
  respuestaAyudaTieneShapeV2,
  temasAgrupadosParaUi,
} from '../utils/normalizarAyudaApi';
import { normalizarPresentacionChatPost } from '../utils/normalizarPresentacionChat';
import { esSugerenciaFueraDeModulo } from '../utils/filtrarSugerenciasFueraDeModulo';

export function useChatSession(modalAbierto) {
  const { pathname } = useLocation();
  const moduloDesdeRuta = useMemo(() => moduloInicialQueryDesdePathname(pathname), [pathname]);

  const [queryModuloAyuda, setQueryModuloAyuda] = useState(null);
  const [payloadAyudaRaw, setPayloadAyudaRaw] = useState(null);
  const [cargandoAyuda, setCargandoAyuda] = useState(false);
  const [mostrarPanelAyuda, setMostrarPanelAyuda] = useState(true);

  const [conversacionId, setConversacionId] = useState(null);
  const [conversaciones, setConversaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [cargandoInicial, setCargandoInicial] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  /** Último texto enviado (para excluirlo de chips de seguimiento). */
  const [ultimoMensajeEnviado, setUltimoMensajeEnviado] = useState('');
  /**
   * Sugerencias del último POST (sustituyen al turno anterior).
   * Ancla: cod_chat_mensaje del usuario o created_at si el id aún no viene.
   */
  const [postTurnoSugerencias, setPostTurnoSugerencias] = useState(null);
  const conversacionIdRef = useRef(null);
  conversacionIdRef.current = conversacionId;

  const wasModalAbierto = useRef(false);
  const lastPathname = useRef(pathname);

  const ayudaV2 = useMemo(() => normalizarPayloadAyuda(payloadAyudaRaw), [payloadAyudaRaw]);
  const temasUi = useMemo(
    () => temasAgrupadosParaUi(ayudaV2.temasAgrupados, { moduloAyuda: queryModuloAyuda }),
    [ayudaV2.temasAgrupados, queryModuloAyuda],
  );
  const catalogoOrdenado = useMemo(
    () =>
      [...ayudaV2.catalogoModulos].sort((a, b) => Number(a?.orden ?? 0) - Number(b?.orden ?? 0)),
    [ayudaV2.catalogoModulos],
  );

  const legacy = useMemo(() => procesarRespuestaAyuda(payloadAyudaRaw || {}), [payloadAyudaRaw]);
  const esShapeV2 = respuestaAyudaTieneShapeV2(payloadAyudaRaw);

  const cargarMensajes = useCallback(async (cod) => {
    if (cod == null) return [];
    const res = await listarMensajesChat(cod);
    const list = Array.isArray(res.data) ? res.data : [];
    setMensajes(list);
    setPostTurnoSugerencias(null);
    return list;
  }, []);

  /**
   * Query GET ayuda: al abrir el modal o al cambiar de ruta en la app.
   * useLayoutEffect evita un GET inicial con query incorrecta. No pisar si el usuario
   * eligió "Ver todos los módulos" sin cambiar de pantalla.
   */
  useLayoutEffect(() => {
    if (!modalAbierto) {
      wasModalAbierto.current = false;
      return;
    }
    const justOpened = !wasModalAbierto.current;
    const pathChanged = lastPathname.current !== pathname;
    wasModalAbierto.current = true;
    lastPathname.current = pathname;

    if (justOpened || pathChanged) {
      setQueryModuloAyuda(moduloDesdeRuta);
      setMostrarPanelAyuda(true);
    }
  }, [modalAbierto, pathname, moduloDesdeRuta]);

  /** GET ayuda según queryModuloAyuda (null = catálogo). */
  useEffect(() => {
    if (!modalAbierto) return undefined;
    let activo = true;
    setCargandoAyuda(true);
    (async () => {
      try {
        const raw = await getAyudaChat(queryModuloAyuda);
        if (activo) setPayloadAyudaRaw(raw);
      } catch {
        if (activo) setPayloadAyudaRaw(null);
      } finally {
        if (activo) setCargandoAyuda(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [modalAbierto, queryModuloAyuda]);

  const navegarAyudaModulo = useCallback((claveModulo) => {
    if (claveModulo == null || claveModulo === '') {
      setQueryModuloAyuda(null);
    } else {
      setQueryModuloAyuda(String(claveModulo));
    }
    setMostrarPanelAyuda(true);
  }, []);

  const restablecerPanelAyuda = useCallback(() => {
    setMostrarPanelAyuda(true);
  }, []);

  /** Conversación activa al abrir. */
  useEffect(() => {
    if (!modalAbierto) return undefined;
    let activo = true;

    (async () => {
      setCargandoInicial(true);
      setError('');
      try {
        const res = await listarConversacionesChat();
        let lista = Array.isArray(res.data) ? res.data : [];
        if (!activo) return;

        const prev = conversacionIdRef.current;
        const prevValido = prev != null && lista.some((c) => Number(c.cod_chat_conversacion) === Number(prev));

        if (lista.length === 0) {
          const creada = await crearConversacionChat({});
          const nuevoId = creada.data?.cod_chat_conversacion;
          if (!activo) return;
          if (nuevoId == null) throw new Error('No se pudo crear la conversación');
          setConversacionId(Number(nuevoId));
          const res2 = await listarConversacionesChat();
          lista = Array.isArray(res2.data) ? res2.data : [];
          setConversaciones(lista);
          setMensajes([]);
          setMostrarPanelAyuda(true);
          setUltimoMensajeEnviado('');
          setPostTurnoSugerencias(null);
        } else {
          const idUsar = prevValido ? Number(prev) : Number(lista[0].cod_chat_conversacion);
          setConversaciones(lista);
          setConversacionId(idUsar);
          const list = await cargarMensajes(idUsar);
          if (activo) setMostrarPanelAyuda((list || []).length === 0);
        }
      } catch (e) {
        if (activo) {
          setError(mensajeErrorApi(e));
          setMensajes([]);
        }
      } finally {
        if (activo) setCargandoInicial(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [modalAbierto, cargarMensajes]);

  const seleccionarConversacion = useCallback(
    async (cod) => {
      const id = Number(cod);
      if (!Number.isFinite(id)) return;
      setConversacionId(id);
      setErrorEnvio('');
      setUltimoMensajeEnviado('');
      setPostTurnoSugerencias(null);
      setCargandoLista(true);
      try {
        const list = await cargarMensajes(id);
        setMostrarPanelAyuda((list || []).length === 0);
      } catch (e) {
        setError(mensajeErrorApi(e));
      } finally {
        setCargandoLista(false);
      }
    },
    [cargarMensajes],
  );

  const nuevaConversacion = useCallback(async () => {
    setError('');
    setErrorEnvio('');
    setUltimoMensajeEnviado('');
    setPostTurnoSugerencias(null);
    setCargandoLista(true);
    try {
      const creada = await crearConversacionChat({});
      const nuevoId = creada.data?.cod_chat_conversacion;
      if (nuevoId == null) throw new Error('No se pudo crear la conversación');
      const res = await listarConversacionesChat();
      const lista = Array.isArray(res.data) ? res.data : [];
      setConversaciones(lista);
      setConversacionId(Number(nuevoId));
      setMensajes([]);
      setMostrarPanelAyuda(true);
    } catch (e) {
      setError(mensajeErrorApi(e));
    } finally {
      setCargandoLista(false);
    }
  }, []);

  const borrarConversacionActiva = useCallback(async () => {
    if (conversacionId == null) return;
    setError('');
    setUltimoMensajeEnviado('');
    setPostTurnoSugerencias(null);
    setCargandoLista(true);
    try {
      await eliminarConversacionChat(conversacionId);
      const res = await listarConversacionesChat();
      let lista = Array.isArray(res.data) ? res.data : [];
      if (lista.length === 0) {
        const creada = await crearConversacionChat({});
        const nuevoId = creada.data?.cod_chat_conversacion;
        if (nuevoId != null) {
          const res2 = await listarConversacionesChat();
          lista = Array.isArray(res2.data) ? res2.data : [];
          setConversaciones(lista);
          setConversacionId(Number(nuevoId));
          setMensajes([]);
          setMostrarPanelAyuda(true);
        } else {
          setConversaciones([]);
          setConversacionId(null);
          setMensajes([]);
          setPostTurnoSugerencias(null);
        }
      } else {
        setConversaciones(lista);
        const id = Number(lista[0].cod_chat_conversacion);
        setConversacionId(id);
        const list = await cargarMensajes(id);
        setMostrarPanelAyuda((list || []).length === 0);
      }
    } catch (e) {
      setError(mensajeErrorApi(e));
    } finally {
      setCargandoLista(false);
    }
  }, [cargarMensajes, conversacionId]);

  const enviar = useCallback(
    async (texto) => {
      const t = String(texto || '').trim();
      if (!t || conversacionId == null) return;
      setErrorEnvio('');
      setEnviando(true);
      try {
        const res = await enviarMensajeChat(conversacionId, t, { moduloAyuda: queryModuloAyuda });
        const data = res?.data;
        if (data?.mensaje_usuario && data?.mensaje_asistente) {
          const prep = normalizarPresentacionChatPost(data);
          const chipsTurno = prep.chips.filter((c) => !esSugerenciaFueraDeModulo(c, queryModuloAyuda));
          const mu = data.mensaje_usuario;
          setMensajes((prev) => {
            const next = [...prev, data.mensaje_usuario, data.mensaje_asistente];
            return next.sort((a, b) => {
              const ta = new Date(a?.created_at || 0).getTime();
              const tb = new Date(b?.created_at || 0).getTime();
              return ta - tb;
            });
          });
          setPostTurnoSugerencias({
            usuarioCod: mu?.cod_chat_mensaje ?? null,
            usuarioCreatedAt: mu?.created_at ?? null,
            chips: chipsTurno,
            registroEstilo: prep.registroEstilo,
            meta: prep.sugerenciasMeta,
          });
        } else {
          await cargarMensajes(conversacionId);
        }
        const resConv = await listarConversacionesChat();
        setConversaciones(Array.isArray(resConv.data) ? resConv.data : []);
        setMostrarPanelAyuda(false);
        setUltimoMensajeEnviado(t);
      } catch (e) {
        const msg = e?.response?.data?.errors?.contenido?.[0] || mensajeErrorApi(e);
        setErrorEnvio(msg);
      } finally {
        setEnviando(false);
      }
    },
    [cargarMensajes, conversacionId, queryModuloAyuda],
  );

  const reiniciarAlCerrar = useCallback(() => {
    setError('');
    setErrorEnvio('');
  }, []);

  return {
    conversacionId,
    conversaciones,
    mensajes,
    queryModuloAyuda,
    navegarAyudaModulo,
    cargandoAyuda,
    cargandoInicial,
    cargandoLista,
    esShapeV2,
    catalogoModulos: catalogoOrdenado,
    moduloContexto: ayudaV2.moduloContexto,
    accionesNavegacion: ayudaV2.accionesNavegacion,
    temasAgrupadosUi: temasUi,
    sugerenciasRapidasLegacy: legacy.sugerenciasRapidas,
    chipsPalabrasLegacy: legacy.chipsPalabras,
    mostrarPanelAyuda,
    restablecerPanelAyuda,
    cargando: cargandoInicial || cargandoLista,
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
  };
}
