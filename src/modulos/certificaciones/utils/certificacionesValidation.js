import { esCertificacionLaboralTipo } from './certificacionTipo.js';

export const TIPOS_CERTIFICACION = [
  { valor: 'LABORAL', texto: 'Certificación Laboral' },
  { valor: 'AFILIACIONES', texto: 'Certificación de Afiliaciones' },
];

/** Documento identidad: solo dígitos, longitud típica Colombia */
export const REGEX_DOCUMENTO_COLOMBIA = /^\d{6,12}$/;

/** Ciudad: letras, espacios, tildes, guion, punto, apóstrofe */
export const REGEX_CIUDAD = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.\-']{2,100}$/;

export function validarDocumentoCertificacion(valor) {
  const s = String(valor ?? '').trim();
  if (!s) return 'Ingrese el número de documento';
  if (!REGEX_DOCUMENTO_COLOMBIA.test(s)) return 'Documento: solo números, entre 6 y 12 dígitos';
  return null;
}

export function estadoInicialCertificacion() {
  return {
    id_empresa: '',
    documento_consulta: '',
    cod_empleado: '',
    cod_contrato: '',
    tipo_certificacion: 'LABORAL',
    incluye_salario: true,
    salario_certificado: '',
    cod_eps: '',
    cod_arl: '',
    cod_pension: '',
    cod_caja: '',
    cod_cesantias: '',
    fecha_emision: '',
    ciudad_emision: '',
    descripcion: '',
  };
}

function esFechaIso(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(valor || '').trim());
}

function esNumeroNoNegativo(valor) {
  if (valor === '' || valor == null) return false;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0;
}

export function validarCampoCertificacion(nombre, valor, form) {
  switch (nombre) {
    case 'id_empresa':
      return valor ? null : 'Debe seleccionar la empresa';
    case 'cod_empleado':
      return valor ? null : 'Confirme el documento para cargar el empleado';
    case 'documento_consulta':
      return validarDocumentoCertificacion(valor);
    case 'tipo_certificacion': {
      const v = String(valor || '').trim().toUpperCase();
      if (!v) return 'Debe seleccionar el tipo de certificación';
      if (v.length > 30) return 'El tipo no puede superar 30 caracteres';
      return null;
    }
    case 'salario_certificado':
      if (!form.incluye_salario) return null;
      if (!esNumeroNoNegativo(valor)) return 'El salario certificado debe ser un número mayor o igual a 0';
      return null;
    case 'fecha_emision':
      if (!valor) return 'La fecha de emisión es obligatoria';
      if (!esFechaIso(valor)) return 'La fecha debe tener formato yyyy-mm-dd';
      if (String(valor).trim() > new Date().toISOString().slice(0, 10))
        return 'La fecha de emisión no puede ser futura';
      return null;
    case 'ciudad_emision': {
      const t = String(valor || '').trim();
      if (!t) return 'La ciudad de emisión es obligatoria';
      if (t.length > 100) return 'La ciudad no puede superar 100 caracteres';
      if (!REGEX_CIUDAD.test(t))
        return 'Ciudad: use solo letras, espacios y caracteres válidos (sin números)';
      return null;
    }
    case 'descripcion':
      if (String(valor || '').length > 150) return 'La descripción no puede superar 150 caracteres';
      return null;
    default:
      return null;
  }
}

export function validarFormularioCertificacion(form, opciones = {}) {
  const campos = [
    'id_empresa',
    'documento_consulta',
    'cod_empleado',
    'tipo_certificacion',
    'salario_certificado',
    'fecha_emision',
    'ciudad_emision',
    'descripcion',
  ];
  const errores = {};
  for (const campo of campos) {
    const e = validarCampoCertificacion(campo, form[campo], form);
    if (e) errores[campo] = e;
  }
  const n = opciones.contratosDelEmpleadoCount ?? 0;
  if (n > 1 && !String(form.cod_contrato || '').trim()) {
    errores.cod_contrato = 'Debe seleccionar el contrato';
  }
  if (esCertificacionLaboralTipo(form.tipo_certificacion) && !String(form.cod_contrato || '').trim()) {
    errores.cod_contrato =
      errores.cod_contrato ||
      'La certificación laboral requiere contrato para el PDF (cargo y fechas desde el contrato).';
  }
  return errores;
}

export function pasoConErroresCertificacion(errores) {
  const grupos = [
    ['id_empresa', 'documento_consulta', 'cod_empleado', 'cod_contrato'],
    ['tipo_certificacion'],
    ['salario_certificado'],
    ['fecha_emision', 'ciudad_emision', 'descripcion'],
  ];
  for (let i = 0; i < grupos.length; i += 1) {
    if (grupos[i].some((campo) => errores[campo])) return i;
  }
  return 0;
}
