import api from './api';
import { crearPeticionCompartida } from '../utils/peticionCompartida';

const ejecutarGetUsuariosLista = crearPeticionCompartida(async () => {
  const { data } = await api.get('/usuarios');
  return data;
});

/** Soporta array directo, `{ data: [] }` o paginación Laravel `{ data: { data: [] } }` */
export function extraerFilasUsuarios(cuerpo) {
  let raw = [];
  if (!cuerpo) raw = [];
  else if (Array.isArray(cuerpo)) raw = cuerpo;
  else if (Array.isArray(cuerpo.data)) raw = cuerpo.data;
  else if (cuerpo.data?.data && Array.isArray(cuerpo.data.data)) raw = cuerpo.data.data;
  return raw.filter((u) => u != null && typeof u === 'object' && !Array.isArray(u));
}

export async function getUsuarios(opciones = {}) {
  return ejecutarGetUsuariosLista(opciones);
}

export async function getUsuarioById(codUsuario) {
  const { data } = await api.get(`/usuarios/${codUsuario}`);
  return data;
}

export async function createUsuario(cuerpo) {
  const { data } = await api.post('/usuarios', cuerpo);
  return data;
}

export async function updateUsuario(codUsuario, cuerpo) {
  const { data } = await api.put(`/usuarios/${codUsuario}`, cuerpo);
  return data;
}

export async function deleteUsuario(codUsuario) {
  const { data } = await api.delete(`/usuarios/${codUsuario}`);
  return data;
}
