/**
 * Une filas del API con un suplemento local sin duplicar por la clave indicada.
 * Las filas del API tienen prioridad si comparten la misma clave.
 */
export function mergeCatalogoPorClave(api = [], suplemento = [], clave = 'cod_banco') {
  const map = new Map();
  for (const r of api) {
    if (!r || typeof r !== 'object') continue;
    const k = r[clave];
    if (k == null || k === '') continue;
    map.set(String(k), { ...r });
  }
  for (const r of suplemento) {
    if (!r || typeof r !== 'object') continue;
    const k = r[clave];
    if (k == null || k === '') continue;
    if (map.has(String(k))) continue;
    map.set(String(k), { ...r });
  }
  return Array.from(map.values()).sort((a, b) => {
    const na = Number(a[clave]);
    const nb = Number(b[clave]);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return String(a[clave]).localeCompare(String(b[clave]), undefined, { numeric: true });
  });
}

function cie10Normalizado(row) {
  if (!row || typeof row !== 'object') return '';
  return String(row.codigo_cie10 ?? '').trim().toUpperCase();
}

/**
 * API primero; el suplemento añade filas solo si no existe el mismo cod_clasificacion_enfermedad
 * ni el mismo codigo_cie10 (evita duplicar J00, etc.).
 */
export function mergeClasificacionesEnfermedad(api = [], suplemento = []) {
  const map = new Map();
  const cieUsados = new Set();
  for (const r of api) {
    if (!r || typeof r !== 'object') continue;
    const id = r.cod_clasificacion_enfermedad;
    if (id == null || id === '') continue;
    map.set(String(id), { ...r });
    const ck = cie10Normalizado(r);
    if (ck) cieUsados.add(ck);
  }
  for (const r of suplemento) {
    if (!r || typeof r !== 'object') continue;
    const id = r.cod_clasificacion_enfermedad;
    if (id == null || id === '') continue;
    if (map.has(String(id))) continue;
    const ck = cie10Normalizado(r);
    if (ck && cieUsados.has(ck)) continue;
    map.set(String(id), { ...r });
    if (ck) cieUsados.add(ck);
  }
  return Array.from(map.values()).sort((a, b) => {
    const na = Number(a.cod_clasificacion_enfermedad);
    const nb = Number(b.cod_clasificacion_enfermedad);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return String(a.cod_clasificacion_enfermedad).localeCompare(String(b.cod_clasificacion_enfermedad), undefined, {
      numeric: true,
    });
  });
}
