import api from '../api';

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
  return [];
}

export async function listarInasistenciasApi() {
  const { data } = await api.get('/inasistencias');
  return data;
}

export async function obtenerInasistenciaApi(id) {
  const { data } = await api.get(`/inasistencias/${id}`);
  return data;
}

export async function crearInasistenciaApi(payload) {
  try {
    const { data } = await api.post('/inasistencias', payload);
    return data;
  } catch (error) {
    const validacion = extraerErrores422(error);
    if (validacion) {
      error.validation = validacion;
    }
    throw error;
  }
}

export async function actualizarInasistenciaApi(id, payload) {
  try {
    const { data } = await api.put(`/inasistencias/${id}`, payload);
    return data;
  } catch (error) {
    const validacion = extraerErrores422(error);
    if (validacion) {
      error.validation = validacion;
    }
    throw error;
  }
}

export async function eliminarInasistenciaApi(id) {
  const { data } = await api.delete(`/inasistencias/${id}`);
  return data;
}
