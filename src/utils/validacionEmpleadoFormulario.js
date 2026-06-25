/**
 * Validación cliente espejo de reglas típicas EmpleadoRequest (Laravel).
 * El servidor sigue siendo la fuente de verdad (422).
 */

import { DISCAPACIDAD, ESTADO_CIVIL, GRUPO_SANGUINEO, TIPO_CUENTA, TIPO_DOCUMENTO } from '../modulos/empleados/empleadoEnums';
import { normalizarSexoEmpleadoCanonico } from '../services/catalogos';

/** Edad mínima laboral (aprendices SENA / trabajo adolescente Colombia). */
export const EDAD_MINIMA_LABORAL_COLOMBIA = 15;

const TIPOS_DOC = new Set(TIPO_DOCUMENTO.map((x) => x.valor));
const TIPOS_CUENTA = new Set(TIPO_CUENTA.map((x) => x.valor));
const DISCAPACIDAD_VAL = new Set(DISCAPACIDAD.map((x) => x.valor));
const ESTADO_CIVIL_VAL = new Set(ESTADO_CIVIL.map((x) => x.valor));
const GRUPO_SANGRE_VAL = new Set(GRUPO_SANGUINEO);

/** Nombres/apellidos: Unicode letters + espacios (equivalente \p{L}\s). */
export const REGEX_NOMBRE_APELLIDO = /^[\p{L}\s]+$/u;

/** Profesión / nacionalidad: letras Unicode y espacios. */
export const REGEX_SOLO_LETRAS_ESPACIOS = /^[\p{L}\s]+$/u;

export const REGEX_DOC_NUMERICO = /^[0-9]{5,10}$/;
export const REGEX_PASAPORTE = /^[A-Za-z0-9-]{3,50}$/;
export const REGEX_TELEFONO_CO = /^3[0-9]{9}$/;
export const REGEX_CUENTA_DIGITOS = /^\d{8,20}$/;
/** Sin doble punto en dominio; similar a reglas Laravel habituales. */
export const REGEX_CORREO_EMPLEADO =
  /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

function daysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/**
 * Suma años en calendario (p. ej. 29 feb → 28 feb en año no bisiesto).
 * @param {Date} date
 * @param {number} years
 */
export function addYearsCalendar(date, years) {
  if (!date || Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear() + years;
  const m = date.getMonth();
  const d = Math.min(date.getDate(), daysInMonth(y, m));
  const out = new Date(y, m, d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function parseFechaSoloDia(valor) {
  const t = String(valor ?? '').trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
}

/** Normaliza fechas del API (ISO, datetime o DD/MM/AAAA) a YYYY-MM-DD para inputs type=date. */
export function fechaApiAInput(valor) {
  if (valor == null || valor === '') return '';
  const s = String(valor).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const dmy = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return s.slice(0, 10);
}

/** true si en `ref` ya cumplió `anios` años desde `fechaNac`. */
export function haCumplidoAnios(fechaNac, anios, ref) {
  const fn = fechaNac instanceof Date ? fechaNac : parseFechaSoloDia(fechaNac);
  const limite = fn ? addYearsCalendar(fn, anios) : null;
  const r = ref instanceof Date ? new Date(ref.getTime()) : parseFechaSoloDia(ref);
  if (!limite || !r) return false;
  r.setHours(0, 0, 0, 0);
  return r >= limite;
}

export const MENSAJE_FECHA_NAC_TIPO_DOC =
  'La fecha de nacimiento no es coherente con el tipo de documento: mínimo 15 años para vínculo laboral; con CC debe ser mayor de edad (18+); con TI debe ser menor de 18 y al menos 7 años.';

/** Edad en años cumplidos a la fecha de referencia (medianoche local). */
export function edadCumplidaEn(fechaNac, ref) {
  let n;
  if (fechaNac instanceof Date) {
    n = new Date(fechaNac.getTime());
  } else {
    n = parseFechaSoloDia(fechaNac);
  }
  if (!n || Number.isNaN(n.getTime()) || !ref) return null;
  n.setHours(0, 0, 0, 0);
  const r = new Date(ref);
  r.setHours(0, 0, 0, 0);
  let age = r.getFullYear() - n.getFullYear();
  const rm = r.getMonth() - n.getMonth();
  if (rm < 0 || (rm === 0 && r.getDate() < n.getDate())) age -= 1;
  return age;
}

function hoyMedianoche() {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  return h;
}

function aIsoLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * @param {string} campo
 * @param {Record<string, string>} f — formulario (strings)
 * @param {{ codigosBancoPermitidos?: Set<string> }} [ctx]
 * @returns {string|null}
 */
export function validarCampoEmpleado(campo, f, ctx = {}) {
  const codigosBanco = ctx.codigosBancoPermitidos ?? new Set();
  const hoy = ctx.hoy instanceof Date ? ctx.hoy : hoyMedianoche();
  const hoyStr = aIsoLocal(hoy);

  switch (campo) {
    case 'nombre_empleado': {
      const v = String(f.nombre_empleado ?? '').trim();
      if (!v) return 'El campo nombre empleado es obligatorio.';
      if (v.length < 2 || v.length > 100) {
        return 'El nombre empleado debe tener entre 2 y 100 caracteres.';
      }
      if (!REGEX_NOMBRE_APELLIDO.test(v)) {
        return 'El nombre empleado solo puede contener letras y espacios.';
      }
      return null;
    }
    case 'apellidos_empleado': {
      const v = String(f.apellidos_empleado ?? '').trim();
      if (!v) return 'El campo apellidos empleado es obligatorio.';
      if (v.length < 2 || v.length > 100) {
        return 'El apellidos empleado debe tener entre 2 y 100 caracteres.';
      }
      if (!REGEX_NOMBRE_APELLIDO.test(v)) {
        return 'El apellidos empleado solo puede contener letras y espacios.';
      }
      return null;
    }
    case 'tipo_documento': {
      const t = String(f.tipo_documento ?? '').toUpperCase();
      if (!t) return 'El campo tipo documento es obligatorio.';
      const tiposDoc = ctx.tiposDocumento ?? TIPOS_DOC;
      const valido =
        tiposDoc instanceof Set ? tiposDoc.has(t) : TIPOS_DOC.has(t);
      if (!valido) return 'El tipo de documento seleccionado no es válido.';
      return null;
    }
    case 'doc_iden': {
      const doc = String(f.doc_iden ?? '').trim();
      const tipo = String(f.tipo_documento ?? '').toUpperCase();
      if (!doc) return 'El campo doc iden es obligatorio.';
      if (!tipo) return 'Seleccione el tipo de documento.';
      if (tipo === 'PASAPORTE') {
        if (!REGEX_PASAPORTE.test(doc)) {
          return 'El pasaporte debe tener entre 3 y 50 caracteres (letras, números y guiones).';
        }
        return null;
      }
      if (tipo === 'CC' || tipo === 'CE' || tipo === 'TI') {
        if (!REGEX_DOC_NUMERICO.test(doc)) {
          return 'El documento debe tener entre 5 y 10 dígitos numéricos.';
        }
        return null;
      }
      return 'El tipo de documento seleccionado no es válido.';
    }
    case 'fecha_nac': {
      const raw = String(f.fecha_nac ?? '').trim();
      if (!raw) return 'El campo fecha nac es obligatorio.';
      const fn = parseFechaSoloDia(raw);
      if (!fn) return 'La fecha de nacimiento no tiene un formato válido (AAAA-MM-DD).';
      if (aIsoLocal(fn) >= hoyStr) {
        return 'La fecha de nacimiento debe ser anterior al día de hoy.';
      }
      const hace120 = addYearsCalendar(hoy, -120);
      if (hace120 && fn < hace120) {
        return 'La fecha de nacimiento no puede indicar una edad mayor a 120 años.';
      }
      const tipo = String(f.tipo_documento ?? '').toUpperCase();
      const refLaboral = ctx.fechaReferenciaLaboral
        ? parseFechaSoloDia(ctx.fechaReferenciaLaboral)
        : hoy;
      if (refLaboral && !haCumplidoAnios(fn, EDAD_MINIMA_LABORAL_COLOMBIA, refLaboral)) {
        return MENSAJE_FECHA_NAC_TIPO_DOC;
      }
      if (tipo === 'CC') {
        if (!haCumplidoAnios(fn, 18, hoy)) {
          return MENSAJE_FECHA_NAC_TIPO_DOC;
        }
        return null;
      }
      if (tipo === 'TI') {
        if (!haCumplidoAnios(fn, 7, hoy)) {
          return MENSAJE_FECHA_NAC_TIPO_DOC;
        }
        if (haCumplidoAnios(fn, 18, hoy)) {
          return MENSAJE_FECHA_NAC_TIPO_DOC;
        }
        return null;
      }
      if (tipo === 'CE' || tipo === 'PASAPORTE') {
        return null;
      }
      return null;
    }
    case 'fec_exp_doc': {
      const raw = String(f.fec_exp_doc ?? '').trim();
      if (!raw) return 'El campo fec exp doc es obligatorio.';
      const fx = parseFechaSoloDia(raw);
      if (!fx) return 'La fecha de expedición no tiene un formato válido (AAAA-MM-DD).';
      const fn = f.fecha_nac ? parseFechaSoloDia(f.fecha_nac) : null;
      const fnStr = fn ? aIsoLocal(fn) : '';
      const fxStr = aIsoLocal(fx);
      if (fn && fxStr <= fnStr) {
        return 'La fecha de expedición debe ser posterior a la fecha de nacimiento.';
      }
      if (fxStr > hoyStr) {
        return 'La fecha de expedición no puede ser posterior a hoy.';
      }
      const tipo = String(f.tipo_documento ?? '').toUpperCase();
      if (tipo === 'CC' && fn) {
        const cumple18 = addYearsCalendar(fn, 18);
        if (cumple18 && fxStr < aIsoLocal(cumple18)) {
          return 'Con cédula de ciudadanía, la expedición no puede ser anterior a cumplir 18 años.';
        }
      }
      if (tipo === 'TI' && fn) {
        const cumple7 = addYearsCalendar(fn, 7);
        if (cumple7 && fxStr < aIsoLocal(cumple7)) {
          return 'Con tarjeta de identidad, la expedición no puede ser anterior a cumplir 7 años.';
        }
      }
      return null;
    }
    case 'sexo': {
      const s = normalizarSexoEmpleadoCanonico(f.sexo);
      if (!s) return 'El campo sexo es obligatorio.';
      const sexos = ctx.sexos;
      if (sexos instanceof Set && sexos.size > 0 && !sexos.has(s)) {
        return 'El sexo seleccionado no es válido.';
      }
      return null;
    }
    case 'direccion': {
      const v = String(f.direccion ?? '').trim();
      if (!v) return 'El campo direccion es obligatorio.';
      if (v.length < 10 || v.length > 200) {
        return 'La dirección debe tener entre 10 y 200 caracteres.';
      }
      return null;
    }
    case 'numero_telefono': {
      const v = String(f.numero_telefono ?? '').trim();
      if (!v) return 'El campo numero telefono es obligatorio.';
      if (!REGEX_TELEFONO_CO.test(v)) {
        return 'El celular debe tener 10 dígitos e iniciar en 3.';
      }
      return null;
    }
    case 'correo_empleado': {
      const v = String(f.correo_empleado ?? '').trim();
      if (!v) return 'El campo correo empleado es obligatorio.';
      if (v.length > 120) return 'El correo no puede superar 120 caracteres.';
      if (!REGEX_CORREO_EMPLEADO.test(v)) return 'El correo electrónico no tiene un formato válido.';
      return null;
    }
    case 'numero_cuenta': {
      const v = String(f.numero_cuenta ?? '').trim();
      if (!v) return 'El campo numero cuenta es obligatorio.';
      if (!REGEX_CUENTA_DIGITOS.test(v)) {
        return 'El número de cuenta debe tener entre 8 y 20 dígitos.';
      }
      return null;
    }
    case 'tipo_cuenta': {
      const t = String(f.tipo_cuenta ?? '').toUpperCase();
      if (!t) return 'El campo tipo cuenta es obligatorio.';
      if (!TIPOS_CUENTA.has(t)) return 'El tipo de cuenta seleccionado no es válido.';
      return null;
    }
    case 'cod_banco': {
      const cuenta = String(f.numero_cuenta ?? '').trim();
      const v = String(f.cod_banco ?? '').trim();
      if (cuenta && !v) return 'Seleccione el banco cuando indica número de cuenta.';
      if (!v) return null;
      if (!(codigosBanco instanceof Set) || codigosBanco.size === 0) {
        return 'No se cargó el catálogo de bancos. Recargue la página o inicie sesión de nuevo.';
      }
      if (!codigosBanco.has(v)) return 'El banco seleccionado no es válido.';
      return null;
    }
    case 'discapacidad': {
      const d = String(f.discapacidad ?? '').toUpperCase();
      if (!d) return 'El campo discapacidad es obligatorio.';
      if (!DISCAPACIDAD_VAL.has(d)) return 'El valor de discapacidad no es válido.';
      return null;
    }
    case 'nacionalidad': {
      const v = String(f.nacionalidad ?? '').trim();
      if (!v) return 'El campo nacionalidad es obligatorio.';
      if (v.length < 3 || v.length > 50) {
        return 'La nacionalidad debe tener entre 3 y 50 caracteres.';
      }
      if (!REGEX_SOLO_LETRAS_ESPACIOS.test(v)) {
        return 'La nacionalidad solo puede contener letras y espacios.';
      }
      return null;
    }
    case 'estado_civil': {
      const e = String(f.estado_civil ?? '').toUpperCase();
      if (!e) return 'El campo estado civil es obligatorio.';
      if (!ESTADO_CIVIL_VAL.has(e)) return 'El estado civil seleccionado no es válido.';
      return null;
    }
    case 'grupo_sanguineo': {
      const g = String(f.grupo_sanguineo ?? '').toUpperCase();
      if (!g) return 'El campo grupo sanguineo es obligatorio.';
      if (!GRUPO_SANGRE_VAL.has(g)) return 'El grupo sanguíneo seleccionado no es válido.';
      return null;
    }
    case 'profesion': {
      const v = String(f.profesion ?? '').trim();
      if (!v) return 'El campo profesion es obligatorio.';
      if (v.length < 2 || v.length > 100) {
        return 'La profesión debe tener entre 2 y 100 caracteres.';
      }
      if (!REGEX_SOLO_LETRAS_ESPACIOS.test(v)) {
        return 'La profesión solo puede contener letras y espacios.';
      }
      return null;
    }
    case 'descripcion': {
      const v = String(f.descripcion ?? '').trim();
      if (v.length > 500) return 'La descripción no puede superar 500 caracteres.';
      return null;
    }
    default:
      return null;
  }
}

/** Campos que participan en el envío completo (orden lógico). */
export const CAMPOS_VALIDACION_ENVIO_EMPLEADO = [
  'nombre_empleado',
  'apellidos_empleado',
  'tipo_documento',
  'doc_iden',
  'fecha_nac',
  'sexo',
  'fec_exp_doc',
  'direccion',
  'numero_telefono',
  'correo_empleado',
  'numero_cuenta',
  'tipo_cuenta',
  'cod_banco',
  'discapacidad',
  'nacionalidad',
  'estado_civil',
  'grupo_sanguineo',
  'profesion',
  'descripcion',
];

function payloadCampoEquivalente(a, b) {
  if (a === b) return true;
  const vacio = (v) => v === null || v === undefined || v === '';
  if (vacio(a) && vacio(b)) return true;
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(a);
    const nb = Number(b);
    return !Number.isNaN(na) && !Number.isNaN(nb) && na === nb;
  }
  return String(a ?? '').trim() === String(b ?? '').trim();
}

/**
 * @param {Record<string, string>} formulario
 * @param {{ codigosBancoPermitidos?: Set<string>, fechaReferenciaLaboral?: string }} [ctx]
 * @param {{ payloadInicial?: Record<string, unknown>, payloadActual?: Record<string, unknown>, soloCamposModificados?: boolean }} [opciones]
 * @returns {Record<string, string>}
 */
export function validarFormularioEmpleadoCompleto(formulario, ctx, opciones = {}) {
  const err = {};
  const { payloadInicial, payloadActual, soloCamposModificados } = opciones;
  const soloModificados = Boolean(soloCamposModificados && payloadInicial && payloadActual);

  for (const c of CAMPOS_VALIDACION_ENVIO_EMPLEADO) {
    if (soloModificados && payloadCampoEquivalente(payloadActual[c], payloadInicial[c])) {
      continue;
    }
    const m = validarCampoEmpleado(c, formulario, ctx);
    if (m) err[c] = m;
  }
  return err;
}

/** Texto libre: validar con debounce; el resto puede ser inmediato. */
export const CAMPOS_EMPLEADO_DEBOUNCE_MS = 250;
export const CAMPOS_EMPLEADO_VALIDACION_DEBOUNCED = [
  'nombre_empleado',
  'apellidos_empleado',
  'direccion',
  'profesion',
  'nacionalidad',
  'descripcion',
  'correo_empleado',
];
