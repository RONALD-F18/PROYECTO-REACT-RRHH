export function normalizarTipoCertificacion(tipo) {
  return String(tipo ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

export function esCertificacionLaboralTipo(tipo) {
  const u = normalizarTipoCertificacion(tipo);
  return u === 'LABORAL' || u.includes('LABORAL');
}

export function esCertificacionAfiliacionesTipo(tipo) {
  const u = normalizarTipoCertificacion(tipo);
  return u === 'AFILIACIONES' || u.includes('AFILIACION');
}
