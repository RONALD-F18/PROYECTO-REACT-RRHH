export const ESTADO_UI = {
  AUSENTE: 'ausente',
  TARDE: 'tardanza',
  PRESENTE: 'presente',
  LIBRE: 'libre',
};

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
  if (v.includes('tarde') || v.includes('retardo') || v.includes('tard')) return ESTADO_UI.TARDE;
  if (v.includes('presente') || v.includes('asistencia')) return ESTADO_UI.PRESENTE;
  if (v.includes('libre') || v.includes('descanso') || v.includes('wo')) return ESTADO_UI.LIBRE;
  return ESTADO_UI.AUSENTE;
}

export function extraerMensajeValidacion(error, campo) {
  const lista = error?.validation?.errors?.[campo];
  if (!Array.isArray(lista) || !lista.length) return '';
  return String(lista[0] || '');
}

export function construirPayloadInasistencia(formulario) {
  return {
    motivo_inasistencia: String(formulario.motivo || '').trim(),
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

export function calcularKpisInasistencias(lista, empleados) {
  const total = lista.length;
  const ausencias = lista.filter((x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.AUSENTE).length;
  const retardos = lista.filter((x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.TARDE).length;
  const justificadas = lista.filter((x) => String(x.justificado || '').toUpperCase() === 'SI').length;
  return {
    total,
    ausencias,
    retardos,
    justificadas,
    empleados: empleados.length,
  };
}
