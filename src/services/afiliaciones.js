import api, { API_REQUEST_TIMEOUT_MS } from './api';
import { crearPeticionCompartida } from '../utils/peticionCompartida';

const ejecutarGetAfiliacionesLista = crearPeticionCompartida(async () => {
  const { data } = await api.get('/afiliaciones');
  return data;
});

export function extraerFilasAfiliaciones(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo.filter((r) => r != null && typeof r === 'object');
  if (Array.isArray(cuerpo.data)) return cuerpo.data.filter((r) => r != null && typeof r === 'object');
  return [];
}

export function normalizarRegistroAfiliacion(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  if (cuerpo.cod_afiliacion != null) return cuerpo;
  const capas = [cuerpo.data, cuerpo.afiliacion, cuerpo.item];
  for (const capa of capas) {
    if (capa != null && typeof capa === 'object' && !Array.isArray(capa) && capa.cod_afiliacion != null) {
      return capa;
    }
  }
  return cuerpo.data && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data) ? cuerpo.data : null;
}

export function codigoAfiliacionDesde(registro) {
  const r = normalizarRegistroAfiliacion(registro) ?? registro;
  if (!r || typeof r !== 'object') return null;
  if (r.cod_afiliacion != null && r.cod_afiliacion !== '') return r.cod_afiliacion;
  return null;
}

function extraerFilasCatalogo(cuerpo) {
  if (!cuerpo) return [];
  if (Array.isArray(cuerpo)) return cuerpo;
  if (Array.isArray(cuerpo.data)) return cuerpo.data;
  return [];
}

/** Una sola tanda de peticiones para todos los selects; se reutiliza entre listado y detalle. */
let cacheCatalogos = null;
let inflightCatalogos = null;

export function invalidarCacheCatalogosAfiliacion() {
  cacheCatalogos = null;
  inflightCatalogos = null;
}

export async function obtenerCatalogosAfiliacion({ forzar = false } = {}) {
  if (cacheCatalogos && !forzar) return cacheCatalogos;
  if (inflightCatalogos && !forzar) return inflightCatalogos;

  const cfgCatalogos = { timeout: Math.min(API_REQUEST_TIMEOUT_MS * 2, 600_000) };

  inflightCatalogos = (async () => {
    const [eps, riesgos, arls, pensiones, cesantias, compensaciones] = await Promise.all([
      api.get('/eps', cfgCatalogos),
      api.get('/riesgos', cfgCatalogos),
      api.get('/arls', cfgCatalogos),
      api.get('/pensiones', cfgCatalogos),
      api.get('/cesantias', cfgCatalogos),
      api.get('/compensaciones', cfgCatalogos),
    ]);
    cacheCatalogos = {
      eps: extraerFilasCatalogo(eps.data),
      riesgos: extraerFilasCatalogo(riesgos.data),
      arls: extraerFilasCatalogo(arls.data),
      pensiones: extraerFilasCatalogo(pensiones.data),
      cesantias: extraerFilasCatalogo(cesantias.data),
      compensaciones: extraerFilasCatalogo(compensaciones.data),
    };
    inflightCatalogos = null;
    return cacheCatalogos;
  })();

  return inflightCatalogos;
}

export async function getAfiliaciones(opciones = {}) {
  return ejecutarGetAfiliacionesLista(opciones);
}

export function invalidarCacheListaAfiliaciones() {
  ejecutarGetAfiliacionesLista.invalidar();
}

export async function getAfiliacionById(cod) {
  const { data } = await api.get(`/afiliaciones/${cod}`);
  return data;
}

export async function createAfiliacion(cuerpo) {
  const { data } = await api.post('/afiliaciones', cuerpo);
  invalidarCacheListaAfiliaciones();
  return data;
}

export async function updateAfiliacion(cod, cuerpo) {
  const { data } = await api.put(`/afiliaciones/${cod}`, cuerpo);
  invalidarCacheListaAfiliaciones();
  return data;
}

export async function patchAfiliacion(cod, cuerpo) {
  const { data } = await api.patch(`/afiliaciones/${cod}`, cuerpo);
  invalidarCacheListaAfiliaciones();
  return data;
}

export async function deleteAfiliacion(cod) {
  const { data } = await api.delete(`/afiliaciones/${cod}`);
  invalidarCacheListaAfiliaciones();
  return data;
}
