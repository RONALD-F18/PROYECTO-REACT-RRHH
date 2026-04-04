import api from './api';
import { crearPeticionCompartida } from '../utils/peticionCompartida';

const ejecutarGetCargosLista = crearPeticionCompartida(async () => {
  const { data } = await api.get('/cargos');
  return data;
});

export function extraerFilasCargos(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((c) => c != null && typeof c === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((c) => c != null && typeof c === 'object');
  return [];
}

export async function getCargos() {
  return ejecutarGetCargosLista();
}

/** Nombre visible del cargo (API suele usar nomb_cargo). */
export function nombreCargoDesde(registro) {
  if (!registro || typeof registro !== 'object') return '—';
  return registro.nomb_cargo ?? registro.nombre_cargo ?? registro.nombre ?? '—';
}

export function codigoCargoDesde(registro) {
  if (!registro || typeof registro !== 'object') return null;
  const n = Number(registro.cod_cargo);
  return Number.isFinite(n) ? n : null;
}
