import { getEmpleadosCatalogo } from '../empleados';

export function extraerEmpleadosApi(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

/** Catálogo de empleados (hasta 100) para selects en otros módulos. */
export async function listarEmpleadosApi(opciones = {}) {
  return getEmpleadosCatalogo(opciones);
}
