import api from '../api';
import { CLAVES_LISTAS } from '../../utils/cacheListaSesion';
import { crearPeticionCompartida, TTL_CACHE_LISTAS_MS } from '../../utils/peticionCompartida';

const ejecutarListarCalendarioActividades = crearPeticionCompartida(async () => {
  const { data } = await api.get('/calendario-actividades');
  return data;
}, { ttlMs: TTL_CACHE_LISTAS_MS, claveSesion: CLAVES_LISTAS.ACTIVIDADES });

function adjuntarValidacion422(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status !== 422 || !data || typeof data !== 'object') return;
  error.validation = {
    message: data.message || 'Datos no validos.',
    errors: data.errors && typeof data.errors === 'object' ? data.errors : {},
  };
}

export function extraerActividadesApi(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

export function extraerActividadApi(json) {
  if (!json || typeof json !== 'object') return null;
  if (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) return json.data;
  if (json.cod_actividad != null) return json;
  return null;
}

export async function listarCalendarioActividadesApi(opciones = {}) {
  return ejecutarListarCalendarioActividades(opciones);
}

export function invalidarCacheListaCalendarioActividades() {
  ejecutarListarCalendarioActividades.invalidar();
}

export async function obtenerCalendarioActividadApi(codActividad) {
  const { data } = await api.get(`/calendario-actividades/${codActividad}`);
  return data;
}

export async function crearCalendarioActividadApi(payload) {
  try {
    const { data } = await api.post('/calendario-actividades', payload);
    invalidarCacheListaCalendarioActividades();
    return data;
  } catch (error) {
    adjuntarValidacion422(error);
    throw error;
  }
}

export async function actualizarCalendarioActividadApi(codActividad, payload) {
  try {
    const { data } = await api.put(`/calendario-actividades/${codActividad}`, payload);
    invalidarCacheListaCalendarioActividades();
    return data;
  } catch (error) {
    adjuntarValidacion422(error);
    throw error;
  }
}

export async function eliminarCalendarioActividadApi(codActividad) {
  const { data } = await api.delete(`/calendario-actividades/${codActividad}`);
  invalidarCacheListaCalendarioActividades();
  return data;
}
