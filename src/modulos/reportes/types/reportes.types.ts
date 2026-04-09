export type ReporteModulo =
  | 'empleados'
  | 'contratos'
  | 'prestaciones'
  | 'incapacidades'
  | 'inasistencias'
  | 'afiliaciones'
  | 'disciplinario';

/** Alineado con ReporteRequest `params` (todas opcionales). */
export interface ReporteParamsDto {
  cod_empleado?: number;
  cod_contrato?: number;
  tipo_certificacion?: string;
  descripcion?: string;
}

export interface GenerarReporteRequestDto {
  modulo: ReporteModulo;
  /** ReporteRequest: requerido en API; hoy siempre resumen por módulo. */
  tipo: 'resumen_general';
  params?: ReporteParamsDto;
}
