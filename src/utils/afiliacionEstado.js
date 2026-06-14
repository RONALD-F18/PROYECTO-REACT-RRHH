/** Etiquetas permitidas en UI (listados, detalle, modal). */
export const ETIQUETAS_ESTADO_AFILIACION = ['Activa', 'Inactiva', 'Suspendida'];

export const ETIQUETAS_TIPO_REGIMEN = ['Contributivo', 'Subsidiado'];

/**
 * Etiqueta visible alineada al catálogo del backend.
 */
export function etiquetaEstadoAfiliacion(estadoBd) {
  const u = String(estadoBd || '').trim();
  if (/^activa$/i.test(u)) return 'Activa';
  if (/^inactiva$/i.test(u)) return 'Inactiva';
  if (/^suspendida$/i.test(u)) return 'Suspendida';
  // Valores heredados
  if (/^aprobada$/i.test(u)) return 'Activa';
  if (/^retirada$/i.test(u) || /^rechazada$/i.test(u)) return 'Inactiva';
  if (/^pendiente$/i.test(u) || /^en_proceso$/i.test(u)) return 'Suspendida';
  return 'Activa';
}

export function estadoAfiliacionDesdeEtiquetaUi(etiqueta) {
  const map = {
    Activa: 'Activa',
    Inactiva: 'Inactiva',
    Suspendida: 'Suspendida',
    Aprobada: 'Activa',
    Retirada: 'Inactiva',
    Pendiente: 'Suspendida',
  };
  return map[String(etiqueta || '').trim()] ?? 'Activa';
}

export function tipoRegimenApi(valorForm) {
  const s = String(valorForm || '').trim();
  if (/^subsidiado$/i.test(s)) return 'Subsidiado';
  return 'Contributivo';
}

export function tipoRegimenFormDesdeApi(v) {
  const u = String(v || '').trim();
  if (/^subsidiado$/i.test(u)) return 'Subsidiado';
  return 'Contributivo';
}
