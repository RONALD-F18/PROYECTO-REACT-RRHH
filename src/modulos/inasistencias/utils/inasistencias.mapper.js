export const ESTADO_UI = {
  AUSENTE: 'ausente',
  TARDE: 'tardanza',
  PRESENTE: 'presente',
  LIBRE: 'libre',
};

export const CALENDAR_STATUS = {
  PRESENTE: 'presente',
  INASISTENCIA: 'inasistencia',
  NO_APLICA: 'no_aplica',
  PENDIENTE: 'pendiente',
};

const PREFIJO_POR_ESTADO = {
  [ESTADO_UI.AUSENTE]: '',
  [ESTADO_UI.TARDE]: 'Tardanza',
  [ESTADO_UI.LIBRE]: 'Dia libre',
};

/** Registros que no son "Presente" antiguo: solo esas filas son novedades reales. */
export function listaSoloNovedadesRegistrables(lista) {
  return (lista || []).filter((x) => estadoUiDesdeMotivo(x?.motivo_inasistencia) !== ESTADO_UI.PRESENTE);
}

export function obtenerCodigoEmpleado(empleado) {
  if (!empleado || typeof empleado !== 'object') return null;
  return empleado.cod_empleado ?? empleado.id ?? null;
}

export function nombreCompleto(empleado) {
  if (!empleado || typeof empleado !== 'object') return 'Empleado';
  const nombre = [empleado.nombre_empleado, empleado.apellidos_empleado].filter(Boolean).join(' ').trim();
  return nombre || 'Empleado';
}

export function inicialesEmpleado(empleado) {
  const nombre = nombreCompleto(empleado);
  const partes = nombre.split(' ').filter(Boolean);
  return (partes[0]?.[0] || '') + (partes[1]?.[0] || partes[0]?.[1] || '');
}

export function estadoUiDesdeMotivo(motivo) {
  const v = String(motivo || '').toLowerCase();
  if (!v) return ESTADO_UI.AUSENTE;
  if (v.startsWith('tardanza')) return ESTADO_UI.TARDE;
  if (v.startsWith('presente')) return ESTADO_UI.PRESENTE;
  if (v.startsWith('dia libre')) return ESTADO_UI.LIBRE;
  if (v.includes('tarde') || v.includes('retardo') || v.includes('tard')) return ESTADO_UI.TARDE;
  if (v.includes('presente') || v.includes('asistencia')) return ESTADO_UI.PRESENTE;
  if (v.includes('libre') || v.includes('descanso') || v.includes('wo')) return ESTADO_UI.LIBRE;
  return ESTADO_UI.AUSENTE;
}

export function limpiarMotivoPersistido(motivo) {
  const txt = String(motivo || '').trim();
  if (!txt) return '';
  return txt
    .replace(/^tardanza\s*-\s*/i, '')
    .replace(/^presente\s*-\s*/i, '')
    .replace(/^dia libre\s*-\s*/i, '')
    .trim();
}

function construirMotivoPersistido(formulario) {
  const estado = String(formulario?.estado || ESTADO_UI.AUSENTE);
  const base = limpiarMotivoPersistido(formulario?.motivo);
  const prefijo = PREFIJO_POR_ESTADO[estado] || '';
  if (!prefijo) return base;
  return `${prefijo}${base ? ` - ${base}` : ''}`.trim();
}

export function extraerMensajeValidacion(error, campo) {
  const lista = error?.validation?.errors?.[campo];
  if (!Array.isArray(lista) || !lista.length) return '';
  return String(lista[0] || '');
}

export function construirPayloadInasistencia(formulario) {
  if (String(formulario?.estado) === ESTADO_UI.PRESENTE) {
    throw new Error('No se persiste asistencia explícita: use ausencia, tardanza o día libre.');
  }
  return {
    motivo_inasistencia: construirMotivoPersistido(formulario).slice(0, 50),
    fecha_inasistencia: formulario.fecha,
    cod_empleado: Number(formulario.cod_empleado),
    observaciones: String(formulario.observaciones || '').trim() || null,
    justificado: formulario.justificado ? 'SI' : 'NO',
  };
}

export function formatearFechaCorta(fecha) {
  if (!fecha) return '—';
  const t = String(fecha).slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return t;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function filtrarInasistencias(lista, filtros) {
  const mes = Number(filtros.mes || 0);
  const anio = Number(filtros.anio || 0);
  const tipo = filtros.tipo || '';
  const codEmpleado = filtros.codEmpleado ? String(filtros.codEmpleado) : '';
  return lista.filter((item) => {
    const fecha = String(item.fecha_inasistencia || '').slice(0, 10);
    const motivo = String(item.motivo_inasistencia || '');
    const estado = estadoUiDesdeMotivo(motivo);
    if (tipo && estado !== tipo) return false;
    if (codEmpleado && String(item.cod_empleado) !== codEmpleado) return false;
    if (fecha.length === 10 && (mes || anio)) {
      const [y, m] = fecha.split('-');
      if (mes && Number(m) !== mes) return false;
      if (anio && Number(y) !== anio) return false;
    }
    return true;
  });
}

/** Novedades del empleado desde fecha de ingreso (sin filtrar por mes en el listado). */
export function listadoNovedadesEmpleadoDesdeIngreso(novedades, { codEmpleado, fechaIngreso, tipo }) {
  if (!codEmpleado) return [];
  let rows = listaSoloNovedadesRegistrables(novedades).filter(
    (x) => String(x.cod_empleado) === String(codEmpleado),
  );
  const ingreso = fechaIngreso ? String(fechaIngreso).slice(0, 10) : '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(ingreso)) {
    rows = rows.filter((x) => String(x.fecha_inasistencia || '').slice(0, 10) >= ingreso);
  }
  if (tipo) {
    rows = rows.filter((x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === tipo);
  }
  return rows.sort((a, b) =>
    String(b.fecha_inasistencia || '').localeCompare(String(a.fecha_inasistencia || '')),
  );
}

function ymdDesdeValor(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    const y = valor.getFullYear();
    const m = String(valor.getMonth() + 1).padStart(2, '0');
    const d = String(valor.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const t = String(valor).trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : '';
}

function isoDesdePartes(year, month, day) {
  return `${String(year)}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function esFinDeSemana(year, month, day) {
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

/**
 * Construye el calendario mensual de asistencia con reglas de negocio:
 * - antes de ingreso => no_aplica
 * - después de hoy => pendiente
 * - día válido con novedad (ausente/tarde/libre) => inasistencia
 * - día válido sin novedad => asistencia implícita (P); no hace falta fila en BD
 * - filas guardadas como "Presente" (legacy) se ignoran aquí: equivalen a sin novedad
 */
export function buildAttendanceCalendar({ year, month, fechaIngreso, inasistencias = [], today = new Date(), onlyBusinessDays = false }) {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return {
      days: [],
      totals: { presentes: 0, inasistencias: 0, noAplica: 0, pendientes: 0 },
    };
  }

  const todayYmd = ymdDesdeValor(today);
  const ingresoYmd = ymdDesdeValor(fechaIngreso);
  const diasMes = new Date(y, m, 0).getDate();
  const novedadesPorFecha = new Map();

  for (const item of inasistencias || []) {
    const fecha = ymdDesdeValor(item?.fecha_inasistencia ?? item?.date ?? item);
    if (!fecha) continue;
    const tipoMotivo = estadoUiDesdeMotivo(item?.motivo_inasistencia);
    if (tipoMotivo === ESTADO_UI.PRESENTE) continue;
    if (novedadesPorFecha.has(fecha)) continue;
    novedadesPorFecha.set(fecha, tipoMotivo);
  }

  const totals = { presentes: 0, inasistencias: 0, noAplica: 0, pendientes: 0 };
  const days = [];

  for (let day = 1; day <= diasMes; day += 1) {
    const date = isoDesdePartes(y, m, day);
    const inasistenciaTipo = novedadesPorFecha.get(date) || null;
    let status = CALENDAR_STATUS.PRESENTE;

    if (ingresoYmd && date < ingresoYmd) {
      status = CALENDAR_STATUS.NO_APLICA;
    } else if (todayYmd && date > todayYmd) {
      status = CALENDAR_STATUS.PENDIENTE;
    } else if (onlyBusinessDays && esFinDeSemana(y, m, day) && !inasistenciaTipo) {
      status = CALENDAR_STATUS.NO_APLICA;
    } else if (inasistenciaTipo) {
      status = CALENDAR_STATUS.INASISTENCIA;
    }

    if (status === CALENDAR_STATUS.PRESENTE) totals.presentes += 1;
    else if (status === CALENDAR_STATUS.INASISTENCIA) totals.inasistencias += 1;
    else if (status === CALENDAR_STATUS.NO_APLICA) totals.noAplica += 1;
    else if (status === CALENDAR_STATUS.PENDIENTE) totals.pendientes += 1;

    days.push({ date, status, inasistenciaTipo });
  }

  return { days, totals };
}

export function calcularKpisInasistencias(lista) {
  const novedades = listaSoloNovedadesRegistrables(lista);
  const total = novedades.length;
  const ausencias = novedades.filter((x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.AUSENTE).length;
  const retardos = novedades.filter((x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.TARDE).length;
  const justificadas = novedades.filter((x) => String(x.justificado || '').toUpperCase() === 'SI').length;
  const empleadosConRegistro = new Set(
    novedades.map((x) => String(x.cod_empleado ?? '')).filter((c) => c !== ''),
  ).size;
  return {
    total,
    ausencias,
    retardos,
    justificadas,
    empleados: empleadosConRegistro,
  };
}
