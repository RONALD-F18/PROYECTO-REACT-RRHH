/** Solo Memorando — valores canónicos del catálogo Laravel. */
export const TIPOS_COMUNICACION_DEFAULT = ['Memorando'];

export const ESTADOS_COMUNICACION_DEFAULT = ['Emitida', 'En seguimiento', 'Cerrada'];

export const MOTIVOS_COMUNICACION_DEFAULT = [
  'Incumplimiento',
  'Desacato',
  'Reincidencia',
  'Conducta',
  'Retraso',
];

/** Estado al crear un documento. */
export const ESTADO_INICIAL_AL_CREAR = 'Emitida';

export const MAX_MOTIVO_CHARS = 50;
export const MAX_DESCRIPCION_CHARS = 500;

export function listaTiposComunicacion(catalogos) {
  const arr = catalogos?.tipos_comunicacion;
  return Array.isArray(arr) && arr.length ? arr : TIPOS_COMUNICACION_DEFAULT;
}

export function listaEstadosComunicacion(catalogos) {
  const arr = catalogos?.estados_comunicacion;
  return Array.isArray(arr) && arr.length ? arr : ESTADOS_COMUNICACION_DEFAULT;
}

export function listaMotivosComunicacion(catalogos) {
  const arr = catalogos?.motivos_comunicacion;
  return Array.isArray(arr) && arr.length ? arr : MOTIVOS_COMUNICACION_DEFAULT;
}

export function normalizarTipoComunicacion(valor, catalogos = null) {
  const lista = listaTiposComunicacion(catalogos);
  const s = String(valor || '').trim();
  if (!s) return lista[0] ?? 'Memorando';
  const exact = lista.find((t) => t.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  if (/memorand/i.test(s)) return 'Memorando';
  return lista[0] ?? 'Memorando';
}

export function normalizarEstadoComunicacion(valor, catalogos = null) {
  const lista = listaEstadosComunicacion(catalogos);
  const s = String(valor || '').trim();
  if (!s) return ESTADO_INICIAL_AL_CREAR;
  const exact = lista.find((e) => e.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  if (/seguimiento/i.test(s)) return 'En seguimiento';
  if (/cerrad/i.test(s)) return 'Cerrada';
  if (/emit/i.test(s)) return 'Emitida';
  return lista[0] ?? ESTADO_INICIAL_AL_CREAR;
}

/** @deprecated usar normalizarTipoComunicacion */
export function canonicalTipoApi(valor, catalogos) {
  return normalizarTipoComunicacion(valor, catalogos);
}

/** @deprecated usar normalizarEstadoComunicacion */
export function canonicalEstadoApi(valor, catalogos) {
  return normalizarEstadoComunicacion(valor, catalogos);
}

export function etiquetaTipo(valor, catalogos) {
  return normalizarTipoComunicacion(valor, catalogos);
}

export function etiquetaEstado(valor, catalogos) {
  return normalizarEstadoComunicacion(valor, catalogos);
}

export function esSuspensionDisciplinaria() {
  return false;
}

export function radicadoDesdeCod(cod) {
  if (cod == null || cod === '') return 'GD-—';
  return `GD-${String(cod).padStart(4, '0')}`;
}

export function claseBadgeTipo() {
  return 'disc-badge--memo';
}

export function claseBadgeEstado(estado, catalogos) {
  const c = normalizarEstadoComunicacion(estado, catalogos);
  if (c === 'Cerrada') return 'disc-badge-est--ok';
  return 'disc-badge-est--emit';
}

/** Compatibilidad con imports antiguos */
export const TIPOS_COMUNICACION = TIPOS_COMUNICACION_DEFAULT.map((etiqueta) => ({
  api: etiqueta,
  etiqueta,
  icono: 'memo',
}));

export const ESTADOS_COMUNICACION = ESTADOS_COMUNICACION_DEFAULT.map((etiqueta) => ({
  api: etiqueta,
  etiqueta,
}));
