/** Valores enviados al API (string ≤50). */
export const TIPOS_COMUNICACION = [
  { api: 'MEMORANDO', etiqueta: 'Memorando', icono: 'memo' },
  { api: 'LLAMADO_VERBAL', etiqueta: 'Llamado verbal', icono: 'chat' },
  { api: 'SUSPENSION', etiqueta: 'Suspensión', icono: 'stop' },
  { api: 'FELICITACION', etiqueta: 'Felicitación', icono: 'star' },
];

/** Estados expuestos en UI y filtros (alineado a registro directo vía API, sin borrador). */
export const ESTADOS_COMUNICACION = [
  { api: 'EMITIDO', etiqueta: 'Emitido' },
  { api: 'NOTIFICADO', etiqueta: 'Notificado' },
];

/** Valor que envía el front al crear un documento (queda registrado de una vez). */
export const ESTADO_INICIAL_AL_CREAR = 'EMITIDO';

export const MAX_MOTIVO_CHARS = 20;
export const MAX_DESCRIPCION_CHARS = 500;

export function canonicalTipoApi(valor) {
  const s = String(valor || '').toUpperCase().replace(/\s+/g, '_');
  if (s.includes('MEMORAND')) return 'MEMORANDO';
  if (s.includes('LLAMADO')) return 'LLAMADO_VERBAL';
  if (s.includes('SUSPENS')) return 'SUSPENSION';
  if (s.includes('FELICIT')) return 'FELICITACION';
  const ok = ['MEMORANDO', 'LLAMADO_VERBAL', 'SUSPENSION', 'FELICITACION'];
  if (ok.includes(s)) return s;
  return s.slice(0, 50) || 'MEMORANDO';
}

export function canonicalEstadoApi(valor) {
  const s = String(valor || '').toUpperCase();
  if (s.includes('NOTIFIC')) return 'NOTIFICADO';
  if (s.includes('EMIT')) return 'EMITIDO';
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

export function radicadoDesdeCod(cod) {
  if (cod == null || cod === '') return 'GD-—';
  return `GD-${String(cod).padStart(4, '0')}`;
}

export function claseBadgeTipo(tipoApi) {
  const c = canonicalTipoApi(tipoApi);
  if (c === 'MEMORANDO') return 'disc-badge--memo';
  if (c === 'LLAMADO_VERBAL') return 'disc-badge--llamado';
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
