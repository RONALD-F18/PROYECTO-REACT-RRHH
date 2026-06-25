import { listaCatalogo, opcionesCatalogo } from '../services/catalogos';

/** @deprecated usar etiquetasEstadoIncapacidad(catalogos) */
export const ETIQUETAS_ESTADO_EDICION_INCAPACIDAD = ['Activa', 'Finalizada', 'Cancelada'];

export function etiquetasEstadoIncapacidad(catalogos) {
  return listaCatalogo(catalogos, 'estados_incapacidad');
}

export function opcionesEstadoIncapacidad(catalogos) {
  return opcionesCatalogo(catalogos, 'estados_incapacidad');
}

export function opcionesFiltroEstadoIncapacidad(catalogos) {
  return etiquetasEstadoIncapacidad(catalogos).map((est) => ({
    valor: est,
    texto: est,
  }));
}

/**
 * Normaliza valor del API (ACTIVA → Activa, etc.).
 */
export function normalizarEstadoIncapacidadApi(raw, catalogos = null) {
  const u = String(raw || '').trim();
  const lista = catalogos ? etiquetasEstadoIncapacidad(catalogos) : ETIQUETAS_ESTADO_EDICION_INCAPACIDAD;
  const exact = lista.find((e) => String(e).toLowerCase() === u.toLowerCase());
  if (exact) return exact;
  if (/^activa$/i.test(u)) return 'Activa';
  if (/^finalizada$/i.test(u)) return 'Finalizada';
  if (/^cancelada$/i.test(u)) return 'Cancelada';
  return lista[0] ?? 'Activa';
}

export function estadoIncapacidadEdicionDesdeApi(raw, catalogos = null) {
  return normalizarEstadoIncapacidadApi(raw, catalogos);
}

export function estadoIncapacidadApiDesdeEtiquetaEdicion(etiqueta, catalogos = null) {
  const t = String(etiqueta || '').trim();
  const lista = catalogos ? etiquetasEstadoIncapacidad(catalogos) : ETIQUETAS_ESTADO_EDICION_INCAPACIDAD;
  const exact = lista.find((e) => String(e).toLowerCase() === t.toLowerCase());
  if (exact) return exact;
  if (t === 'Finalizada') return 'Finalizada';
  if (t === 'Cancelada') return 'Cancelada';
  return lista[0] ?? 'Activa';
}
