/** Valores enviados al API (string, máx. 150 en backend). */

export const TIPO_CONTRATO_OPCIONES = [
  { valor: 'Término fijo', etiqueta: 'Término fijo' },
  { valor: 'Término indefinido', etiqueta: 'Término indefinido' },
  { valor: 'Obra o labor', etiqueta: 'Obra o labor' },
  { valor: 'Aprendizaje', etiqueta: 'Aprendizaje' },
  { valor: 'Temporal', etiqueta: 'Temporal' },
];

export const FORMA_DE_PAGO_OPCIONES = [
  { valor: 'Consignación bancaria', etiqueta: 'Consignación bancaria' },
  { valor: 'Consignación', etiqueta: 'Consignación' },
  { valor: 'Efectivo', etiqueta: 'Efectivo' },
  { valor: 'Cheque', etiqueta: 'Cheque' },
  { valor: 'Transferencia', etiqueta: 'Transferencia' },
];

export const MODALIDAD_TRABAJO_OPCIONES = [
  { valor: 'Presencial', etiqueta: 'Presencial' },
  { valor: 'Híbrido', etiqueta: 'Híbrido' },
  { valor: 'Remoto', etiqueta: 'Remoto' },
];

export const HORARIO_TRABAJO_OPCIONES = [
  { valor: 'Lun - Vie (8:00 - 12:00, 14:00 - 18:00)', etiqueta: 'Lun - Vie (8:00 - 12:00, 14:00 - 18:00)' },
  { valor: 'Lun - Vie (8:00am - 5:00pm)', etiqueta: 'Lun - Vie (8:00am - 5:00pm)' },
  { valor: 'Lun - Sáb (rotativo)', etiqueta: 'Lun - Sáb (rotativo)' },
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
