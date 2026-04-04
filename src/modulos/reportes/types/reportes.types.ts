export type ReporteModulo =
  | 'empleados'
  | 'contratos'
  | 'prestaciones'
  | 'incapacidades'
  | 'inasistencias'
  | 'afiliaciones'
  | 'disciplinario';

export interface ReporteParamsDto {
  descripcion?: string;
}

export interface GenerarReporteRequestDto {
  modulo: ReporteModulo;
  tipo: 'general';
  params?: ReporteParamsDto;
}
