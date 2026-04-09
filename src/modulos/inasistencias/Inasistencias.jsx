import { useEffect, useMemo, useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo, SinDatos } from '../../componentes';
import { useInasistencias } from './hooks/useInasistencias';
import ModalInasistencia from './componentes/ModalInasistencia';
import {
  buildAttendanceCalendar,
  CALENDAR_STATUS,
  ESTADO_UI,
  filtrarInasistencias,
  formatearFechaCorta,
  inicialesEmpleado,
  limpiarMotivoPersistido,
  listaSoloNovedadesRegistrables,
  nombreCompleto,
  obtenerCodigoEmpleado,
  estadoUiDesdeMotivo,
} from './utils/inasistencias.mapper';
import { alertaError, alertaExito, confirmarAccion } from '../../utils/alertasSwal';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
function colorEstado(estado) {
  if (estado === ESTADO_UI.AUSENTE) return 'rojo';
  if (estado === ESTADO_UI.TARDE) return 'amarillo';
  if (estado === ESTADO_UI.PRESENTE) return 'verde';
  return 'gris';
}

function isoDesdeYMD(y, m, d) {
  const yy = String(y);
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function Inasistencias() {
  const {
    empleados,
    contratos,
    inasistenciasTodas,
    inasistencias,
    kpis,
    filtros,
    setFiltros,
    cargando,
    error,
    guardarInasistencia,
    borrarInasistencia,
  } =
    useInasistencias();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  const [filtrosDraft, setFiltrosDraft] = useState(filtros);
  const [fechaPreseleccionada, setFechaPreseleccionada] = useState('');
  const [selectorMesAnioAbierto, setSelectorMesAnioAbierto] = useState(false);

  /** Registros que cumplen mes / año / tipo del filtro (sin restringir por empleado). Sin filas "Presente" redundantes. */
  const inasistenciasCriterioGlobal = useMemo(
    () =>
      filtrarInasistencias(listaSoloNovedadesRegistrables(inasistenciasTodas), {
        ...filtros,
        codEmpleado: '',
      }),
    [inasistenciasTodas, filtros.mes, filtros.anio, filtros.tipo],
  );

  const conteoInasistenciasPorEmpleado = useMemo(() => {
    const m = new Map();
    for (const row of inasistenciasCriterioGlobal) {
      const c = String(row.cod_empleado ?? '');
      if (!c) continue;
      m.set(c, (m.get(c) || 0) + 1);
    }
    return m;
  }, [inasistenciasCriterioGlobal]);

  /** Solo empleados con al menos un registro que coincide con el filtro; búsqueda por nombre, documento o código. */
  const empleadosListaIzquierda = useMemo(() => {
    const q = busquedaEmpleado.toLowerCase().trim();
    return empleados.filter((e) => {
      const cod = String(obtenerCodigoEmpleado(e) ?? '');
      const n = conteoInasistenciasPorEmpleado.get(cod) || 0;
      if (n === 0) return false;
      if (!q) return true;
      const nombre = nombreCompleto(e).toLowerCase();
      return (
        nombre.includes(q) ||
        String(e.doc_iden || '').toLowerCase().includes(q) ||
        cod.toLowerCase().includes(q)
      );
    });
  }, [empleados, conteoInasistenciasPorEmpleado, busquedaEmpleado]);

  const empleadoSeleccionado = useMemo(
    () => empleados.find((e) => String(obtenerCodigoEmpleado(e)) === String(filtros.codEmpleado)) || null,
    [empleados, filtros.codEmpleado],
  );

  const registrosEmpleado = useMemo(() => {
    if (!empleadoSeleccionado) return inasistenciasTodas;
    const cod = String(obtenerCodigoEmpleado(empleadoSeleccionado));
    return inasistenciasTodas.filter((x) => String(x.cod_empleado) === cod);
  }, [inasistenciasTodas, empleadoSeleccionado]);

  const vistaCalendario = useMemo(() => {
    const mesN = Number(filtros.mes);
    const anioN = Number(filtros.anio);
    const m = Number.isFinite(mesN) && mesN >= 1 && mesN <= 12 ? mesN : new Date().getMonth() + 1;
    const y = Number.isFinite(anioN) && anioN > 1970 ? anioN : new Date().getFullYear();
    const diasMes = new Date(y, m, 0).getDate();
    const first = new Date(y, m - 1, 1);
    // JS: 0=Dom, 1=Lun ... 6=Sab. Queremos L..D => offset de espacios al inicio.
    const jsDow = first.getDay();
    const offset = (jsDow + 6) % 7; // 0=>Lun, 6=>Dom
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return { y, m, diasMes, offset, monthLabel: `${monthNames[m - 1]} ${y}` };
  }, [filtros.mes, filtros.anio]);

  const fechaIngresoEmpleado = useMemo(() => {
    if (!empleadoSeleccionado) return '';
    const cod = String(obtenerCodigoEmpleado(empleadoSeleccionado));
    const fechas = (contratos || [])
      .filter((c) => String(c.cod_empleado ?? '') === cod)
      .map((c) => String(c.fecha_ingreso || '').slice(0, 10))
      .filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f))
      .sort();
    return fechas[0] || '';
  }, [contratos, empleadoSeleccionado]);

  const registrosEmpleadoListado = useMemo(() => {
    if (!empleadoSeleccionado) return inasistencias;
    const cod = String(obtenerCodigoEmpleado(empleadoSeleccionado));
    return inasistencias.filter((x) => String(x.cod_empleado) === cod);
  }, [inasistencias, empleadoSeleccionado]);

  const conteoNovedades = useMemo(() => {
    const tardanzas = registrosEmpleado.filter((x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.TARDE).length;
    const libres = registrosEmpleado.filter((x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.LIBRE).length;
    return { tardanzas, libres };
  }, [registrosEmpleado]);

  const calendarioAsistencia = useMemo(
    () =>
      buildAttendanceCalendar({
        year: vistaCalendario.y,
        month: vistaCalendario.m,
        fechaIngreso: fechaIngresoEmpleado,
        inasistencias: registrosEmpleado,
        today: new Date(),
      }),
    [vistaCalendario.y, vistaCalendario.m, fechaIngresoEmpleado, registrosEmpleado],
  );

  const estadoPorFecha = useMemo(() => {
    const map = new Map();
    for (const day of calendarioAsistencia.days) {
      let codigo = '';
      let estado = '';
      if (day.status === CALENDAR_STATUS.PRESENTE) {
        codigo = 'P';
        estado = ESTADO_UI.PRESENTE;
      } else if (day.status === CALENDAR_STATUS.INASISTENCIA) {
        estado = day.inasistenciaTipo || ESTADO_UI.AUSENTE;
        codigo = estado === ESTADO_UI.TARDE ? 'L' : estado === ESTADO_UI.LIBRE ? 'Wo' : 'A';
      } else if (day.status === CALENDAR_STATUS.NO_APLICA) {
        codigo = '';
        estado = CALENDAR_STATUS.NO_APLICA;
      } else if (day.status === CALENDAR_STATUS.PENDIENTE) {
        codigo = '';
        estado = CALENDAR_STATUS.PENDIENTE;
      }
      map.set(day.date, { codigo, estado, status: day.status });
    }
    return map;
  }, [calendarioAsistencia.days]);

  // Mantener filtrosDraft sincronizado con filtros "reales"
  useEffect(() => {
    setFiltrosDraft(filtros);
  }, [filtros]);

  useEffect(() => {
    if (filtros.tipo !== ESTADO_UI.PRESENTE && filtrosDraft.tipo !== ESTADO_UI.PRESENTE) return;
    setFiltros((p) => (p.tipo === ESTADO_UI.PRESENTE ? { ...p, tipo: '' } : p));
    setFiltrosDraft((p) => (p.tipo === ESTADO_UI.PRESENTE ? { ...p, tipo: '' } : p));
  }, [filtros.tipo, filtrosDraft.tipo]);

  useEffect(() => {
    if (!filtros.codEmpleado) return;
    const cod = String(filtros.codEmpleado);
    const visible = empleadosListaIzquierda.some((e) => String(obtenerCodigoEmpleado(e)) === cod);
    if (!visible) {
      setFiltros((p) => ({ ...p, codEmpleado: '' }));
      setFiltrosDraft((p) => ({ ...p, codEmpleado: '' }));
    }
  }, [empleadosListaIzquierda, filtros.codEmpleado]);

  const handleDelete = async (item) => {
    const ok = await confirmarAccion({
      titulo: 'Eliminar inasistencia',
      texto: 'Esta accion no se puede deshacer.',
      confirmButtonText: 'Si, eliminar',
    });
    if (!ok) return;
    try {
      await borrarInasistencia(item.cod_inasistencias);
      await alertaExito('Inasistencia eliminada');
    } catch (e) {
      await alertaError('No se pudo eliminar', mensajeErrorApi(e));
    }
  };

  const handleGuardar = async ({ id, payload }) => {
    await guardarInasistencia({ id, payload });
    await alertaExito(id ? 'Inasistencia actualizada' : 'Inasistencia registrada');
  };

  return (
    <ContenedorPrincipal>
      <div className="inasistencias-modulo">
        <EncabezadoModulo
          titulo="Inasistencias"
          subtitulo="Registra solo novedades; sin registro en un día = asistencia desde la fecha de ingreso"
          textoBoton="Nueva Inasistencia"
          alHacerClic={() => {
            setRegistroEditar(null);
            setFechaPreseleccionada('');
            setModalAbierto(true);
          }}
        />

        <section className="inasistencias-kpis">
          <article className="inasistencia-kpi-card inasistencia-kpi-card--total">
            <span className="inasistencia-kpi-label">Total registros</span>
            <strong className="inasistencia-kpi-value">{kpis.total}</strong>
          </article>
          <article className="inasistencia-kpi-card inasistencia-kpi-card--ausencias">
            <span className="inasistencia-kpi-label">Ausencias</span>
            <strong className="inasistencia-kpi-value">{kpis.ausencias}</strong>
          </article>
          <article className="inasistencia-kpi-card inasistencia-kpi-card--retardos">
            <span className="inasistencia-kpi-label">Retardos</span>
            <strong className="inasistencia-kpi-value">{kpis.retardos}</strong>
          </article>
          <article className="inasistencia-kpi-card inasistencia-kpi-card--justificadas">
            <span className="inasistencia-kpi-label">Justificadas</span>
            <strong className="inasistencia-kpi-value">{kpis.justificadas}</strong>
          </article>
          <article className="inasistencia-kpi-card inasistencia-kpi-card--empleados">
            <span className="inasistencia-kpi-label">Empleados</span>
            <strong className="inasistencia-kpi-value">{kpis.empleados}</strong>
          </article>
        </section>

        <div className="inasistencias-filtros-bar">
          <div className="inasistencias-filtros-bar-inner">
            <input
              type="search"
              className="inasistencias-filtro-busqueda"
              placeholder="Buscar por empleado, documento o código..."
              value={busquedaEmpleado}
              onChange={(e) => setBusquedaEmpleado(e.target.value)}
            />
            <select
              className="inasistencias-filtro-select"
              value={filtrosDraft.tipo}
              onChange={(e) => setFiltrosDraft((p) => ({ ...p, tipo: e.target.value }))}
            >
              <option value="">Todos los tipos</option>
              <option value={ESTADO_UI.AUSENTE}>Ausente</option>
              <option value={ESTADO_UI.TARDE}>Tardanza</option>
              <option value={ESTADO_UI.LIBRE}>Libre</option>
            </select>
            <select
              className="inasistencias-filtro-select"
              value={filtrosDraft.mes}
              onChange={(e) => setFiltrosDraft((p) => ({ ...p, mes: e.target.value }))}
            >
              {[
                'Enero',
                'Febrero',
                'Marzo',
                'Abril',
                'Mayo',
                'Junio',
                'Julio',
                'Agosto',
                'Septiembre',
                'Octubre',
                'Noviembre',
                'Diciembre',
              ].map((nombre, idx) => (
                <option key={nombre} value={String(idx + 1)}>
                  {nombre}
                </option>
              ))}
            </select>
            <select
              className="inasistencias-filtro-select"
              value={filtrosDraft.anio}
              onChange={(e) => setFiltrosDraft((p) => ({ ...p, anio: e.target.value }))}
            >
              {Array.from({ length: 5 }, (_, i) => Number(new Date().getFullYear()) - 2 + i).map((a) => (
                <option key={a} value={String(a)}>
                  {a}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="inasistencias-filtro-boton"
              onClick={() => setFiltros((p) => ({ ...p, ...filtrosDraft }))}
            >
              Filtrar
            </button>
          </div>
        </div>

        {error ? <div className="login-alerta login-alerta--error">{error}</div> : null}
        {cargando ? <p>Cargando inasistencias...</p> : null}

        <section className="inasistencias-paneles">
          <aside className="inasistencias-empleados">
            <div className="inasistencias-empleados-header">
              <h3>Empleados</h3>
              <span>
                {empleadosListaIzquierda.length} con registros
                {busquedaEmpleado.trim() ? ' (búsqueda)' : ''}
              </span>
            </div>
            <input
              type="search"
              placeholder="Buscar empleado..."
              value={busquedaEmpleado}
              onChange={(e) => setBusquedaEmpleado(e.target.value)}
            />
            <div className="inasistencias-empleados-lista">
              {empleadosListaIzquierda.length === 0 ? (
                <p className="inasistencias-empleados-vacio">Ningún empleado coincide con el filtro actual.</p>
              ) : null}
              {empleadosListaIzquierda.map((emp) => {
                const cod = obtenerCodigoEmpleado(emp);
                const activo = String(cod) === String(filtros.codEmpleado);
                const totalEmp = conteoInasistenciasPorEmpleado.get(String(cod)) ?? 0;
                return (
                  <button
                    key={String(cod)}
                    type="button"
                    className={`fila-empleado ${activo ? 'activo' : ''}`}
                    onClick={() => {
                      const next = { ...filtros, codEmpleado: String(cod) };
                      setFiltros(next);
                      setFiltrosDraft(next);
                    }}
                  >
                    <span className="avatar">{inicialesEmpleado(emp).toUpperCase()}</span>
                    <span className="datos">
                      <strong>{nombreCompleto(emp)}</strong>
                      <small>{emp.cargo || emp.nom_cargo || 'Sin cargo'}</small>
                    </span>
                    <span className="contador">{totalEmp}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="inasistencias-detalle">
            {!empleadoSeleccionado ? (
              <SinDatos mensaje="Selecciona un empleado para ver su detalle." />
            ) : (
              <>
                <header className="detalle-header tarjeta-empleado-top">
                  <div>
                    <h3>{nombreCompleto(empleadoSeleccionado)}</h3>
                    <p>{empleadoSeleccionado.email || empleadoSeleccionado.correo_electronico || 'Sin correo'}</p>
                  </div>
                  <div className="tarjeta-empleado-acciones">
                    <button type="button" className="btn-link-limpiar" onClick={() => setFiltros((p) => ({ ...p, codEmpleado: '' }))}>
                      Limpiar
                    </button>
                  </div>
                </header>

                <div className="calendario-box">
                  <div className="cal-wrap">
                    <div className="cal-header">
                      <div className="cal-header-left">
                        <button
                          type="button"
                          className="cal-month cal-month-button"
                          onClick={() => setSelectorMesAnioAbierto((v) => !v)}
                        >
                          {vistaCalendario.monthLabel}
                        </button>
                        <div className="cal-sub">Registro mensual de Asistencia</div>
                        {selectorMesAnioAbierto ? (
                          <div className="cal-selector-mesanio">
                            <select
                              value={vistaCalendario.m}
                              onChange={(e) =>
                                setFiltros((p) => ({
                                  ...p,
                                  mes: String(e.target.value),
                                }))
                              }
                            >
                              {[
                                'Enero',
                                'Febrero',
                                'Marzo',
                                'Abril',
                                'Mayo',
                                'Junio',
                                'Julio',
                                'Agosto',
                                'Septiembre',
                                'Octubre',
                                'Noviembre',
                                'Diciembre',
                              ].map((nombre, idx) => (
                                <option key={nombre} value={String(idx + 1)}>
                                  {nombre}
                                </option>
                              ))}
                            </select>
                            <select
                              value={vistaCalendario.y}
                              onChange={(e) =>
                                setFiltros((p) => ({
                                  ...p,
                                  anio: String(e.target.value),
                                }))
                              }
                            >
                              {Array.from({ length: 5 }, (_, i) => vistaCalendario.y - 2 + i).map((anio) => (
                                <option key={anio} value={String(anio)}>
                                  {anio}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null}
                      </div>
                      <div className="cal-nav">
                        <button
                          type="button"
                          className="cal-btn"
                          onClick={() => {
                            const prev = new Date(vistaCalendario.y, vistaCalendario.m - 2, 1);
                            setFiltros((p) => ({
                              ...p,
                              mes: String(prev.getMonth() + 1),
                              anio: String(prev.getFullYear()),
                            }));
                          }}
                          aria-label="Mes anterior"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="cal-btn"
                          onClick={() => {
                            const next = new Date(vistaCalendario.y, vistaCalendario.m, 1);
                            setFiltros((p) => ({
                              ...p,
                              mes: String(next.getMonth() + 1),
                              anio: String(next.getFullYear()),
                            }));
                          }}
                          aria-label="Mes siguiente"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <div className="cal-grid">
                      {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                        <div key={d} className="cal-dow">
                          {d}
                        </div>
                      ))}
                      {Array.from({ length: vistaCalendario.offset }).map((_, idx) => (
                        <div key={`blank-${idx}`} className="cal-day cal-day--blank" />
                      ))}

                      {Array.from({ length: vistaCalendario.diasMes }).map((_, idx) => {
                        const day = idx + 1;
                        const iso = isoDesdeYMD(vistaCalendario.y, vistaCalendario.m, day);
                        const info = estadoPorFecha.get(iso);
                        const codigo = info?.codigo || '';
                        const statusDia = info?.status || '';
                        const coincideTipo =
                          !filtros.tipo ||
                          (filtros.tipo === ESTADO_UI.AUSENTE && codigo === 'A') ||
                          (filtros.tipo === ESTADO_UI.TARDE && codigo === 'L') ||
                          (filtros.tipo === ESTADO_UI.LIBRE && codigo === 'Wo');
                        const selected = fechaPreseleccionada === iso;
                        const classEstado =
                          codigo === 'A'
                            ? 'day-a'
                            : codigo === 'L'
                              ? 'day-l'
                              : codigo === 'Wo'
                                ? 'day-wo'
                                : codigo === 'P'
                                  ? 'day-p'
                                  : statusDia === CALENDAR_STATUS.NO_APLICA
                                    ? 'day-na'
                                    : statusDia === CALENDAR_STATUS.PENDIENTE
                                      ? 'day-pe'
                                      : 'day-pe';
                        return (
                          <div
                            key={iso}
                            role="button"
                            tabIndex={0}
                            className={`cal-day ${classEstado} ${!coincideTipo ? 'day-muted' : ''} ${selected ? 'day-sel' : ''}`.trim()}
                            onClick={() => {
                              const existente = registrosEmpleado.find(
                                (x) => String(x.fecha_inasistencia || '').slice(0, 10) === iso,
                              );
                              setRegistroEditar(existente || null);
                              setFechaPreseleccionada(iso);
                              setModalAbierto(true);
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== 'Enter' && e.key !== ' ') return;
                              e.preventDefault();
                              const existente = registrosEmpleado.find(
                                (x) => String(x.fecha_inasistencia || '').slice(0, 10) === iso,
                              );
                              setRegistroEditar(existente || null);
                              setFechaPreseleccionada(iso);
                              setModalAbierto(true);
                            }}
                            aria-label={codigo ? `Día ${day} - ${codigo}` : `Día ${day} - sin registro`}
                          >
                            <span className="dn">{day}</span>
                            <span className="ds">{!coincideTipo ? '' : codigo === 'Wo' ? 'Wo' : codigo}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="legend">
                      <button
                        type="button"
                        className={`leg-item leg-item-button ${filtros.tipo === '' ? 'activo' : ''}`}
                        onClick={() => setFiltros((p) => ({ ...p, tipo: '' }))}
                      >
                        <span className="leg-dot leg-dot-all" /> Todos
                      </button>
                      <span className="leg-item leg-item-info" title="Sin fila de novedad en la base de datos">
                        <span className="leg-dot leg-dot-p" /> P asistió (sin novedad)
                      </span>
                      <button
                        type="button"
                        className={`leg-item leg-item-button ${filtros.tipo === ESTADO_UI.AUSENTE ? 'activo' : ''}`}
                        onClick={() => setFiltros((p) => ({ ...p, tipo: ESTADO_UI.AUSENTE }))}
                      >
                        <span className="leg-dot leg-dot-a" /> Ausente(A)
                      </button>
                      <button
                        type="button"
                        className={`leg-item leg-item-button ${filtros.tipo === ESTADO_UI.TARDE ? 'activo' : ''}`}
                        onClick={() => setFiltros((p) => ({ ...p, tipo: ESTADO_UI.TARDE }))}
                      >
                        <span className="leg-dot leg-dot-l" /> Tarde(L)
                      </button>
                      <button
                        type="button"
                        className={`leg-item leg-item-button ${filtros.tipo === ESTADO_UI.LIBRE ? 'activo' : ''}`}
                        onClick={() => setFiltros((p) => ({ ...p, tipo: ESTADO_UI.LIBRE }))}
                      >
                        <span className="leg-dot leg-dot-wo" /> Día Libre(WO)
                      </button>
                    </div>

                    <div className="summary-grid">
                      <div className="sum-card sum-p">
                        <div className="sn">{calendarioAsistencia.totals.presentes}</div>
                        <div className="sl">Sin novedad (P)</div>
                      </div>
                      <div className="sum-card sum-a">
                        <div className="sn">{calendarioAsistencia.totals.inasistencias}</div>
                        <div className="sl">Inasistencias</div>
                      </div>
                      <div className="sum-card sum-l">
                        <div className="sn">{conteoNovedades.tardanzas}</div>
                        <div className="sl">Retardos</div>
                      </div>
                    </div>

                    <div className="summary-grid2">
                      <div className="sum-card2">
                        <div className="sn">{conteoNovedades.libres}</div>
                        <div className="sl">Días libres</div>
                      </div>
                      <div className="sum-card2 sum-f">
                        <div className="sn">{registrosEmpleado.length}</div>
                        <div className="sl">Novedades</div>
                      </div>
                      <div className="sum-card2">
                        <div className="sn">{vistaCalendario.diasMes}</div>
                        <div className="sl">Total de dias</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detalle-lista">
                  {registrosEmpleadoListado.length === 0 ? <SinDatos mensaje="No hay registros para este filtro." /> : registrosEmpleadoListado.map((item) => {
                    const estado = estadoUiDesdeMotivo(item.motivo_inasistencia);
                    return (
                      <div key={String(item.cod_inasistencias)} className="detalle-item-inasistencia">
                        <div>
                          <strong>{formatearFechaCorta(item.fecha_inasistencia)}</strong>
                          <p>{limpiarMotivoPersistido(item.motivo_inasistencia)}</p>
                          <span className={`etiqueta etiqueta-${colorEstado(estado)}`}>{estado}</span>
                          <span className="etiqueta etiqueta-gris">{String(item.justificado || 'NO')}</span>
                        </div>
                        <div className="acciones">
                          <button type="button" onClick={() => { setRegistroEditar(item); setModalAbierto(true); }}>✎</button>
                          <button type="button" onClick={() => handleDelete(item)}>🗑</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </article>
        </section>
      </div>

      <ModalInasistencia
        mostrar={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setRegistroEditar(null);
          setFechaPreseleccionada('');
        }}
        empleados={empleados}
        registroEditar={registroEditar}
        onGuardar={handleGuardar}
        fechaPreseleccionada={fechaPreseleccionada}
        codEmpleadoPreseleccionado={empleadoSeleccionado ? String(obtenerCodigoEmpleado(empleadoSeleccionado)) : ''}
      />
    </ContenedorPrincipal>
  );
}

export default Inasistencias;
