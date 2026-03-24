import api from './api';

/** Respuestas tipo `{ message, data: [] }` o lista plana. */
export function extraerFilasIncapacidades(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((r) => r != null && typeof r === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((r) => r != null && typeof r === 'object');
  return [];
}

export function normalizarRegistroIncapacidad(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  if (cuerpo.cod_incapacidad != null) return cuerpo;
  const capas = [cuerpo.data, cuerpo.incapacidad, cuerpo.item];
  for (const capa of capas) {
    if (capa != null && typeof capa === 'object' && !Array.isArray(capa) && capa.cod_incapacidad != null) {
      return capa;
    }
  }
  return cuerpo.data && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data) ? cuerpo.data : null;
}

export function codigoIncapacidadDesde(registro) {
  const r = normalizarRegistroIncapacidad(registro) ?? registro;
  if (!r || typeof r !== 'object') return null;
  if (r.cod_incapacidad != null && r.cod_incapacidad !== '') return r.cod_incapacidad;
  if (r.id != null && r.id !== '') return r.id;
  return null;
}

export async function getIncapacidades() {
  const { data } = await api.get('/incapacidades');
  return data;
}

export async function getIncapacidadById(cod) {
  const { data } = await api.get(`/incapacidades/${cod}`);
  return data;
}

export async function createIncapacidad(cuerpo) {
  const { data } = await api.post('/incapacidades', cuerpo);
  return data;
}

export async function updateIncapacidad(cod, cuerpo) {
  const { data } = await api.put(`/incapacidades/${cod}`, cuerpo);
  return data;
}

export async function patchIncapacidad(cod, cuerpo) {
  const { data } = await api.patch(`/incapacidades/${cod}`, cuerpo);
  return data;
}

export async function deleteIncapacidad(cod) {
  const { data } = await api.delete(`/incapacidades/${cod}`);
  return data;
}
