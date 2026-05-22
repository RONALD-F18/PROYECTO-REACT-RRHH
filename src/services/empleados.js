import api from './api';
import {
  crearPeticionCompartida,
  invalidarMapaEjecutoresCompartidos,
} from '../utils/peticionCompartida';

export const PER_PAGE_TABLA_DEFAULT = 25;
export const PER_PAGE_CATALOGO_MAX = 100;

const ejecutoresLista = new Map();

function claveLista(page, per_page) {
  return `${page}|${per_page}`;
}

function obtenerEjecutorLista(page, per_page) {
  const key = claveLista(page, per_page);
  if (!ejecutoresLista.has(key)) {
    ejecutoresLista.set(
      key,
      crearPeticionCompartida(async () => {
        const { data } = await api.get('/empleados', { params: { page, per_page } });
        return data;
      }),
    );
  }
  return ejecutoresLista.get(key);
}

export function extraerFilasEmpleados(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((e) => e != null && typeof e === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((e) => e != null && typeof e === 'object');
  return [];
}

export function extraerMetaPaginacion(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  const meta = cuerpo.meta;
  if (meta && typeof meta === 'object' && meta.current_page != null) {
    return {
      current_page: Number(meta.current_page) || 1,
      per_page: Number(meta.per_page) || PER_PAGE_TABLA_DEFAULT,
      total: Number(meta.total) || 0,
      last_page: Number(meta.last_page) || 1,
    };
  }
  return null;
}

/**
 * show/store/update: modelo suelto o envuelto en data / empleado (respuestas Laravel habituales).
 */
export function normalizarRegistroEmpleado(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  if (cuerpo.cod_empleado != null) return cuerpo;

  const anidados = [cuerpo.data, cuerpo.empleado, cuerpo.Empleado, cuerpo.item];
  for (const capa of anidados) {
    if (capa != null && typeof capa === 'object' && !Array.isArray(capa) && capa.cod_empleado != null) {
      return capa;
    }
  }
  if (cuerpo.data != null && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data)) {
    return cuerpo.data;
  }
  return cuerpo;
}

/** PK para rutas API (prioriza cod_empleado; algunos listados traen solo id). */
export function codigoEmpleadoDesde(registro) {
  const e = normalizarRegistroEmpleado(registro) ?? registro;
  if (!e || typeof e !== 'object') return null;
  if (e.cod_empleado != null && e.cod_empleado !== '') return e.cod_empleado;
  if (e.id != null && e.id !== '') return e.id;
  return null;
}

export function nombreCompletoEmpleado(e) {
  if (!e || typeof e !== 'object') return '—';
  const n = [e.nombre_empleado, e.apellidos_empleado].filter(Boolean).join(' ').trim();
  return n || '—';
}

export function empleadoPorDocumento(empleados, doc) {
  const d = String(doc ?? '').trim();
  if (!d || !Array.isArray(empleados)) return null;
  return empleados.find((e) => String(e.doc_iden ?? '').trim() === d) ?? null;
}

/** Normaliza documento para comparar (sin espacios ni separadores comunes). */
export function normalizarDocumentoBusqueda(doc) {
  return String(doc ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.\-]/g, '');
}

/**
 * Busca empleado por número de documento (coincidencia exacta o solo dígitos/letras normalizados).
 */
export function buscarEmpleadoPorDocumento(empleados, docIngresado) {
  const raw = String(docIngresado ?? '').trim();
  if (!raw || !Array.isArray(empleados)) return null;
  const porExacto = empleadoPorDocumento(empleados, raw);
  if (porExacto) return porExacto;
  const n = normalizarDocumentoBusqueda(raw);
  if (!n) return null;
  return (
    empleados.find((e) => {
      const d = normalizarDocumentoBusqueda(e.doc_iden ?? '');
      return d && d === n;
    }) ?? null
  );
}

function resolverPaginacion(opciones = {}) {
  const page = Math.max(1, Number(opciones.page) || 1);
  const per_page = Math.min(
    100,
    Math.max(
      1,
      Number(opciones.per_page) ||
        (opciones.modoCatalogo ? PER_PAGE_CATALOGO_MAX : PER_PAGE_TABLA_DEFAULT),
    ),
  );
  return { page, per_page };
}

/** Listado paginado (tablas y catálogos auxiliares con modoCatalogo). */
export async function getEmpleados(opciones = {}) {
  const { page, per_page } = resolverPaginacion(opciones);
  const ejecutor = obtenerEjecutorLista(page, per_page);
  return ejecutor(opciones);
}

/** Hasta 100 empleados para selects en otros módulos (sin paginación UI). */
export async function getEmpleadosCatalogo(opciones = {}) {
  return getEmpleados({ ...opciones, modoCatalogo: true, page: 1, per_page: PER_PAGE_CATALOGO_MAX });
}

export function invalidarCacheListaEmpleados() {
  invalidarMapaEjecutoresCompartidos(ejecutoresLista);
}

export async function getEmpleadoById(codEmpleado) {
  const { data } = await api.get(`/empleados/${codEmpleado}`);
  return data;
}

export async function createEmpleado(cuerpo) {
  const { data } = await api.post('/empleados', cuerpo);
  invalidarCacheListaEmpleados();
  return data;
}

export async function updateEmpleado(codEmpleado, cuerpo) {
  const { data } = await api.put(`/empleados/${codEmpleado}`, cuerpo);
  invalidarCacheListaEmpleados();
  return data;
}

export async function patchEmpleado(codEmpleado, cuerpo) {
  const { data } = await api.patch(`/empleados/${codEmpleado}`, cuerpo);
  invalidarCacheListaEmpleados();
  return data;
}

export async function deleteEmpleado(codEmpleado) {
  const { data } = await api.delete(`/empleados/${codEmpleado}`);
  invalidarCacheListaEmpleados();
  return data;
}
