import api from '../api';
import { crearPeticionCompartida } from '../../utils/peticionCompartida';

const ejecutarListarInasistencias = crearPeticionCompartida(async () => {
  const { data } = await api.get('/inasistencias');
  return data;
});

function extraerErrores422(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status !== 422 || !data || typeof data !== 'object') return null;
  return {
    message: data.message || 'Datos no validos.',
    errors: data.errors && typeof data.errors === 'object' ? data.errors : {},
  };
}

export function extraerInasistenciasApi(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  if (json.data?.data && Array.isArray(json.data.data)) return json.data.data;
  return [];
}

export async function listarInasistenciasApi(opciones = {}) {
  return ejecutarListarInasistencias(opciones);
}

export function invalidarCacheListaInasistencias() {
  ejecutarListarInasistencias.invalidar();
}

export async function obtenerInasistenciaApi(id) {
  const { data } = await api.get(`/inasistencias/${id}`);
  return data;
}

export async function crearInasistenciaApi(payload) {
  try {
    const { data } = await api.post('/inasistencias', payload);
    invalidarCacheListaInasistencias();
    return data;
  } catch (error) {
    const err422 = extraerErrores422(error);
    if (err422) {
      const e = new Error(err422.message);
      e.errors = err422.errors;
      throw e;
    }
    throw error;
  }
}

export async function actualizarInasistenciaApi(id, payload) {
  try {
    const { data } = await api.put(`/inasistencias/${id}`, payload);
    invalidarCacheListaInasistencias();
    return data;
  } catch (error) {
    const err422 = extraerErrores422(error);
    if (err422) {
      const e = new Error(err422.message);
      e.errors = err422.errors;
      throw e;
    }
    throw error;
  }
}

export async function eliminarInasistenciaApi(id) {
  const { data } = await api.delete(`/inasistencias/${id}`);
  invalidarCacheListaInasistencias();
  return data;
}
