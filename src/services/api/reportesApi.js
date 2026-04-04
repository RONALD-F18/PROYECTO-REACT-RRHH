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
      let data = { message: texto || 'Respuesta inesperada del servidor.' };
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
