import api from './api';
import { nombreCompletoEmpleado } from './empleados';
import { nombreCargoDesde } from './cargos';
import { mensajeErrorApi } from '../utils/mensajeErrorApi';

function extraerData(cuerpo) {
  if (!cuerpo || typeof cuerpo !== 'object') return null;
  return cuerpo.data != null ? cuerpo.data : cuerpo;
}

export function formatearMonedaCop(val) {
  if (val == null || val === '') return '—';
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num);
}

/** API Y-m-d → DD-MM-YYYY */
export function formatearFechaDdMmYyyy(apiDate) {
  if (!apiDate) return '—';
  const s = String(apiDate).split('T')[0];
  const [y, m, d] = s.split('-');
  if (y && m && d) return `${d}-${m}-${y}`;
  return s;
}

export function textoPeriodoPrestacion(inicio, fin) {
  const a = formatearFechaDdMmYyyy(inicio);
  const b = formatearFechaDdMmYyyy(fin);
  if (a === '—' && b === '—') return '—';
  return `${a} al ${b}`;
}

/** Subtítulo tipo "Desde enero de 2024" a partir de fecha_ingreso */
export function textoDesdeFechaIngreso(fecha) {
  if (!fecha) return '—';
  const d = new Date(`${String(fecha).split('T')[0]}T12:00:00`);
  if (Number.isNaN(d.getTime())) return formatearFechaDdMmYyyy(fecha);
  const t = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return t ? `Desde ${t.charAt(0).toUpperCase()}${t.slice(1)}` : '—';
}

export async function getResumenPrestacionesSociales() {
  const { data: cuerpo } = await api.get('/prestaciones-sociales');
  const data = extraerData(cuerpo) ?? {};
  const totales = data.totales_pendientes ?? {};
  const totalesPagados = data.totales_pagados ?? totales.totales_pagados ?? {};
  const contratos = Array.isArray(data.contratos_vigentes) ? data.contratos_vigentes : [];
  return { totales_pendientes: totales, totales_pagados: totalesPagados, contratos_vigentes: contratos };
}

/** Liquidado en API: Pagado o Trasladado (cuenta como no pendiente). */
export function esEstadoPrestacionPagado(estado) {
  const s = String(estado ?? '').trim().toUpperCase();
  return s === 'PAGADO' || s === 'TRASLADADO';
}

/**
 * Suma montos por tipo de prestación según estado_pago de cada período (todos los empleados/contratos).
 * @param {Array<object>} periodos filas de listarPrestacionesSocialesGlobales
 * @returns {{ prima: {pendiente: number, pagado: number}, cesantias: {...}, intereses: {...}, vacaciones: {...} }}
 */
export function agregarMontosPrestacionesPorEstado(periodos) {
  const vacio = () => ({ pendiente: 0, pagado: 0 });
  const acc = {
    prima: vacio(),
    cesantias: vacio(),
    intereses: vacio(),
    vacaciones: vacio(),
  };
  if (!Array.isArray(periodos)) return acc;
  for (const p of periodos) {
    if (!p || typeof p !== 'object') continue;
    const bucket = esEstadoPrestacionPagado(p.estado_pago) ? 'pagado' : 'pendiente';
    acc.prima[bucket] += Number(p.prima_valor) || 0;
    acc.cesantias[bucket] += Number(p.cesantias_valor) || 0;
    acc.intereses[bucket] += Number(p.intereses_cesantias_valor) || 0;
    acc.vacaciones[bucket] += Number(p.vacaciones_valor) || 0;
  }
  return acc;
}

/**
 * Una tarjeta KPI: prioriza monto pendiente; si no hay, muestra total pagado y etiqueta (pagado).
 */
export function construirTarjetaKpiPrestacion({ tituloBase, pendiente, pagado, color }) {
  const p = Number(pendiente) || 0;
  const g = Number(pagado) || 0;
  const esPendiente = p > 0;
  const monto = esPendiente ? p : g;
  const estadoEtiqueta = esPendiente ? 'pendiente' : g > 0 ? 'pagado' : 'pendiente';
  return {
    titulo: `${tituloBase} (${estadoEtiqueta})`,
    valor: formatearMonedaCop(monto),
    color,
  };
}

export async function getTotalesPendientesPrestaciones() {
  const { data: cuerpo } = await api.get('/prestaciones-sociales/totales');
  const data = extraerData(cuerpo);
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data.totales_pendientes ?? data;
  }
  return {};
}

export async function getContratoPrestaciones(codContrato) {
  const { data: cuerpo } = await api.get(`/contratos/${codContrato}/prestaciones`);
  const data = extraerData(cuerpo) ?? {};
  return {
    contrato: data.contrato ?? null,
    prestaciones: Array.isArray(data.prestaciones) ? data.prestaciones : [],
  };
}

export async function postCalcularPrestacionesContrato(codContrato) {
  const { data } = await api.post(`/contratos/${codContrato}/calcular-prestaciones`, {});
  return data;
}

/**
 * Mensaje de error para pantallas de prestaciones: reutiliza mensajeErrorApi y, en 422 sin detalle claro,
 * añade orientación sobre parametrización legal (salario mínimo / auxilio por año) para el usuario.
 */
export function mensajeErrorPrestacionesSociales(error) {
  const msg = mensajeErrorApi(error);
  if (error?.response?.status !== 422) return msg;
  const textoYaDiceParam = /par[aá]metro|parametro|laboral|smmlv|auxilio|año/i.test(msg);
  if (textoYaDiceParam) return msg;
  return `${msg} Si falta el salario mínimo legal o el valor del auxilio de transporte de algún año en la parametrización, pídale al administrador que los registre. Esta pantalla solo muestra el resultado del cálculo del sistema.`;
}

export async function postGestionarPrestacionSocial({ cod_prestacion_social_periodo, estado_pago }) {
  const { data } = await api.post('/prestaciones-sociales/gestionar', {
    cod_prestacion_social_periodo,
    estado_pago,
  });
  return data;
}

export async function deletePrestacionSocialPeriodo(codPeriodo) {
  const { data } = await api.delete(`/prestaciones-sociales/${codPeriodo}`);
  return data;
}

export function extraerFilasListadoPrestacionesGlobales(cuerpo) {
  const data = extraerData(cuerpo);
  if (Array.isArray(data)) return data.filter((x) => x != null && typeof x === 'object');
  if (Array.isArray(data?.prestaciones)) return data.prestaciones;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function listarPrestacionesSocialesGlobales() {
  const { data: cuerpo } = await api.get('/prestaciones-sociales/listar');
  return extraerFilasListadoPrestacionesGlobales(cuerpo);
}

/** Fila normalizada para la tabla principal (contratos vigentes). */
export function filaResumenContratoPrestaciones(contrato) {
  if (!contrato || typeof contrato !== 'object') return null;
  const emp = contrato.empleado ?? {};
  const cargo = contrato.cargo ?? {};
  const cod = contrato.cod_contrato;
  return {
    cod_contrato: cod,
    _nombre: nombreCompletoEmpleado(emp),
    _documento: emp.doc_iden != null && emp.doc_iden !== '' ? String(emp.doc_iden) : '—',
    _numeroContrato: cod != null ? `N°${cod}` : '—',
    _periodoSubtitulo: textoDesdeFechaIngreso(contrato.fecha_ingreso),
    _cargo: nombreCargoDesde(cargo),
    _fechaInicio: formatearFechaDdMmYyyy(contrato.fecha_ingreso),
    _estadoContrato: contrato.estado_contrato ?? '',
    ...contrato,
  };
}
