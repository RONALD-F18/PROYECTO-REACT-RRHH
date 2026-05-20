import { getEmpleados, extraerFilasEmpleados } from './empleados';
import { getContratos, extraerFilasContratos } from './contratos';
import { getIncapacidades, extraerFilasIncapacidades } from './incapacidades';
import { listarInasistenciasApi, extraerInasistenciasApi } from './api/inasistenciasApi';
import { getAfiliaciones, extraerFilasAfiliaciones } from './afiliaciones';
import { getCertificaciones, extraerFilasCertificaciones } from './certificaciones';
import { listarCalendarioActividadesApi, extraerActividadesApi } from './api/calendarioActividadesApi';
import {
  CLAVES_LISTAS,
  escribirCacheListaSesion,
  leerCacheListaSesion,
} from '../utils/cacheListaSesion';
import { TTL_CACHE_LISTAS_MS } from '../utils/peticionCompartida';

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
 * Misma lógica de KPIs/gráficas que antes; acepta filas parciales mientras llegan los GET.
 */
export function armarResumenDashboard({
  empleados = [],
  contratos = [],
  incapacidades = [],
  inasistencias = [],
  afiliaciones = [],
  certificaciones = [],
  actividadesRaw = [],
  errores = [],
}) {
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

const FUENTES_DASHBOARD = [
  {
    clave: 'empleados',
    claveError: 'empleados',
    cargar: (op) => getEmpleados(op),
    extraer: (v) => extraerFilasEmpleados(v),
  },
  {
    clave: 'contratos',
    claveError: 'contratos',
    cargar: (op) => getContratos(op),
    extraer: (v) => extraerFilasContratos(v),
  },
  {
    clave: 'incapacidades',
    claveError: 'incapacidades',
    cargar: (op) => getIncapacidades(op),
    extraer: (v) => extraerFilasIncapacidades(v),
  },
  {
    clave: 'inasistencias',
    claveError: 'inasistencias',
    cargar: (op) => listarInasistenciasApi(op),
    extraer: (v) => extraerInasistenciasApi(v),
  },
  {
    clave: 'afiliaciones',
    claveError: 'afiliaciones',
    cargar: (op) => getAfiliaciones(op),
    extraer: (v) => extraerFilasAfiliaciones(v),
  },
  {
    clave: 'certificaciones',
    claveError: 'certificaciones',
    cargar: (op) => getCertificaciones(op),
    extraer: (v) => extraerFilasCertificaciones(v),
  },
  {
    clave: 'actividadesRaw',
    claveError: 'actividades',
    cargar: (op) => listarCalendarioActividadesApi(op),
    extraer: (v) => extraerActividadesApi(v),
  },
];

function estadoFilasVacio() {
  return {
    empleados: [],
    contratos: [],
    incapacidades: [],
    inasistencias: [],
    afiliaciones: [],
    certificaciones: [],
    actividadesRaw: [],
    errores: [],
  };
}

/**
 * Carga en paralelo; llama onProgreso cada vez que termina un listado (UI progresiva).
 * @param {{ forzar?: boolean, onProgreso?: (resumen: ReturnType<armarResumenDashboard>, pendiente: boolean) => void }} [opciones]
 */
export async function obtenerDatosDashboard({ forzar = false, onProgreso } = {}) {
  const filas = estadoFilasVacio();
  const opciones = { forzar };
  let pendientes = FUENTES_DASHBOARD.length;

  const notificar = () => {
    onProgreso?.(armarResumenDashboard(filas), pendientes > 0);
  };

  notificar();

  const procesarFuente = async (fuente) => {
    try {
      const valor = await fuente.cargar(opciones);
      filas[fuente.clave] = fuente.extraer(valor);
    } catch {
      filas.errores.push(fuente.claveError);
      filas[fuente.clave] = fuente.extraer(null);
    } finally {
      pendientes -= 1;
      notificar();
    }
  };

  await Promise.allSettled(FUENTES_DASHBOARD.map((fuente) => procesarFuente(fuente)));

  const resumen = armarResumenDashboard(filas);
  escribirCacheListaSesion(CLAVES_LISTAS.DASHBOARD_RESUMEN, resumen);
  return resumen;
}

/** Muestra el panel al instante si ya hubo una visita en esta pestaña. */
export function leerResumenDashboardDesdeSesion() {
  return leerCacheListaSesion(CLAVES_LISTAS.DASHBOARD_RESUMEN, TTL_CACHE_LISTAS_MS);
}
