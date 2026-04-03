import api from './api';
import { getAfiliaciones, extraerFilasAfiliaciones } from './afiliaciones';

function rowsFromResponse(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body.filter((r) => r && typeof r === 'object');
  if (Array.isArray(body.data)) return body.data.filter((r) => r && typeof r === 'object');
  if (body.data?.data && Array.isArray(body.data.data)) {
    return body.data.data.filter((r) => r && typeof r === 'object');
  }
  return [];
}

/** Evita que un 403 en un catálogo vacíe todo el modal (p. ej. funcionario sin GET /empleados). */
async function allSettledValores(promesas) {
  const settled = await Promise.allSettled(promesas);
  return settled.map((s) => (s.status === 'fulfilled' ? s.value : null));
}

function normalizeObject(body, idKey) {
  if (!body || typeof body !== 'object') return null;
  if (body[idKey] != null) return body;
  const candidates = [body.data, body.item, body.certificacion, body.Certificacion];
  for (const item of candidates) {
    if (item && typeof item === 'object' && !Array.isArray(item) && item[idKey] != null) {
      return item;
    }
  }
  if (body.data && typeof body.data === 'object' && !Array.isArray(body.data)) return body.data;
  return body;
}

function toNullableNumber(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toNullableText(value, maxLen = 255) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  return text.slice(0, maxLen);
}

export function extraerFilasCertificaciones(body) {
  return rowsFromResponse(body);
}

export function normalizarRegistroCertificacion(body) {
  return normalizeObject(body, 'cod_certificacion');
}

export function codigoCertificacionDesde(item) {
  const c = normalizarRegistroCertificacion(item) ?? item;
  if (!c || typeof c !== 'object') return null;
  if (c.cod_certificacion != null && c.cod_certificacion !== '') {
    const n = Number(c.cod_certificacion);
    if (Number.isFinite(n)) return n;
  }
  if (c.id != null && c.id !== '') {
    const n = Number(c.id);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function construirPayloadCertificacion(formulario) {
  const incluyeSalario = !!formulario.incluye_salario;
  return {
    id_empresa: Number(formulario.id_empresa),
    cod_empleado: Number(formulario.cod_empleado),
    cod_contrato: toNullableNumber(formulario.cod_contrato),
    tipo_certificacion: String(formulario.tipo_certificacion ?? '').trim().slice(0, 30).toUpperCase(),
    incluye_salario: incluyeSalario,
    salario_certificado: incluyeSalario ? toNullableNumber(formulario.salario_certificado) : null,
    cod_eps: toNullableNumber(formulario.cod_eps),
    cod_arl: toNullableNumber(formulario.cod_arl),
    cod_pension: toNullableNumber(formulario.cod_pension),
    cod_caja: toNullableNumber(formulario.cod_caja),
    cod_cesantias: toNullableNumber(formulario.cod_cesantias),
    fecha_emision: String(formulario.fecha_emision ?? '').trim().slice(0, 10),
    ciudad_emision: String(formulario.ciudad_emision ?? '').trim().slice(0, 100),
    descripcion: toNullableText(formulario.descripcion, 150),
  };
}

export function certificacionApiAFormulario(raw) {
  const item = normalizarRegistroCertificacion(raw) ?? raw ?? {};
  const emp = item.empleado && typeof item.empleado === 'object' ? item.empleado : null;
  return {
    id_empresa: item.id_empresa != null ? String(item.id_empresa) : '',
    documento_consulta: emp?.doc_iden != null ? String(emp.doc_iden).replace(/\D/g, '').slice(0, 12) : '',
    cod_empleado: item.cod_empleado != null ? String(item.cod_empleado) : '',
    cod_contrato: item.cod_contrato != null ? String(item.cod_contrato) : '',
    tipo_certificacion: item.tipo_certificacion != null ? String(item.tipo_certificacion).toUpperCase() : 'LABORAL',
    incluye_salario: Boolean(item.incluye_salario),
    salario_certificado: item.salario_certificado != null ? String(item.salario_certificado) : '',
    cod_eps: item.cod_eps != null ? String(item.cod_eps) : '',
    cod_arl: item.cod_arl != null ? String(item.cod_arl) : '',
    cod_pension: item.cod_pension != null ? String(item.cod_pension) : '',
    cod_caja: item.cod_caja != null ? String(item.cod_caja) : '',
    cod_cesantias: item.cod_cesantias != null ? String(item.cod_cesantias) : '',
    fecha_emision: item.fecha_emision ? String(item.fecha_emision).slice(0, 10) : '',
    ciudad_emision: item.ciudad_emision != null ? String(item.ciudad_emision) : '',
    descripcion: item.descripcion != null ? String(item.descripcion) : '',
  };
}

async function simpleGet(path) {
  const { data } = await api.get(path);
  return data;
}

export async function getCertificaciones() {
  return simpleGet('/certificaciones');
}

export async function getCertificacionById(id) {
  return simpleGet(`/certificaciones/${id}`);
}

export async function createCertificacion(payload) {
  const { data } = await api.post('/certificaciones', payload);
  return data;
}

export async function updateCertificacion(id, payload) {
  const { data } = await api.put(`/certificaciones/${id}`, payload);
  return data;
}

export async function patchCertificacion(id, payload) {
  const { data } = await api.patch(`/certificaciones/${id}`, payload);
  return data;
}

export async function deleteCertificacion(id) {
  const { data } = await api.delete(`/certificaciones/${id}`);
  return data;
}

async function parsearRespuestaPdfBlob(blob, response) {
  const tipo = blob?.type || response.headers?.['content-type'] || '';
  if (tipo.includes('application/json') || tipo.includes('text/html')) {
    const texto = await blob.text();
    let mensaje = 'No se pudo generar el PDF.';
    try {
      const j = JSON.parse(texto);
      mensaje = j.message || j.error || j.mensaje || mensaje;
      if (j.errors && typeof j.errors === 'object') {
        const det = Object.values(j.errors).flat().filter(Boolean).join(' ');
        if (det) mensaje = `${mensaje} ${det}`;
      }
    } catch {
      if (texto && texto.length < 500) mensaje = texto;
    }
    throw new Error(mensaje.trim());
  }
  return blob;
}

export async function downloadPdfLaboral(id) {
  const response = await api.get(`/certificaciones/${id}/pdf-laboral`, {
    responseType: 'blob',
  });
  return parsearRespuestaPdfBlob(response.data, response);
}

export async function downloadPdfAfiliaciones(id) {
  const response = await api.get(`/certificaciones/${id}/pdf-afiliaciones`, {
    responseType: 'blob',
  });
  return parsearRespuestaPdfBlob(response.data, response);
}

export async function getEmpleadosCatalogo() {
  return simpleGet('/empleados');
}

export async function getContratosCatalogo() {
  return simpleGet('/contratos');
}

export async function getEmpresasCatalogo() {
  return simpleGet('/empresas');
}

export async function getEpsCatalogo() {
  return simpleGet('/eps');
}

export async function getArlsCatalogo() {
  return simpleGet('/arls');
}

export async function getPensionesCatalogo() {
  return simpleGet('/pensiones');
}

export async function getCompensacionesCatalogo() {
  return simpleGet('/compensaciones');
}

export async function getCesantiasCatalogo() {
  return simpleGet('/cesantias');
}

export async function getAfiliacionesCatalogo() {
  return simpleGet('/afiliaciones');
}

let cacheCatalogosCert = null;
let inflightCatalogosCert = null;

export function invalidarCacheCatalogosCertificacion() {
  cacheCatalogosCert = null;
  inflightCatalogosCert = null;
}

/**
 * Catálogos para certificaciones.
 * @param {{ forzar?: boolean, ligero?: boolean }} opts
 *   ligero=true (default): solo empresas, empleados, contratos y afiliaciones (menos peticiones, más rápido).
 */
export async function obtenerCatalogosCertificacion({ forzar = false, ligero = true } = {}) {
  const cacheKey = ligero ? 'ligero' : 'full';
  if (cacheCatalogosCert && cacheCatalogosCert.key === cacheKey && !forzar) {
    return cacheCatalogosCert.data;
  }
  if (inflightCatalogosCert && !forzar) return inflightCatalogosCert;

  inflightCatalogosCert = (async () => {
    if (ligero) {
      const [empresasRaw, empleadosRaw, contratosRaw, afilRaw] = await allSettledValores([
        getEmpresasCatalogo(),
        getEmpleadosCatalogo(),
        getContratosCatalogo(),
        getAfiliaciones(),
      ]);
      const data = {
        empresas: rowsFromResponse(empresasRaw),
        empleados: rowsFromResponse(empleadosRaw),
        contratos: rowsFromResponse(contratosRaw),
        afiliaciones: extraerFilasAfiliaciones(afilRaw),
        eps: [],
        arls: [],
        pensiones: [],
        cajas: [],
        cesantias: [],
      };
      cacheCatalogosCert = { key: cacheKey, data };
      inflightCatalogosCert = null;
      return data;
    }

    const [empresasRaw, empleadosRaw, contratosRaw, afilRaw, epsRaw, arlsRaw, pensionesRaw, cajasRaw, cesantiasRaw] =
      await allSettledValores([
        getEmpresasCatalogo(),
        getEmpleadosCatalogo(),
        getContratosCatalogo(),
        getAfiliaciones(),
        getEpsCatalogo(),
        getArlsCatalogo(),
        getPensionesCatalogo(),
        getCompensacionesCatalogo(),
        getCesantiasCatalogo(),
      ]);

    const data = {
      empresas: rowsFromResponse(empresasRaw),
      empleados: rowsFromResponse(empleadosRaw),
      contratos: rowsFromResponse(contratosRaw),
      afiliaciones: extraerFilasAfiliaciones(afilRaw),
      eps: rowsFromResponse(epsRaw),
      arls: rowsFromResponse(arlsRaw),
      pensiones: rowsFromResponse(pensionesRaw),
      cajas: rowsFromResponse(cajasRaw),
      cesantias: rowsFromResponse(cesantiasRaw),
    };
    cacheCatalogosCert = { key: cacheKey, data };
    inflightCatalogosCert = null;
    return data;
  })();

  return inflightCatalogosCert;
}

export function descargarBlobComoArchivo(blob, nombreArchivo) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
