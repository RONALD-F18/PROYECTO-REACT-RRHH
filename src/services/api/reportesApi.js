import api from '../api';

function nombreArchivoDesdeCabecera(contentDisposition) {
  if (!contentDisposition) return '';
  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]).replace(/["']/g, '').trim();
  const basicMatch = /filename\s*=\s*"?([^";]+)"?/i.exec(contentDisposition);
  return basicMatch?.[1]?.trim() || '';
}

function construirErrorAxios(status, data) {
  const err = new Error(data?.message || 'No se pudo generar el reporte.');
  err.response = { status, data };
  if (status === 422) {
    err.validation = {
      message: data?.message || 'Datos no validos.',
      errors: data?.errors && typeof data.errors === 'object' ? data.errors : {},
    };
  }
  return err;
}

async function transformarBlobError(error) {
  const status = error?.response?.status;
  const blob = error?.response?.data;
  if (!(blob instanceof Blob)) return error;
  const tipo = String(blob.type || '').toLowerCase();
  if (!tipo.includes('application/json') && !tipo.includes('text/plain')) return error;
  const texto = await blob.text();
  let data = { message: texto || 'No se pudo generar el reporte.' };
  try {
    const json = JSON.parse(texto);
    if (json && typeof json === 'object') data = json;
  } catch {
    // texto plano
  }
  return construirErrorAxios(status, data);
}

export async function generateReport(payload) {
  try {
    const response = await api.post('/reportes/generar', payload, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
    const contentType = String(response?.headers?.['content-type'] || '').toLowerCase();
    if (!contentType.includes('application/pdf')) {
      const texto = await response.data.text();
      let data = { message: texto || 'No se recibió el archivo esperado. Intente de nuevo o consulte al administrador.' };
      try {
        const json = JSON.parse(texto);
        if (json && typeof json === 'object') data = json;
      } catch {
        // respuesta no JSON
      }
      throw construirErrorAxios(response.status, data);
    }
    const modulo = String(payload?.modulo || 'general').toLowerCase();
    const filename =
      nombreArchivoDesdeCabecera(response?.headers?.['content-disposition']) || `reporte-${modulo}.pdf`;
    return { blob: response.data, filename };
  } catch (error) {
    throw await transformarBlobError(error);
  }
}

export async function generateGeneralReport(payload) {
  return generateReport(payload);
}

/**
 * Registro de ejecuciones de reportes (tabla en servidor, visible para quienes tengan permiso).
 * Contrato esperado (Laravel / API v1):
 * - GET  /reportes/registros?modulo=&fecha_desde=&fecha_hasta=  → { data: [...] }
 * - POST /reportes/registros  body: { modulo, tipo: 'resumen_general', estado, descripcion? }
 * - DELETE /reportes/registros/{id}
 */

function listaDesdeRespuesta(response) {
  const body = response?.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
}

function normalizarEstadoUi(s) {
  const t = String(s ?? '').trim();
  if (/^generado$/i.test(t)) return 'Generado';
  return t || '—';
}

function normalizarFilaRegistroReporte(row) {
  if (!row || typeof row !== 'object') return null;
  const id = row.id ?? row.cod_registro_reporte ?? row.cod_registro;
  const fechaRaw = row.fecha ?? row.fecha_generacion ?? row.created_at ?? row.updated_at;
  const modulo = row.modulo ?? row.tipo_modulo;
  if (id == null || fechaRaw == null || modulo == null) return null;
  let fechaIso = '';
  try {
    const d = new Date(fechaRaw);
    fechaIso = Number.isNaN(d.getTime()) ? String(fechaRaw) : d.toISOString();
  } catch {
    fechaIso = String(fechaRaw);
  }
  const descripcion =
    row.descripcion ??
    (row.params && typeof row.params === 'object' ? row.params.descripcion : '') ??
    '';
  const generadoPor =
    row.nombre_usuario ??
    row.generado_por ??
    row.usuario_generador ??
    (row.usuario && typeof row.usuario === 'object'
      ? row.usuario.nombre_usuario ?? row.usuario.nombre ?? row.usuario.name
      : '') ??
    '';
  return {
    id: String(id),
    fecha: fechaIso,
    modulo: String(modulo).toLowerCase().trim(),
    tipo: String(row.tipo ?? 'resumen_general'),
    estado: normalizarEstadoUi(row.estado),
    descripcion: String(descripcion || '').trim(),
    generadoPor: String(generadoPor || '').trim(),
  };
}

export function extraerRegistrosReportes(response) {
  return listaDesdeRespuesta(response)
    .map(normalizarFilaRegistroReporte)
    .filter(Boolean);
}

/**
 * @param {{ modulo?: string, fecha_desde?: string, fecha_hasta?: string }} [params]
 */
export async function listarRegistrosReportes(params = {}) {
  const search = new URLSearchParams();
  if (params.modulo) search.set('modulo', params.modulo);
  if (params.fecha_desde) search.set('fecha_desde', params.fecha_desde);
  if (params.fecha_hasta) search.set('fecha_hasta', params.fecha_hasta);
  const q = search.toString();
  const url = q ? `/reportes/registros?${q}` : '/reportes/registros';
  return api.get(url);
}

/**
 * @param {{ modulo: string, tipo?: string, estado: string, descripcion?: string }} payload
 */
export async function crearRegistroReporte(payload) {
  const { data } = await api.post('/reportes/registros', payload);
  return data;
}

export async function eliminarRegistroReporte(id) {
  await api.delete(`/reportes/registros/${encodeURIComponent(String(id))}`);
}
