import api from './api';

/** Respuestas tipo `{ message, data: [] }` o lista plana. */
export function extraerFilasIncapacidades(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((r) => r != null && typeof r === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((r) => r != null && typeof r === 'object');
  return [];
}

export function extraerFilasCatalogo(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((r) => r != null && typeof r === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((r) => r != null && typeof r === 'object');
  return [];
}

/** `GET /incapacidades/resumen` → objeto numérico en data. */
export function extraerResumenIncapacidades(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  const d = cuerpo.data;
  if (d && typeof d === 'object' && !Array.isArray(d) && Object.prototype.hasOwnProperty.call(d, 'total')) return d;
  if (Object.prototype.hasOwnProperty.call(cuerpo, 'total')) return cuerpo;
  return null;
}

/**
 * Show: `{ data: { incapacidad, distribucion_pagos } }`
 */
export function parseDetalleIncapacidad(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') {
    return { incapacidad: null, distribucion_pagos: null };
  }
  const capa = cuerpo.data && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data) ? cuerpo.data : cuerpo;
  const incapacidad =
    capa?.incapacidad && typeof capa.incapacidad === 'object' ? capa.incapacidad : null;
  const distribucion_pagos =
    capa?.distribucion_pagos && typeof capa.distribucion_pagos === 'object' ? capa.distribucion_pagos : null;
  return { incapacidad, distribucion_pagos };
}

export function nombreTipoIncapacidadDesdeFila(row) {
  if (!row || typeof row !== 'object') return '—';
  const t = row.tipoIncapacidad ?? row.tipo_incapacidad;
  if (t && typeof t === 'object') {
    const n = t.nombre_tipo ?? t.clave_normativa;
    return n != null && String(n).trim() !== '' ? String(n) : '—';
  }
  if (typeof t === 'string' && t.trim() !== '') return t;
  return '—';
}

export function normalizarRegistroIncapacidad(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  if (cuerpo.cod_incapacidad != null) return cuerpo;
  if (cuerpo.data?.incapacidad != null && typeof cuerpo.data.incapacidad === 'object' && cuerpo.data.incapacidad.cod_incapacidad != null) {
    return cuerpo.data.incapacidad;
  }
  if (cuerpo.incapacidad != null && typeof cuerpo.incapacidad === 'object' && cuerpo.incapacidad.cod_incapacidad != null) {
    return cuerpo.incapacidad;
  }
  const capas = [cuerpo.data, cuerpo.item];
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

export async function getResumenIncapacidades() {
  const { data } = await api.get('/incapacidades/resumen');
  return data;
}

export async function getTiposIncapacidad() {
  const { data } = await api.get('/tipos-incapacidad');
  return data;
}

export async function getClasificacionesEnfermedad() {
  const { data } = await api.get('/clasificaciones-enfermedad');
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
