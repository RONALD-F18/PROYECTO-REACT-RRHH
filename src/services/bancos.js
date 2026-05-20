import api from './api';
import { crearPeticionCompartida, TTL_CACHE_LISTAS_MS } from '../utils/peticionCompartida';

const ejecutarGetBancosLista = crearPeticionCompartida(async () => {
  const { data } = await api.get('/bancos');
  return data;
}, { ttlMs: TTL_CACHE_LISTAS_MS });

export function extraerFilasBancos(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((b) => b && typeof b === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((b) => b && typeof b === 'object');
  return [];
}

export async function getBancos(opciones = {}) {
  return ejecutarGetBancosLista(opciones);
}

export async function getBancoById(codBanco) {
  const { data } = await api.get(`/bancos/${codBanco}`);
  return data;
}
