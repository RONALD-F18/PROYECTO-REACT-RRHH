import { getEmpleados } from '../empleados';

export function extraerEmpleadosApi(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

/** Misma lista que `getEmpleados` (comparte deduplicación en vuelo). */
export async function listarEmpleadosApi() {
  return getEmpleados();
}
