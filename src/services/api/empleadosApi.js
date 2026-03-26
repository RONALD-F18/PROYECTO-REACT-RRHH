import api from '../api';

export function extraerEmpleadosApi(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

export async function listarEmpleadosApi() {
  const { data } = await api.get('/empleados');
  return data;
}
