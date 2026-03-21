import api from './api';

/** Soporta { data: [] }, paginación Laravel, o array directo */
function extraerListaRoles(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo;
  if (Array.isArray(cuerpo.data)) return cuerpo.data;
  if (cuerpo.data?.data && Array.isArray(cuerpo.data.data)) return cuerpo.data.data;
  return [];
}

/** Roles activos: excluye solo estado_rol explícitamente falso (por defecto en BD es true) */
export function soloRolesActivos(lista) {
  return lista.filter(
    (r) => r.estado_rol !== false && r.estado_rol !== 0 && r.estado_rol !== '0',
  );
}

export async function getRoles(requestConfig = {}) {
  const { data } = await api.get('/roles', requestConfig);
  return extraerListaRoles(data);
}

export async function getRolesActivos(requestConfig = {}) {
  const todos = await getRoles(requestConfig);
  return soloRolesActivos(todos);
}
