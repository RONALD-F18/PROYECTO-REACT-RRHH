import api from '../api';
import {
  crearPeticionCompartida,
  invalidarEjecutorCompartido,
} from '../../utils/peticionCompartida';

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

/**
 * GET /inasistencias?cod_empleado=&mes=&anio=
 */
export async function listarInasistenciasFiltradasApi(params = {}) {
  const search = new URLSearchParams();
  if (params.cod_empleado != null && params.cod_empleado !== '') {
    search.set('cod_empleado', String(params.cod_empleado));
  }
  if (params.mes != null && params.mes !== '') search.set('mes', String(params.mes));
  if (params.anio != null && params.anio !== '') search.set('anio', String(params.anio));
  const q = search.toString();
  const url = q ? `/inasistencias?${q}` : '/inasistencias';
  const { data } = await api.get(url);
  return data;
}

/**
 * Historial completo de un empleado: GET /empleados/{cod}/inasistencias
 */
export async function listarInasistenciasEmpleadoApi(codEmpleado, params = {}) {
  const search = new URLSearchParams();
  if (params.mes != null && params.mes !== '') search.set('mes', String(params.mes));
  if (params.anio != null && params.anio !== '') search.set('anio', String(params.anio));
  const q = search.toString();
  const base = `/empleados/${encodeURIComponent(String(codEmpleado))}/inasistencias`;
  const url = q ? `${base}?${q}` : base;
  const { data } = await api.get(url);
  return data;
}

export function invalidarCacheListaInasistencias() {
  invalidarEjecutorCompartido(ejecutarListarInasistencias);
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

/** DELETE /empleados/{cod}/inasistencias — elimina todas las de un empleado. */
export async function eliminarTodasInasistenciasEmpleadoApi(codEmpleado) {
  const { data } = await api.delete(
    `/empleados/${encodeURIComponent(String(codEmpleado))}/inasistencias`,
  );
  invalidarCacheListaInasistencias();
  return data;
}
