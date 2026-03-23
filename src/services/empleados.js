import api from './api';

export function extraerFilasEmpleados(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((e) => e != null && typeof e === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((e) => e != null && typeof e === 'object');
  return [];
}

/**
 * show/store/update: modelo suelto o envuelto en data / empleado (respuestas Laravel habituales).
 */
export function normalizarRegistroEmpleado(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  if (cuerpo.cod_empleado != null) return cuerpo;

  const anidados = [cuerpo.data, cuerpo.empleado, cuerpo.Empleado, cuerpo.item];
  for (const capa of anidados) {
    if (capa != null && typeof capa === 'object' && !Array.isArray(capa) && capa.cod_empleado != null) {
      return capa;
    }
  }
  if (cuerpo.data != null && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data)) {
    return cuerpo.data;
  }
  return cuerpo;
}

/** PK para rutas API (prioriza cod_empleado; algunos listados traen solo id). */
export function codigoEmpleadoDesde(registro) {
  const e = normalizarRegistroEmpleado(registro) ?? registro;
  if (!e || typeof e !== 'object') return null;
  if (e.cod_empleado != null && e.cod_empleado !== '') return e.cod_empleado;
  if (e.id != null && e.id !== '') return e.id;
  return null;
}

export function nombreCompletoEmpleado(e) {
  if (!e || typeof e !== 'object') return '—';
  const n = [e.nombre_empleado, e.apellidos_empleado].filter(Boolean).join(' ').trim();
  return n || '—';
}

export async function getEmpleados() {
  const { data } = await api.get('/empleados');
  return data;
}

export async function getEmpleadoById(codEmpleado) {
  const { data } = await api.get(`/empleados/${codEmpleado}`);
  return data;
}

export async function createEmpleado(cuerpo) {
  const { data } = await api.post('/empleados', cuerpo);
  return data;
}

export async function updateEmpleado(codEmpleado, cuerpo) {
  const { data } = await api.put(`/empleados/${codEmpleado}`, cuerpo);
  return data;
}

export async function patchEmpleado(codEmpleado, cuerpo) {
  const { data } = await api.patch(`/empleados/${codEmpleado}`, cuerpo);
  return data;
}

export async function deleteEmpleado(codEmpleado) {
  const { data } = await api.delete(`/empleados/${codEmpleado}`);
  return data;
}
