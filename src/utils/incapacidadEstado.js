/** Estados que se pueden asignar al editar (modal o detalle). */
export const ETIQUETAS_ESTADO_EDICION_INCAPACIDAD = ['Activa', 'Finalizada'];

/**
 * Valor inicial del control de edición (solo Activa / Finalizada).
 * Cancelada u otros valores se muestran como Finalizada para poder corregir desde la UI.
 */
export function estadoIncapacidadEdicionDesdeApi(raw) {
  const u = String(raw || '').trim();
  if (u === 'Activa') return 'Activa';
  if (u === 'Finalizada' || u === 'Cancelada') return 'Finalizada';
  return 'Activa';
}

export function estadoIncapacidadApiDesdeEtiquetaEdicion(etiqueta) {
  const t = String(etiqueta || '').trim();
  if (t === 'Finalizada') return 'Finalizada';
  return 'Activa';
}
