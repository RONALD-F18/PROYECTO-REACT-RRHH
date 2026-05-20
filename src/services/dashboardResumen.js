import api from './api';

function etiquetaCortaTipoActividad(tipo) {
  const u = String(tipo || '').toUpperCase();
  if (u.includes('REUN')) return 'Reunión';
  if (u.includes('RECORD')) return 'Recordatorio';
  return 'Calendario';
}

function claseEtiquetaPorEstadoActividad(estado) {
  if (estado === 'COMPLETADA') return 'verde';
  if (estado === 'EN_PROGRESO') return 'amarillo';
  return 'azul';
}

function mapearPieContratos(pie) {
  if (!Array.isArray(pie) || pie.length === 0) return [];
  const colores = ['#6366f1', '#cbd5e1'];
  return pie.map((x, i) => ({
    name: x.name ?? x.nombre ?? '—',
    value: Number(x.value ?? x.valor) || 0,
    fill: colores[i % colores.length],
  }));
}

function mapearActividadesRecientes(actividades) {
  if (!Array.isArray(actividades)) return [];
  return actividades.slice(0, 6).map((a) => {
    const fecha = String(a.fecha_inicio || a.fecha_creacion || '').slice(0, 10);
    const tiempo = fecha
      ? new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
        })
      : '—';
    const tipo = String(a.tipo_actividad || a.tipo || '').trim() || 'Actividad';
    const estado = String(a.estado || '').toUpperCase();
    return {
      texto: String(a.titulo || a.nombre || 'Sin título').trim(),
      etiqueta: etiquetaCortaTipoActividad(tipo),
      tipoEtiqueta: claseEtiquetaPorEstadoActividad(estado),
      tiempo,
    };
  });
}

/**
 * Convierte `data` del endpoint GET /dashboard/resumen al shape que usa Panel.jsx.
 */
export function armarResumenDashboardDesdeApi(data, errores = []) {
  const d = data && typeof data === 'object' ? data : {};
  const empleadosActivos = Number(d.empleados_activos) || 0;
  const contratosActivos = Number(d.contratos_vigentes) || 0;
  const inasistenciasMes = Number(d.inasistencias_mes_actual) || 0;
  const incapacidadesTotal = Number(d.incapacidades_total) || 0;
  const afiliacionesTotal = Number(d.afiliaciones_total) || 0;
  const certificacionesTotal = Number(d.certificaciones_total) || 0;

  const kpis = [
    { id: 'emp', cantidad: empleadosActivos, etiqueta: 'Empleados activos', color: 'amarillo' },
    { id: 'ctr', cantidad: contratosActivos, etiqueta: 'Contratos vigentes', color: 'rosa' },
    { id: 'ina', cantidad: inasistenciasMes, etiqueta: 'Inasistencias del mes', color: 'naranja' },
    { id: 'inc', cantidad: incapacidadesTotal, etiqueta: 'Incapacidades registradas', color: 'azul' },
    { id: 'afi', cantidad: afiliacionesTotal, etiqueta: 'Afiliaciones', color: 'verde' },
    { id: 'cer', cantidad: certificacionesTotal, etiqueta: 'Certificaciones', color: 'morado' },
  ];

  const barrasResumen = [
    { nombre: 'Empleados', valor: empleadosActivos },
    { nombre: 'Contratos', valor: contratosActivos },
    { nombre: 'Incapac.', valor: incapacidadesTotal },
    { nombre: 'Inasist.', valor: inasistenciasMes },
    { nombre: 'Afiliac.', valor: afiliacionesTotal },
    { nombre: 'Certif.', valor: certificacionesTotal },
  ];

  const inasistencias6Meses = Array.isArray(d.inasistencias_ultimos_6_meses)
    ? d.inasistencias_ultimos_6_meses.map((m) => ({
        clave: m.clave,
        etiqueta: m.etiqueta,
        total: Number(m.total) || 0,
      }))
    : [];

  return {
    kpis,
    barrasResumen,
    inasistencias6Meses,
    pieContratos: mapearPieContratos(d.contratos_pie),
    actividadesRecientes: mapearActividadesRecientes(d.actividades_recientes),
    errores,
  };
}

/** @deprecated Solo tests; el panel usa armarResumenDashboardDesdeApi. */
export function armarResumenDashboard(props) {
  return armarResumenDashboardDesdeApi(
    {
      empleados_activos: props.empleados?.filter?.((e) => String(e?.estado_emp).toUpperCase() === 'ACTIVO')
        ?.length,
      contratos_vigentes: props.contratos?.filter?.(
        (c) => String(c?.estado_contrato).toUpperCase() === 'ACTIVO',
      )?.length,
      inasistencias_mes_actual: 0,
      incapacidades_total: props.incapacidades?.length ?? 0,
      afiliaciones_total: props.afiliaciones?.length ?? 0,
      certificaciones_total: props.certificaciones?.length ?? 0,
      inasistencias_ultimos_6_meses: [],
      contratos_pie: [],
      actividades_recientes: props.actividadesRaw ?? [],
    },
    props.errores ?? [],
  );
}

/**
 * Una sola petición al resumen agregado del dashboard (reemplaza 7 GET de listados).
 */
export async function obtenerDatosDashboard({ onProgreso } = {}) {
  const vacio = armarResumenDashboardDesdeApi(null, ['sistema']);
  onProgreso?.(vacio, true);

  try {
    const { data: cuerpo } = await api.get('/dashboard/resumen');
    const payload = cuerpo?.data ?? cuerpo;
    const resumen = armarResumenDashboardDesdeApi(payload, []);
    onProgreso?.(resumen, false);
    return resumen;
  } catch {
    const resumen = armarResumenDashboardDesdeApi(null, ['sistema']);
    onProgreso?.(resumen, false);
    return resumen;
  }
}
