import api from '../api';

function filasDesdeRespuesta(body) {
  if (!body) return [];
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
}

/** Solo a-z, 0-9, _, máx. 50 (contrato backend). Si es inválido, no se envía query. */
export function normalizarModuloAyudaQuery(modulo) {
  const s = String(modulo ?? '')
    .trim()
    .toLowerCase();
  if (!s || s.length > 50) return null;
  if (!/^[a-z0-9_]+$/.test(s)) return null;
  return s;
}

/**
 * GET /chat/ayuda
 * Opcional: ?modulo=prestaciones_sociales — el servidor filtra; inválido → sin query (todo).
 * Respuesta: data[], sugerencias_rapidas[] (etiqueta, enviar, modulo, cod_entrada_ayuda).
 * POST mensajes puede incluir `modulo_ayuda` (misma clave que ?modulo=) si el backend lo reconoce.
 * Respuesta típica: `mensaje_usuario`, `mensaje_asistente`, opcional `presentacion_chat` (registro_estilo, sugerencias_relacionadas + chips).
 */
export async function getAyudaChat(modulo) {
  const mod = normalizarModuloAyudaQuery(modulo);
  const params = mod ? { modulo: mod } : {};
  const { data } = await api.get('/chat/ayuda', { params });
  return data;
}

/** GET /chat/conversaciones */
export async function listarConversacionesChat() {
  const { data } = await api.get('/chat/conversaciones');
  return { ...data, data: filasDesdeRespuesta(data) };
}

/** POST /chat/conversaciones */
export async function crearConversacionChat(payload = {}) {
  const { data } = await api.post('/chat/conversaciones', payload);
  const conv = data?.data ?? data;
  return { ...data, data: conv };
}

/** DELETE /chat/conversaciones/:id */
export async function eliminarConversacionChat(cod) {
  const { data } = await api.delete(`/chat/conversaciones/${cod}`);
  return data;
}

/** GET /chat/conversaciones/:id/mensajes */
export async function listarMensajesChat(codConversacion) {
  const { data } = await api.get(`/chat/conversaciones/${codConversacion}/mensajes`);
  return { ...data, data: filasDesdeRespuesta(data) };
}

/**
 * POST /chat/conversaciones/:id/mensajes
 * @param {string} contenido
 * @param {{ moduloAyuda?: string | null }} [opciones] — si el backend lo acepta, fija el contexto RRHH (misma clave que GET /chat/ayuda?modulo=).
 */
export async function enviarMensajeChat(codConversacion, contenido, opciones = {}) {
  const mod = normalizarModuloAyudaQuery(opciones.moduloAyuda);
  const body = mod ? { contenido, modulo_ayuda: mod } : { contenido };
  const { data } = await api.post(`/chat/conversaciones/${codConversacion}/mensajes`, body);
  return data;
}
