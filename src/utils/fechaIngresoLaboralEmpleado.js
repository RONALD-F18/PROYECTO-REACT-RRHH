import { esContratoVigenteParaEmpleado } from '../services/contratos';
import { codigoEmpleadoDesde } from '../services/empleados';
import {
  EDAD_MINIMA_LABORAL_COLOMBIA,
  addYearsCalendar,
  parseFechaSoloDia,
} from './validacionEmpleadoFormulario';

/**
 * Fecha mínima de referencia (YYYY-MM-DD) para novedades laborales: la más temprana entre
 * contratos ACTIVO del empleado; si no hay activos, la más temprana entre todos sus contratos.
 */
export function fechaIngresoLaboralReferencia(empleado, contratosLista) {
  const cod = codigoEmpleadoDesde(empleado);
  if (cod == null || !Array.isArray(contratosLista)) return null;
  const codStr = String(cod);
  const delEmpleado = contratosLista.filter((c) => c && String(c.cod_empleado) === codStr);
  if (!delEmpleado.length) return null;
  const prioritarios = delEmpleado.filter((c) => esContratoVigenteParaEmpleado(c.estado_contrato));
  const usar = prioritarios.length ? prioritarios : delEmpleado;
  let min = null;
  for (const c of usar) {
    const f = c.fecha_ingreso ? String(c.fecha_ingreso).slice(0, 10) : '';
    if (!f) continue;
    if (min === null || f < min) min = f;
  }
  return min;
}

/** Mensaje si la fecha (YYYY-MM-DD) es antes del nacimiento o antes de la edad mínima laboral. */
export function mensajeSiFechaInvalidaParaEmpleadoLaboral(fechaStr, empleado) {
  const fecha = parseFechaSoloDia(fechaStr);
  const fechaNac = parseFechaSoloDia(empleado?.fecha_nac);
  if (!fecha || !fechaNac) return null;
  if (fecha < fechaNac) {
    return 'La fecha no puede ser anterior a la fecha de nacimiento del empleado.';
  }
  const minLegal = addYearsCalendar(fechaNac, EDAD_MINIMA_LABORAL_COLOMBIA);
  if (minLegal && fecha < minLegal) {
    return `La fecha debe ser igual o posterior a cumplir ${EDAD_MINIMA_LABORAL_COLOMBIA} años.`;
  }
  return null;
}

/** Mensaje si la fecha es anterior a la referencia de contrato (YYYY-MM-DD). */
export function mensajeSiFechaAntesDeContrato(fechaStr, fechaContratoYmd) {
  if (!fechaStr || !fechaContratoYmd) return null;
  if (fechaStr < fechaContratoYmd) {
    return 'La fecha no puede ser anterior a la fecha de ingreso al cargo (contrato).';
  }
  return null;
}
