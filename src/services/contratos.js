import api from './api';
import {
  crearPeticionCompartida,
  invalidarMapaEjecutoresCompartidos,
} from '../utils/peticionCompartida';
import { PER_PAGE_CATALOGO_MAX, PER_PAGE_TABLA_DEFAULT } from './empleados';

export { PER_PAGE_TABLA_DEFAULT };

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
        const { data } = await api.get('/contratos', { params: { page, per_page } });
        return data;
      }),
    );
  }
  return ejecutoresLista.get(key);
}

export function extraerFilasContratos(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((c) => c != null && typeof c === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((c) => c != null && typeof c === 'object');
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

export async function getContratos(opciones = {}) {
  const { page, per_page } = resolverPaginacion(opciones);
  const ejecutor = obtenerEjecutorLista(page, per_page);
  return ejecutor(opciones);
}

export async function getContratosCatalogo(opciones = {}) {
  return getContratos({ ...opciones, modoCatalogo: true, page: 1, per_page: PER_PAGE_CATALOGO_MAX });
}

export function invalidarCacheListaContratos() {
  invalidarMapaEjecutoresCompartidos(ejecutoresLista);
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
