import { CATALOGOS_FALLBACK } from '../../services/catalogos';

/** Valores enviados al API (strings del catálogo Laravel). */
export const TIPOS_COMUNICACION_DEFAULT = CATALOGOS_FALLBACK.tipos_comunicacion;

export const ESTADOS_COMUNICACION_DEFAULT = CATALOGOS_FALLBACK.estados_comunicacion;

export const MOTIVOS_COMUNICACION_DEFAULT = CATALOGOS_FALLBACK.motivos_comunicacion;

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

export function normalizarTipoComunicacion(valor) {
  const s = String(valor || '').trim();
  if (!s) return TIPOS_COMUNICACION_DEFAULT[0];
  const exact = TIPOS_COMUNICACION_DEFAULT.find((t) => t.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  if (/memorand/i.test(s)) return 'Memorando';
  if (/apercib/i.test(s)) return 'Apercibimiento formal';
  if (/suspens/i.test(s)) return 'Suspension disciplinaria';
  if (/compromiso/i.test(s)) return 'Compromiso de mejora';
  return s.slice(0, 50);
}

export function normalizarEstadoComunicacion(valor) {
  const s = String(valor || '').trim();
  if (!s) return ESTADO_INICIAL_AL_CREAR;
  const exact = ESTADOS_COMUNICACION_DEFAULT.find((e) => e.toLowerCase() === s.toLowerCase());
  if (exact) return exact;
  if (/seguimiento/i.test(s)) return 'En seguimiento';
  if (/cerrad/i.test(s)) return 'Cerrada';
  if (/emit/i.test(s)) return 'Emitida';
  return s.slice(0, 50);
}

/** @deprecated usar normalizarTipoComunicacion */
export function canonicalTipoApi(valor) {
  return normalizarTipoComunicacion(valor);
}

/** @deprecated usar normalizarEstadoComunicacion */
export function canonicalEstadoApi(valor) {
  return normalizarEstadoComunicacion(valor);
}

export function etiquetaTipo(valor) {
  return normalizarTipoComunicacion(valor);
}

export function etiquetaEstado(valor) {
  return normalizarEstadoComunicacion(valor);
}

export function esSuspensionDisciplinaria(tipo) {
  return normalizarTipoComunicacion(tipo) === 'Suspension disciplinaria';
}

export function radicadoDesdeCod(cod) {
  if (cod == null || cod === '') return 'GD-—';
  return `GD-${String(cod).padStart(4, '0')}`;
}

export function claseBadgeTipo(tipo) {
  const c = normalizarTipoComunicacion(tipo);
  if (c === 'Memorando') return 'disc-badge--memo';
  if (c === 'Apercibimiento formal') return 'disc-badge--llamado';
  if (c === 'Suspension disciplinaria') return 'disc-badge--susp';
  if (c === 'Compromiso de mejora') return 'disc-badge--feli';
  return 'disc-badge--neutral';
}

export function claseBadgeEstado(estado) {
  const c = normalizarEstadoComunicacion(estado);
  if (c === 'Cerrada') return 'disc-badge-est--ok';
  if (c === 'En seguimiento') return 'disc-badge-est--emit';
  if (c === 'Emitida') return 'disc-badge-est--emit';
  return 'disc-badge-est--emit';
}

/** Compatibilidad con imports antiguos */
export const TIPOS_COMUNICACION = TIPOS_COMUNICACION_DEFAULT.map((etiqueta) => ({
  api: etiqueta,
  etiqueta,
  icono: etiqueta === 'Memorando' ? 'memo' : etiqueta === 'Suspension disciplinaria' ? 'stop' : 'memo',
}));

export const ESTADOS_COMUNICACION = ESTADOS_COMUNICACION_DEFAULT.map((etiqueta) => ({
  api: etiqueta,
  etiqueta,
}));
