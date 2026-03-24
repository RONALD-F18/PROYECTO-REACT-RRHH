/** Equivalencia UI ↔ valores habituales en BD (p. ej. seed `ACTIVA`). */
export function etiquetaEstadoAfiliacion(estadoBd) {
  const u = String(estadoBd || '').toUpperCase().replace(/\s+/g, '_');
  if (u === 'ACTIVA' || u === 'APROBADA') return 'Aprobada';
  if (u === 'PENDIENTE') return 'Pendiente';
  if (u === 'EN_PROCESO') return 'En Proceso';
  if (u === 'RECHAZADA') return 'Rechazada';
  return estadoBd ? String(estadoBd) : '—';
}

export function estadoAfiliacionDesdeEtiquetaUi(etiqueta) {
  const map = {
    Aprobada: 'ACTIVA',
    Activa: 'ACTIVA',
    Pendiente: 'PENDIENTE',
    'En Proceso': 'EN_PROCESO',
    Rechazada: 'RECHAZADA',
  };
  return map[etiqueta] ?? etiqueta;
}

export function tipoRegimenApi(valorForm) {
  const s = String(valorForm || '').trim().toUpperCase();
  if (s.includes('SUBSIDI')) return 'SUBSIDIADO';
  return 'CONTRIBUTIVO';
}

export function tipoRegimenFormDesdeApi(v) {
  const u = String(v || '').toUpperCase();
  if (u === 'SUBSIDIADO') return 'Subsidiado';
  return 'Contributivo';
}
