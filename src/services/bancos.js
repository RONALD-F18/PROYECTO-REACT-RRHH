import api from './api';

export function extraerFilasBancos(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((b) => b && typeof b === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((b) => b && typeof b === 'object');
  return [];
}

export async function getBancos() {
  const { data } = await api.get('/bancos');
  return data;
}

export async function getBancoById(codBanco) {
  const { data } = await api.get(`/bancos/${codBanco}`);
  return data;
}
