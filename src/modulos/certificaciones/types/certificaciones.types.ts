export type CertificacionTipo = 'LABORAL' | 'AFILIACIONES' | string;

export interface Certificacion {
  cod_certificacion: number;
  id_empresa: number;
  cod_empleado: number;
  cod_contrato: number | null;
  tipo_certificacion: CertificacionTipo;
  incluye_salario: boolean;
  salario_certificado: number | null;
  cod_eps: number | null;
  cod_arl: number | null;
  cod_pension: number | null;
  cod_caja: number | null;
  cod_cesantias: number | null;
  fecha_emision: string;
  ciudad_emision: string;
  descripcion: string | null;
  empresa?: Empresa | null;
  empleado?: Empleado | null;
  contrato?: Contrato | null;
}

export interface CertificacionPayload {
  id_empresa: number;
  cod_empleado: number;
  cod_contrato: number | null;
  tipo_certificacion: string;
  incluye_salario: boolean;
  salario_certificado: number | null;
  cod_eps: number | null;
  cod_arl: number | null;
  cod_pension: number | null;
  cod_caja: number | null;
  cod_cesantias: number | null;
  fecha_emision: string;
  ciudad_emision: string;
  descripcion: string | null;
}

export interface Empresa {
  id_empresa: number;
  nom_empresa?: string;
  nombre_empresa?: string;
}

export interface Empleado {
  cod_empleado: number;
  doc_iden: string;
  nombre_empleado: string;
  apellidos_empleado: string;
}

export interface Contrato {
  cod_contrato: number;
  cod_empleado: number;
  tipo_contrato?: string;
  fecha_inicio?: string;
  salario_base?: number;
  cargo?: { nombre_cargo?: string } | string;
}

export interface CatalogosCertificacion {
  empresas: Empresa[];
  empleados: Empleado[];
  contratos: Contrato[];
  eps: Array<{ cod_eps: number; nombre_eps?: string }>;
  arls: Array<{ cod_arl: number; nombre_arl?: string }>;
  pensiones: Array<{ cod_fondo_pensiones: number; nombre_fondo_pension?: string }>;
  cajas: Array<{ cod_caja_compensacion: number; nombre_caja_compensacion?: string }>;
  cesantias: Array<{ cod_fondo_cesantias: number; nombre_fondo_cesantia?: string }>;
}
