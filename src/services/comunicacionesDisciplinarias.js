import api from './api';
import { crearPeticionCompartida } from '../utils/peticionCompartida';

const RUTA = '/comunicaciones_disciplinarias';

const ejecutarGetComunicacionesLista = crearPeticionCompartida(async () => {
  const { data } = await api.get(RUTA);
  return data;
});

export function extraerFilasComunicaciones(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((r) => r != null && typeof r === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((r) => r != null && typeof r === 'object');
  return [];
}

export function normalizarRegistroComunicacion(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  if (cuerpo.cod_disciplinario != null) return cuerpo;
  const capas = [cuerpo.data, cuerpo.item];
  for (const capa of capas) {
    if (capa != null && typeof capa === 'object' && !Array.isArray(capa) && capa.cod_disciplinario != null) {
      return capa;
    }
  }
  if (cuerpo.data != null && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data)) {
    return cuerpo.data;
  }
  return null;
}

export function codigoDisciplinarioDesde(registro) {
  const r = normalizarRegistroComunicacion(registro) ?? registro;
  if (!r || typeof r !== 'object') return null;
  if (r.cod_disciplinario != null && r.cod_disciplinario !== '') return r.cod_disciplinario;
  return null;
}

export async function getComunicacionesDisciplinarias(opciones = {}) {
  return ejecutarGetComunicacionesLista(opciones);
}

export async function getComunicacionDisciplinariaById(cod) {
  const { data } = await api.get(`${RUTA}/${cod}`);
  return data;
}

export async function createComunicacionDisciplinaria(cuerpo) {
  const { data } = await api.post(RUTA, cuerpo);
  return data;
}

export async function updateComunicacionDisciplinaria(cod, cuerpo) {
  const { data } = await api.put(`${RUTA}/${cod}`, cuerpo);
  return data;
}

export async function patchComunicacionDisciplinaria(cod, cuerpo) {
  const { data } = await api.patch(`${RUTA}/${cod}`, cuerpo);
  return data;
}

export async function deleteComunicacionDisciplinaria(cod) {
  const { data } = await api.delete(`${RUTA}/${cod}`);
  return data;
}
