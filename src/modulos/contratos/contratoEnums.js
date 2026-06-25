/** Valores enviados al API (string, máx. 150 en backend). Deben coincidir con config/rrhh.php. */

export const TIPO_CONTRATO_OPCIONES = [
  { valor: 'Termino indefinido', etiqueta: 'Término indefinido' },
  { valor: 'Termino fijo', etiqueta: 'Término fijo' },
  { valor: 'Obra o labor', etiqueta: 'Obra o labor' },
  { valor: 'Aprendizaje', etiqueta: 'Aprendizaje' },
  { valor: 'Prestacion de servicios', etiqueta: 'Prestación de servicios' },
];

export const FORMA_DE_PAGO_OPCIONES = [
  { valor: 'Mensual', etiqueta: 'Mensual' },
  { valor: 'Quincenal', etiqueta: 'Quincenal' },
  { valor: 'Por hora', etiqueta: 'Por hora' },
];

export const MODALIDAD_TRABAJO_OPCIONES = [
  { valor: 'Presencial', etiqueta: 'Presencial' },
  { valor: 'Remoto', etiqueta: 'Remoto' },
  { valor: 'Hibrido', etiqueta: 'Híbrido' },
];

export const HORARIO_TRABAJO_OPCIONES = [
  { valor: 'Tiempo completo', etiqueta: 'Tiempo completo' },
  { valor: 'Medio tiempo', etiqueta: 'Medio tiempo' },
  { valor: 'Por turnos', etiqueta: 'Por turnos' },
];

export const ESTADO_CONTRATO = [
  { valor: 'ACTIVO', etiqueta: 'Vigente' },
  { valor: 'FINALIZADO', etiqueta: 'Finalizado' },
];

export function etiquetaEstadoContrato(valor) {
  const u = String(valor || '').toUpperCase();
  const normalizado = u === 'INACTIVO' ? 'FINALIZADO' : u;
  const f = ESTADO_CONTRATO.find((e) => e.valor === normalizado);
  return f ? f.etiqueta : valor ? String(valor) : '—';
}
