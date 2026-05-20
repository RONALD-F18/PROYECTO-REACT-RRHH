import api from './api';
import { crearPeticionCompartida, TTL_CACHE_LISTAS_MS } from '../utils/peticionCompartida';

const ejecutarGetContratosLista = crearPeticionCompartida(async () => {
  const { data } = await api.get('/contratos');
  return data;
}, { ttlMs: TTL_CACHE_LISTAS_MS });

export function extraerFilasContratos(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((c) => c != null && typeof c === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((c) => c != null && typeof c === 'object');
  return [];
}

export function normalizarRegistroContrato(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  if (cuerpo.cod_contrato != null) return cuerpo;
  const caps = [cuerpo.data, cuerpo.contrato, cuerpo.Contrato];
  for (const capa of caps) {
    if (capa != null && typeof capa === 'object' && !Array.isArray(capa) && capa.cod_contrato != null) {
      return capa;
    }
  }
  if (cuerpo.data != null && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data)) {
    return cuerpo.data;
  }
  return cuerpo;
}

export function codigoContratoDesde(registro) {
  const c = normalizarRegistroContrato(registro) ?? registro;
  if (!c || typeof c !== 'object') return null;
  const n = Number(c.cod_contrato);
  return Number.isFinite(n) ? n : null;
}

/** Contrato que sigue contando como vigente para reglas de negocio (solo ACTIVO). */
export function esContratoVigenteParaEmpleado(estadoContrato) {
  return String(estadoContrato || '').toUpperCase() === 'ACTIVO';
}

export async function getContratos(opciones = {}) {
  return ejecutarGetContratosLista(opciones);
}

export function invalidarCacheListaContratos() {
  ejecutarGetContratosLista.invalidar();
}

export async function getContratoById(codContrato) {
  const { data } = await api.get(`/contratos/${codContrato}`);
  return data;
}

export async function createContrato(cuerpo) {
  const { data } = await api.post('/contratos', cuerpo);
  invalidarCacheListaContratos();
  return data;
}

export async function putContrato(codContrato, cuerpo) {
  const { data } = await api.put(`/contratos/${codContrato}`, cuerpo);
  invalidarCacheListaContratos();
  return data;
}

export async function patchContrato(codContrato, cuerpo) {
  const { data } = await api.patch(`/contratos/${codContrato}`, cuerpo);
  invalidarCacheListaContratos();
  return data;
}

export async function deleteContrato(codContrato) {
  const { data } = await api.delete(`/contratos/${codContrato}`);
  invalidarCacheListaContratos();
  return data;
}
