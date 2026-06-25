/**
 * Afiliación asociada al empleado para precargar certificación de tipo AFILIACIONES.
 */
import { esEstadoAfiliacionActiva } from '../../../utils/afiliacionEstado';

export function esAfiliacionVigenteParaCertificacion(row) {
  if (!row || typeof row !== 'object') return false;
  return esEstadoAfiliacionActiva(row.estado_afiliacion);
}

export function afiliacionVigentePorEmpleado(afiliaciones, codEmpleado) {
  const cod = String(codEmpleado ?? '').trim();
  if (!cod || !Array.isArray(afiliaciones)) return null;
  const delEmpleado = afiliaciones.filter((a) => String(a.cod_empleado ?? a.empleado?.cod_empleado ?? '') === cod);
  const vigentes = delEmpleado.filter(esAfiliacionVigenteParaCertificacion);
  if (vigentes.length === 0) return null;
  vigentes.sort((a, b) => Number(b.cod_afiliacion ?? 0) - Number(a.cod_afiliacion ?? 0));
  return vigentes[0];
}

export function salarioNumericoDesdeContrato(contrato) {
  if (!contrato || typeof contrato !== 'object') return null;
  const raw = contrato.salario_base ?? contrato.salario ?? contrato.salario_basico;
  if (raw === '' || raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
