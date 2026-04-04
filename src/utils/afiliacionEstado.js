/** Etiquetas permitidas en UI (listados, detalle, modal). */
export const ETIQUETAS_ESTADO_AFILIACION = ['Aprobada', 'Pendiente', 'Retirada'];

/**
 * Etiqueta visible: solo tres estados. Valores heredados (p. ej. EN_PROCESO) se agrupan.
 */
export function etiquetaEstadoAfiliacion(estadoBd) {
  const u = String(estadoBd || '').toUpperCase().replace(/\s+/g, '_');
  if (u === 'ACTIVA' || u === 'APROBADA') return 'Aprobada';
  if (u === 'RETIRADA' || u === 'RETIRADO' || u === 'RECHAZADA') return 'Retirada';
  if (u === 'PENDIENTE' || u === 'EN_PROCESO') return 'Pendiente';
  return 'Pendiente';
}

export function estadoAfiliacionDesdeEtiquetaUi(etiqueta) {
  const map = {
    Aprobada: 'ACTIVA',
    Activa: 'ACTIVA',
    Pendiente: 'PENDIENTE',
    Retirada: 'RETIRADA',
    Retirado: 'RETIRADA',
  };
  return map[etiqueta] ?? 'PENDIENTE';
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
