import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';
import { ModalIncapacidad } from './componentes';
import {
  getIncapacidadById,
  deleteIncapacidad,
  patchIncapacidad,
  normalizarRegistroIncapacidad,
  parseDetalleIncapacidad,
  nombreTipoIncapacidadDesdeFila,
  codigoIncapacidadDesde,
} from '../../services/incapacidades';
import { getEmpleados, extraerFilasEmpleados, nombreCompletoEmpleado, codigoEmpleadoDesde } from '../../services/empleados';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';

function formatearSoloFecha(valor) {
  if (!valor) return '—';
  const t = String(valor).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(valor);
}

function diasEntre(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return 0;
  const a = new Date(`${String(fechaInicio).slice(0, 10)}T12:00:00`);
  const b = new Date(`${String(fechaFin).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  return Math.ceil((b - a) / 86400000) + 1;
}

function entidadPagadoraPorTipo(tipo) {
  const t = String(tipo || '').toLowerCase();
  if (t.includes('accidente') || t.includes('laboral')) return 'ARL';
  return 'EPS';
}

function inicialesDesdeNombre(nombre) {
  const p = String(nombre || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (p.length === 0) return '—';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0] ?? ''}${p[p.length - 1][0] ?? ''}`.toUpperCase() || '—';
}

function formatearCOP(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
}

const ESTADOS_SELECT = [
  { valor: 'Activa', etiqueta: 'Activa' },
  { valor: 'Finalizada', etiqueta: 'Finalizada' },
  { valor: 'Cancelada', etiqueta: 'Cancelada' },
];

function DetallesIncapacidad() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [registro, setRegistro] = useState(null);
  const [distribucionPagos, setDistribucionPagos] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    setError('');
    setCargando(true);
    try {
      const raw = await getIncapacidadById(id);
      const { incapacidad: incApi, distribucion_pagos } = parseDetalleIncapacidad(raw);
      const r = incApi ?? normalizarRegistroIncapacidad(raw) ?? raw?.data;
      const cod = codigoIncapacidadDesde(r);
      if (!r || cod == null) {
        setRegistro(null);
        setDistribucionPagos(null);
        setError('No se encontró la incapacidad.');
        return;
      }
      setRegistro(r);
      setDistribucionPagos(distribucion_pagos);
    } catch (e) {
      setRegistro(null);
      setDistribucionPagos(null);
      setError(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const je = await getEmpleados();
        if (!a) return;
        setEmpleados(extraerFilasEmpleados(je));
      } catch {
        if (a) setEmpleados([]);
      }
    })();
    return () => {
      a = false;
    };
  }, []);

  const vista = useMemo(() => {
    if (!registro) return null;
    let emp =
      registro.empleado && typeof registro.empleado === 'object' && !Array.isArray(registro.empleado)
        ? registro.empleado
        : null;
    if (!emp && registro.cod_empleado != null) {
      emp = empleados.find((e) => String(codigoEmpleadoDesde(e)) === String(registro.cod_empleado)) ?? null;
    }
    const nombreEmp = emp ? nombreCompletoEmpleado(emp) : '—';
    const docEmp = emp ? String(emp.doc_iden ?? '—') : '—';
    const tipo = nombreTipoIncapacidadDesdeFila(registro);
    const fi = registro.fecha_inicio ?? registro.fechaInicio;
    const ff = registro.fecha_fin ?? registro.fechaFin;
    const dias = registro.dias_incapacidad ?? registro.dias ?? diasEntre(fi, ff);
    const dp = distribucionPagos;
    const pagador = dp?.entidad_responsable ?? registro.entidad_responsable ?? registro.entidad_pagadora ?? entidadPagadoraPorTipo(tipo);
    const estadoRaw = String(registro.estado_incapacidad || '').trim();
    const estadoVal = ESTADOS_SELECT.some((o) => o.valor === estadoRaw) ? estadoRaw : 'Activa';

    const desc = registro.descripcion != null && String(registro.descripcion).trim() !== '' ? String(registro.descripcion) : '—';
    const cieObj = registro.clasificacionEnfermedad;
    const codigoEnfermedad =
      cieObj && typeof cieObj === 'object'
        ? String(cieObj.codigo_cie10 ?? '—')
        : '—';

    return {
      nombreEmp,
      docEmp,
      iniciales: inicialesDesdeNombre(nombreEmp),
      codigo: codigoIncapacidadDesde(registro),
      tipo,
      dias,
      fechaInicio: formatearSoloFecha(fi),
      fechaFin: formatearSoloFecha(ff),
      pagador,
      porcentajePagador: registro.porcentaje_pagador ? `${registro.porcentaje_pagador}%` : pagador === 'ARL' ? '100%' : '—',
      descripcionDiagnostico: desc,
      codigoEnfermedad,
      diasEmpresa: dp?.dias_empresa ?? registro.dias_empresa ?? 0,
      valorEmpresa: formatearCOP(dp?.monto_empresa ?? registro.valor_empresa),
      diasEps: dp?.dias_eps ?? registro.dias_eps ?? 0,
      valorEps: formatearCOP(dp?.monto_eps ?? registro.valor_eps),
      diasArl: dp?.dias_arl ?? registro.dias_arl ?? 0,
      valorArl: formatearCOP(dp?.monto_arl ?? registro.valor_arl),
      totalPagado: formatearCOP(dp?.total_pagado ?? registro.total_pagado ?? registro.valor_total),
      salarioBase: formatearCOP(dp?.salario_base ?? registro.salario_base),
      salarioDiario: formatearCOP(dp?.salario_diario ?? registro.salario_diario),
      observaciones: desc,
      estadoSelect: estadoVal,
    };
  }, [registro, empleados, distribucionPagos]);

  const manejarCambioEstado = async (nuevoEstado) => {
    const cod = registro ? codigoIncapacidadDesde(registro) : null;
    if (cod == null || !nuevoEstado) return;
    setActualizandoEstado(true);
    try {
      await patchIncapacidad(cod, { estado_incapacidad: nuevoEstado });
      setRegistro((prev) => (prev ? { ...prev, estado_incapacidad: nuevoEstado } : prev));
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    } finally {
      setActualizandoEstado(false);
    }
  };

  const manejarEliminar = async () => {
    const cod = registro ? codigoIncapacidadDesde(registro) : null;
    if (cod == null) return;
    if (!window.confirm('¿Eliminar esta incapacidad?')) return;
    try {
      await deleteIncapacidad(cod);
      navegar('/incapacidades');
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  if (cargando) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Incapacidades" subtitulo="Detalle" mostrarBoton={false} />
        <p className="contrato-pagina-cargando">Cargando…</p>
      </ContenedorPrincipal>
    );
  }

  if (error || !registro || !vista) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Incapacidades" subtitulo="Detalle" mostrarBoton={false} />
        <div className="contrato-pagina-alerta contrato-pagina-alerta--error" role="alert">
          <p>{error || 'No disponible.'}</p>
          <button type="button" className="btn-volver" style={{ marginTop: 12 }} onClick={() => navegar('/incapacidades')}>
            ← Volver al listado
          </button>
        </div>
      </ContenedorPrincipal>
    );
  }

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo titulo="Incapacidades" subtitulo="Detalle completo de la incapacidad seleccionada" mostrarBoton={false} />

      <div className="detalle-incapacidad">
        <div className="detalles-acciones">
          <button type="button" className="btn-volver" onClick={() => navegar('/incapacidades')}>
            ← Volver
          </button>
          <div className="detalles-botones-accion">
            <button type="button" className="btn-accion btn-accion-editar" onClick={() => setMostrarModal(true)} title="Editar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" className="btn-accion btn-accion-eliminar" onClick={manejarEliminar} title="Eliminar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>

        <section className="detalle-incapacidad-encabezado">
          <div className="detalle-incapacidad-info">
            <div className="detalle-incapacidad-avatar">
              <span>{vista.iniciales}</span>
            </div>
            <div className="detalle-incapacidad-datos">
              <h1>Detalles de la Incapacidad</h1>
              <p>Información completa del registro médico</p>
              <div className="detalle-incapacidad-empleado">
                <div>
                  <span className="detalle-incapacidad-nombre">{vista.nombreEmp}</span>
                  <span className="detalle-incapacidad-documento">{vista.docEmp}</span>
                  <span className="detalle-incapacidad-codigo">Código: {vista.codigo}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="detalle-incapacidad-estado">
            <select
              value={vista.estadoSelect}
              onChange={(e) => manejarCambioEstado(e.target.value)}
              className="select-estado-incapacidad"
              disabled={actualizandoEstado}
              aria-busy={actualizandoEstado}
            >
              {ESTADOS_SELECT.map((est) => (
                <option key={est.valor} value={est.valor}>
                  {est.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="detalle-incapacidad-resumen-grid">
          <article className="detalle-incapacidad-tarjeta">
            <span className="detalle-tarjeta-etiqueta">Tipo</span>
            <h3 className="detalle-tarjeta-titulo">{vista.tipo}</h3>
          </article>
          <article className="detalle-incapacidad-tarjeta">
            <span className="detalle-tarjeta-etiqueta">Duración</span>
            <h3 className="detalle-tarjeta-titulo">{vista.dias} días</h3>
            <p className="detalle-tarjeta-subtexto">
              Del {vista.fechaInicio} al {vista.fechaFin}
            </p>
          </article>
          <article className="detalle-incapacidad-tarjeta">
            <span className="detalle-tarjeta-etiqueta">Pagador</span>
            <h3 className="detalle-tarjeta-titulo">{vista.pagador}</h3>
            <p className="detalle-tarjeta-subtexto">{vista.porcentajePagador}</p>
          </article>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto azul"></span>
            <h2>Diagnóstico Médico</h2>
          </header>
          <div className="detalle-incapacidad-card">
            <p className="detalle-incapacidad-descripcion">{vista.descripcionDiagnostico}</p>
            <div className="detalle-incapacidad-codigo">
              <span className="detalle-etiqueta">Código Enfermedad</span>
              <span className="detalle-valor">{vista.codigoEnfermedad}</span>
            </div>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto verde"></span>
            <h2>Distribución de Pagos</h2>
          </header>
          <div className="detalle-incapacidad-distribucion">
            <div className="bloque-pago empresa">
              <span className="bloque-pago-etiqueta">Días Empresa</span>
              <span className="bloque-pago-valor">{vista.diasEmpresa}</span>
              <span className="bloque-pago-monto">{vista.valorEmpresa}</span>
            </div>
            <div className="bloque-pago eps">
              <span className="bloque-pago-etiqueta">Días EPS</span>
              <span className="bloque-pago-valor">{vista.diasEps}</span>
              <span className="bloque-pago-monto">{vista.valorEps}</span>
            </div>
            <div className="bloque-pago arl">
              <span className="bloque-pago-etiqueta">Días ARL</span>
              <span className="bloque-pago-valor">{vista.diasArl}</span>
              <span className="bloque-pago-monto">{vista.valorArl}</span>
            </div>
            <div className="bloque-pago total">
              <span className="bloque-pago-etiqueta">Total Pagado</span>
              <span className="bloque-pago-valor">{vista.totalPagado}</span>
            </div>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto celeste"></span>
            <h2>Base Salarial</h2>
          </header>
          <div className="detalle-incapacidad-salario">
            <div>
              <span className="detalle-etiqueta">Salario Base del Contrato</span>
              <span className="detalle-valor">{vista.salarioBase}</span>
            </div>
            <div>
              <span className="detalle-etiqueta">Salario Diario</span>
              <span className="detalle-valor">{vista.salarioDiario}</span>
            </div>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto gris"></span>
            <h2>Observaciones</h2>
          </header>
          <div className="detalle-incapacidad-card">
            <p className="detalle-incapacidad-descripcion">{vista.observaciones}</p>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion acciones">
          <h2 className="detalle-seccion-titulo">Acciones</h2>
          <div className="detalle-incapacidad-acciones">
            <button type="button" className="btn-detalle btn-detalle-secundario" onClick={() => navegar('/incapacidades')}>
              Volver al listado
            </button>
          </div>
        </section>
      </div>

      <ModalIncapacidad
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
        datosIncapacidad={registro}
        empleados={empleados}
        alExito={async () => {
          await cargar();
          setMostrarModal(false);
        }}
      />
    </ContenedorPrincipal>
  );
}

export default DetallesIncapacidad;
