import { getEmpleados, extraerFilasEmpleados } from './empleados';
import { getContratos, extraerFilasContratos } from './contratos';
import { getIncapacidades, extraerFilasIncapacidades } from './incapacidades';
import { listarInasistenciasApi, extraerInasistenciasApi } from './api/inasistenciasApi';
import { getAfiliaciones, extraerFilasAfiliaciones } from './afiliaciones';
import { getCertificaciones, extraerFilasCertificaciones } from './certificaciones';
import { listarCalendarioActividadesApi, extraerActividadesApi } from './api/calendarioActividadesApi';

function empleadoActivo(e) {
  return String(e?.estado_emp ?? '').toUpperCase() === 'ACTIVO';
}

function contratoVigente(c) {
  return String(c?.estado_contrato ?? '').toUpperCase() === 'ACTIVO';
}

function prefijoAnioMes(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Laravel / front pueden usar distintos nombres de campo para la fecha. */
function ymFechaInasistencia(registro) {
  if (!registro || typeof registro !== 'object') return '';
  const raw = registro.fecha_inasistencia ?? registro.fecha ?? registro.fechaInasistencia ?? '';
  return String(raw).trim().slice(0, 7);
}

function contarInasistenciasEnMes(filas, prefijoYyyyMm) {
  return filas.filter((r) => ymFechaInasistencia(r) === prefijoYyyyMm).length;
}

function serieInasistenciasUltimosMeses(filas, cantMeses) {
  const out = [];
  const ahora = new Date();
  for (let i = cantMeses - 1; i >= 0; i -= 1) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const key = prefijoAnioMes(d);
    const label = d.toLocaleDateString('es-CO', { month: 'short' });
    const cap = label ? label.charAt(0).toUpperCase() + label.slice(1) : key;
    const total = filas.filter((r) => ymFechaInasistencia(r) === key).length;
    out.push({ clave: key, etiqueta: cap, total });
  }
  return out;
}

function enriquecerActividad(a) {
  if (!a || typeof a !== 'object') return null;
  const tipo = String(a.tipo_actividad || a.tipo || '').trim() || 'Actividad';
  const estado = String(a.estado || '').toUpperCase();
  const titulo = String(a.titulo || a.nombre || 'Sin título').trim();
  const fi = String(a.fecha_inicio || '').slice(0, 10);
  const fc = String(a.fecha_creacion || '').slice(0, 10);
  return {
    tipo,
    estado,
    titulo,
    orden: fi || fc || '0000-00-00',
    fechaInicio: fi,
    fechaCreacion: fc,
    prioridad: a.prioridad,
  };
}

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

/**
 * Carga en paralelo listados usados en el dashboard; tolera fallos parciales (cada API por separado).
 */
export async function obtenerDatosDashboard() {
  const claves = [
    'empleados',
    'contratos',
    'incapacidades',
    'inasistencias',
    'afiliaciones',
    'certificaciones',
    'actividades',
  ];
  const settled = await Promise.allSettled([
    getEmpleados(),
    getContratos(),
    getIncapacidades(),
    listarInasistenciasApi(),
    getAfiliaciones(),
    getCertificaciones(),
    listarCalendarioActividadesApi(),
  ]);

  const errores = [];
  const extraer = (i, fn) => {
    const r = settled[i];
    if (r.status === 'fulfilled') return fn(r.value);
    errores.push(claves[i]);
    return fn(null);
  };

  const empleados = extraer(0, (v) => extraerFilasEmpleados(v));
  const contratos = extraer(1, (v) => extraerFilasContratos(v));
  const incapacidades = extraer(2, (v) => extraerFilasIncapacidades(v));
  const inasistencias = extraer(3, (v) => extraerInasistenciasApi(v));
  const afiliaciones = extraer(4, (v) => extraerFilasAfiliaciones(v));
  const certificaciones = extraer(5, (v) => extraerFilasCertificaciones(v));
  const actividadesRaw = extraer(6, (v) => extraerActividadesApi(v));

  const empleadosActivos = empleados.filter(empleadoActivo).length;
  const contratosActivos = contratos.filter(contratoVigente).length;
  const contratosOtros = Math.max(0, contratos.length - contratosActivos);
  const mesActual = prefijoAnioMes(new Date());
  const inasistenciasMes = contarInasistenciasEnMes(inasistencias, mesActual);

  const kpis = [
    { id: 'emp', cantidad: empleadosActivos, etiqueta: 'Empleados activos', color: 'amarillo' },
    { id: 'ctr', cantidad: contratosActivos, etiqueta: 'Contratos vigentes', color: 'rosa' },
    { id: 'ina', cantidad: inasistenciasMes, etiqueta: 'Inasistencias del mes', color: 'naranja' },
    { id: 'inc', cantidad: incapacidades.length, etiqueta: 'Incapacidades registradas', color: 'azul' },
    { id: 'afi', cantidad: afiliaciones.length, etiqueta: 'Afiliaciones', color: 'verde' },
    { id: 'cer', cantidad: certificaciones.length, etiqueta: 'Certificaciones', color: 'morado' },
  ];

  const barrasResumen = [
    { nombre: 'Empleados', valor: empleadosActivos },
    { nombre: 'Contratos', valor: contratosActivos },
    { nombre: 'Incapac.', valor: incapacidades.length },
    { nombre: 'Inasist.', valor: inasistenciasMes },
    { nombre: 'Afiliac.', valor: afiliaciones.length },
    { nombre: 'Certif.', valor: certificaciones.length },
  ];

  const inasistencias6Meses = serieInasistenciasUltimosMeses(inasistencias, 6);

  const actividades = actividadesRaw
    .map(enriquecerActividad)
    .filter(Boolean)
    .sort((a, b) => String(b.orden).localeCompare(String(a.orden)));

  const actividadesRecientes = actividades.slice(0, 6).map((a) => {
    const fecha = a.fechaInicio || a.fechaCreacion;
    const tiempo = fecha
      ? new Date(`${fecha}T12:00:00`).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
        })
      : '—';
    return {
      texto: a.titulo,
      etiqueta: etiquetaCortaTipoActividad(a.tipo),
      tipoEtiqueta: claseEtiquetaPorEstadoActividad(a.estado),
      tiempo,
    };
  });

  const pieContratos =
    contratos.length === 0
      ? []
      : [
          { name: 'Vigentes', value: contratosActivos, fill: '#6366f1' },
          { name: 'Finalizados u otros', value: contratosOtros, fill: '#cbd5e1' },
        ];

  return {
    kpis,
    barrasResumen,
    inasistencias6Meses,
    pieContratos,
    actividadesRecientes,
    errores,
  };
}
