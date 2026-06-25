/** Valores enviados al API (string ≤50). Sin llamado verbal. */
export const TIPOS_COMUNICACION = [
  { api: 'MEMORANDO', etiqueta: 'Memorando', icono: 'memo' },
  { api: 'SUSPENSION', etiqueta: 'Suspensión', icono: 'stop' },
  { api: 'FELICITACION', etiqueta: 'Felicitación', icono: 'star' },
];

/** Estados en UI y detalle (emitido → notificado). */
export const ESTADOS_COMUNICACION = [
  { api: 'EMITIDO', etiqueta: 'Emitido' },
  { api: 'NOTIFICADO', etiqueta: 'Notificado' },
];

/** Valor al crear un documento. */
export const ESTADO_INICIAL_AL_CREAR = 'EMITIDO';

export const MAX_MOTIVO_CHARS = 20;
export const MAX_DESCRIPCION_CHARS = 500;

export function canonicalTipoApi(valor) {
  const s = String(valor || '').toUpperCase().replace(/\s+/g, '_');
  if (s.includes('MEMORAND')) return 'MEMORANDO';
  if (s.includes('SUSPENS')) return 'SUSPENSION';
  if (s.includes('FELICIT')) return 'FELICITACION';
  const ok = ['MEMORANDO', 'SUSPENSION', 'FELICITACION'];
  if (ok.includes(s)) return s;
  return s.slice(0, 50) || 'MEMORANDO';
}

export function canonicalEstadoApi(valor) {
  const s = String(valor || '').toUpperCase();
  if (s.includes('NOTIFIC')) return 'NOTIFICADO';
  if (s.includes('EMIT')) return 'EMITIDO';
  if (s.includes('SEGUIMIENTO')) return 'NOTIFICADO';
  if (s.includes('CERRAD')) return 'NOTIFICADO';
  if (s.includes('BORRAD')) return 'BORRADOR';
  return s.slice(0, 20) || 'EMITIDO';
}

export function etiquetaTipo(valor) {
  const c = canonicalTipoApi(valor);
  return TIPOS_COMUNICACION.find((t) => t.api === c)?.etiqueta ?? String(valor || '—');
}

export function etiquetaEstado(valor) {
  const c = canonicalEstadoApi(valor);
  if (c === 'BORRADOR') return 'Emitido';
  return ESTADOS_COMUNICACION.find((e) => e.api === c)?.etiqueta ?? String(valor || '—');
}

export function esSuspensionDisciplinaria(tipo) {
  return canonicalTipoApi(tipo) === 'SUSPENSION';
}

export function listaTiposComunicacion() {
  return TIPOS_COMUNICACION.map((t) => t.api);
}

export function listaEstadosComunicacion() {
  return ESTADOS_COMUNICACION.map((e) => e.api);
}

export function listaMotivosComunicacion(catalogos) {
  const arr = catalogos?.motivos_comunicacion;
  if (Array.isArray(arr) && arr.length) return arr;
  return ['Incumplimiento', 'Desacato', 'Reincidencia', 'Conducta', 'Retraso'];
}

export function normalizarTipoComunicacion(valor) {
  return canonicalTipoApi(valor);
}

export function normalizarEstadoComunicacion(valor) {
  return canonicalEstadoApi(valor);
}

export function radicadoDesdeCod(cod) {
  if (cod == null || cod === '') return 'GD-—';
  return `GD-${String(cod).padStart(4, '0')}`;
}

export function claseBadgeTipo(tipoApi) {
  const c = canonicalTipoApi(tipoApi);
  if (c === 'MEMORANDO') return 'disc-badge--memo';
  if (c === 'SUSPENSION') return 'disc-badge--susp';
  if (c === 'FELICITACION') return 'disc-badge--feli';
  return 'disc-badge--neutral';
}

export function claseBadgeEstado(estadoApi) {
  const c = canonicalEstadoApi(estadoApi);
  if (c === 'NOTIFICADO') return 'disc-badge-est--ok';
  if (c === 'EMITIDO' || c === 'BORRADOR') return 'disc-badge-est--emit';
  return 'disc-badge-est--emit';
}
