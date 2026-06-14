/** Estados que se pueden asignar al editar (modal o detalle). */
export const ETIQUETAS_ESTADO_EDICION_INCAPACIDAD = ['Activa', 'Finalizada', 'Cancelada'];

/**
 * Normaliza valor del API (ACTIVA → Activa, etc.).
 */
export function normalizarEstadoIncapacidadApi(raw) {
  const u = String(raw || '').trim();
  if (/^activa$/i.test(u)) return 'Activa';
  if (/^finalizada$/i.test(u)) return 'Finalizada';
  if (/^cancelada$/i.test(u)) return 'Cancelada';
  return 'Activa';
}

export function estadoIncapacidadEdicionDesdeApi(raw) {
  return normalizarEstadoIncapacidadApi(raw);
}

export function estadoIncapacidadApiDesdeEtiquetaEdicion(etiqueta) {
  const t = String(etiqueta || '').trim();
  if (t === 'Finalizada') return 'Finalizada';
  if (t === 'Cancelada') return 'Cancelada';
  return 'Activa';
}
