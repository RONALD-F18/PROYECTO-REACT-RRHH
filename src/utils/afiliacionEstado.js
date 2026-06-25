import { listaCatalogo, opcionesCatalogo } from '../services/catalogos';

/** Etiquetas permitidas en UI (listados, detalle, modal). */
export function etiquetasEstadoAfiliacion(catalogos) {
  return listaCatalogo(catalogos, 'estados_afiliacion');
}

/** @deprecated usar etiquetasEstadoAfiliacion(catalogos) */
export const ETIQUETAS_ESTADO_AFILIACION = ['Activa', 'Inactiva', 'Suspendida'];

export function etiquetasTipoRegimen(catalogos) {
  return listaCatalogo(catalogos, 'tipos_regimen');
}

/** @deprecated usar etiquetasTipoRegimen(catalogos) */
export const ETIQUETAS_TIPO_REGIMEN = ['Contributivo'];

/**
 * Etiqueta visible alineada al catálogo del backend.
 */
export function etiquetaEstadoAfiliacion(estadoBd) {
  const u = String(estadoBd || '').trim();
  if (/^activa$/i.test(u)) return 'Activa';
  if (/^inactiva$/i.test(u)) return 'Inactiva';
  if (/^suspendida$/i.test(u)) return 'Suspendida';
  if (/^aprobada$/i.test(u)) return 'Activa';
  if (/^retirada$/i.test(u) || /^rechazada$/i.test(u)) return 'Inactiva';
  if (/^pendiente$/i.test(u) || /^en_proceso$/i.test(u)) return 'Suspendida';
  return 'Activa';
}

/** Afiliación en estado canónico Activa (seeders / GET catalogos). */
export function esEstadoAfiliacionActiva(estadoBd) {
  return etiquetaEstadoAfiliacion(estadoBd) === 'Activa';
}

/** Devuelve valor canónico del catálogo para enviar al API. */
export function estadoAfiliacionDesdeEtiquetaUi(etiqueta, catalogos = null) {
  const e = String(etiqueta || '').trim();
  const lista = catalogos ? etiquetasEstadoAfiliacion(catalogos) : ETIQUETAS_ESTADO_AFILIACION;
  const exact = lista.find((x) => String(x).toLowerCase() === e.toLowerCase());
  if (exact) return exact;
  const map = {
    Activa: 'Activa',
    Inactiva: 'Inactiva',
    Suspendida: 'Suspendida',
    Aprobada: 'Activa',
    Retirada: 'Inactiva',
    Pendiente: 'Suspendida',
  };
  return map[e] ?? lista[0] ?? 'Activa';
}

export function tipoRegimenApi(valorForm, catalogos = null) {
  const s = String(valorForm || '').trim();
  const lista = catalogos ? etiquetasTipoRegimen(catalogos) : ETIQUETAS_TIPO_REGIMEN;
  const exact = lista.find((x) => String(x).toLowerCase() === s.toLowerCase());
  return exact ?? lista[0] ?? 'Contributivo';
}

export function tipoRegimenFormDesdeApi(v, catalogos = null) {
  const u = String(v || '').trim();
  const lista = catalogos ? etiquetasTipoRegimen(catalogos) : ETIQUETAS_TIPO_REGIMEN;
  const exact = lista.find((x) => String(x).toLowerCase() === u.toLowerCase());
  return exact ?? lista[0] ?? 'Contributivo';
}

export function opcionesEstadoAfiliacion(catalogos) {
  return opcionesCatalogo(catalogos, 'estados_afiliacion');
}

export function opcionesTipoRegimen(catalogos) {
  return opcionesCatalogo(catalogos, 'tipos_regimen');
}
