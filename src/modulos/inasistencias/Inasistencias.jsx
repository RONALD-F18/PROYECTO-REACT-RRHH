import { useEffect, useMemo, useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo, SinDatos } from '../../componentes';
import { useInasistencias } from './hooks/useInasistencias';
import ModalInasistencia from './componentes/ModalInasistencia';
import {
  ESTADO_UI,
  formatearFechaCorta,
  inicialesEmpleado,
  nombreCompleto,
  obtenerCodigoEmpleado,
  estadoUiDesdeMotivo,
} from './utils/inasistencias.mapper';
import { alertaError, alertaExito, confirmarAccion } from '../../utils/alertas';

function colorEstado(estado) {
  if (estado === ESTADO_UI.AUSENTE) return 'rojo';
  if (estado === ESTADO_UI.TARDE) return 'amarillo';
  if (estado === ESTADO_UI.PRESENTE) return 'verde';
  return 'gris';
}

function fechaIsoLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoDesdeYMD(y, m, d) {
  const yy = String(y);
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function Inasistencias() {
  const { empleados, inasistencias, kpis, filtros, setFiltros, cargando, error, guardarInasistencia, borrarInasistencia } =
    useInasistencias();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
  const [filtrosDraft, setFiltrosDraft] = useState(filtros);
  const [fechaPreseleccionada, setFechaPreseleccionada] = useState('');
  const [selectorMesAnioAbierto, setSelectorMesAnioAbierto] = useState(false);

  const empleadosFiltrados = useMemo(() => {
    const q = busquedaEmpleado.toLowerCase().trim();
    if (!q) return empleados;
    return empleados.filter((e) => {
      const nombre = nombreCompleto(e).toLowerCase();
      return nombre.includes(q) || String(e.doc_iden || '').toLowerCase().includes(q);
    });
  }, [empleados, busquedaEmpleado]);

  const empleadoSeleccionado = useMemo(
    () => empleados.find((e) => String(obtenerCodigoEmpleado(e)) === String(filtros.codEmpleado)) || null,
    [empleados, filtros.codEmpleado],
  );

  const registrosEmpleado = useMemo(() => {
    if (!empleadoSeleccionado) return inasistencias;
    const cod = String(obtenerCodigoEmpleado(empleadoSeleccionado));
    return inasistencias.filter((x) => String(x.cod_empleado) === cod);
  }, [inasistencias, empleadoSeleccionado]);

  const resumenEmpleado = useMemo(() => {
    const presentes = registrosEmpleado.filter(
      (x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.PRESENTE,
    ).length;
    const ausentes = registrosEmpleado.filter(
      (x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.AUSENTE,
    ).length;
    const tardes = registrosEmpleado.filter(
      (x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.TARDE,
    ).length;
    const libres = registrosEmpleado.filter(
      (x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.LIBRE,
    ).length;
    return { presentes, ausentes, tardes, libres, total: registrosEmpleado.length };
  }, [registrosEmpleado]);

  const fechasEstado = useMemo(() => {
    const parseFecha = (s) => {
      const t = String(s || '').slice(0, 10);
      if (!t) return null;
      const d = new Date(`${t}T12:00:00`);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const base = { presente: [], ausente: [], tarde: [], libre: [] };
    for (const item of registrosEmpleado) {
      const fecha = parseFecha(item.fecha_inasistencia);
      if (!fecha) continue;
      const estado = estadoUiDesdeMotivo(item.motivo_inasistencia);
      if (estado === ESTADO_UI.PRESENTE) base.presente.push(fecha);
      else if (estado === ESTADO_UI.TARDE) base.tarde.push(fecha);
      else if (estado === ESTADO_UI.LIBRE) base.libre.push(fecha);
      else base.ausente.push(fecha);
    }
    return base;
  }, [registrosEmpleado]);

  const estadoPorFecha = useMemo(() => {
    const map = new Map();
    for (const item of registrosEmpleado) {
      const f = String(item.fecha_inasistencia || '').slice(0, 10);
      if (!f) continue;
      const estado = estadoUiDesdeMotivo(item.motivo_inasistencia);
      const codigo =
        estado === ESTADO_UI.PRESENTE ? 'P' : estado === ESTADO_UI.AUSENTE ? 'A' : estado === ESTADO_UI.TARDE ? 'L' : 'Wo';
      map.set(f, { codigo, estado });
    }
    return map;
  }, [registrosEmpleado]);

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

  const countsCalendar = useMemo(() => {
    const ausentes = registrosEmpleado.filter(
      (x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.AUSENTE,
    ).length;
    const tardes = registrosEmpleado.filter(
      (x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.TARDE,
    ).length;
    const libres = registrosEmpleado.filter(
      (x) => estadoUiDesdeMotivo(x.motivo_inasistencia) === ESTADO_UI.LIBRE,
    ).length;
    const presentes = Math.max(0, vistaCalendario.diasMes - ausentes - tardes - libres);
    return { presentes, ausentes, tardes, libres };
  }, [registrosEmpleado, vistaCalendario.diasMes]);

  // Mantener filtrosDraft sincronizado con filtros "reales"
  useEffect(() => {
    setFiltrosDraft(filtros);
  }, [filtros]);

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
      await alertaError('No se pudo eliminar', error || String(e?.message || ''));
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
          subtitulo="Control de asistencia del personal"
          textoBoton="Nueva Inasistencia"
          alHacerClic={() => {
            setRegistroEditar(null);
            setFechaPreseleccionada('');
            setModalAbierto(true);
          }}
        />

        <section className="inasistencias-kpis">
          <article>
            <strong>{kpis.total}</strong>
            <span>Total registros</span>
          </article>
          <article>
            <strong>{kpis.ausencias}</strong>
            <span>Ausencias</span>
          </article>
          <article>
            <strong>{kpis.retardos}</strong>
            <span>Retardos</span>
          </article>
          <article>
            <strong>{kpis.justificadas}</strong>
            <span>Justificadas</span>
          </article>
          <article>
            <strong>{kpis.empleados}</strong>
            <span>Empleados</span>
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
              <option value="">Todos los estados</option>
              <option value={ESTADO_UI.AUSENTE}>Ausente</option>
              <option value={ESTADO_UI.TARDE}>Tardanza</option>
              <option value={ESTADO_UI.PRESENTE}>Presente</option>
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
              <span>{empleados.length} total</span>
            </div>
            <input
              type="search"
              placeholder="Buscar empleado..."
              value={busquedaEmpleado}
              onChange={(e) => setBusquedaEmpleado(e.target.value)}
            />
            <div className="inasistencias-empleados-lista">
              {empleadosFiltrados.map((emp) => {
                const cod = obtenerCodigoEmpleado(emp);
                const activo = String(cod) === String(filtros.codEmpleado);
                const totalEmp = inasistencias.filter((x) => String(x.cod_empleado) === String(cod)).length;
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
                    <button
                      type="button"
                      className="btn-link-registrar"
                      onClick={() => {
                        setRegistroEditar(null);
                        setFechaPreseleccionada('');
                        setModalAbierto(true);
                      }}
                    >
                      + Registrar
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
                        const codigo = info?.codigo || 'P';
                        const selected = fechaPreseleccionada === iso;
                        const classEstado =
                          codigo === 'A'
                            ? 'day-a'
                            : codigo === 'L'
                              ? 'day-l'
                              : codigo === 'Wo'
                                ? 'day-wo'
                                : 'day-p';
                        return (
                          <div
                            key={iso}
                            role="button"
                            tabIndex={0}
                            className={`cal-day ${classEstado} ${selected ? 'day-sel' : ''}`.trim()}
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
                            aria-label={`Día ${day} - ${codigo}`}
                          >
                            <span className="dn">{day}</span>
                            <span className="ds">{codigo === 'Wo' ? 'Wo' : codigo}</span>
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
                        <span className="leg-dot leg-dot-p" /> Presente
                      </button>
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
                        <div className="sn">{countsCalendar.presentes}</div>
                        <div className="sl">Presentes</div>
                      </div>
                      <div className="sum-card sum-a">
                        <div className="sn">{countsCalendar.ausentes}</div>
                        <div className="sl">Ausentes</div>
                      </div>
                      <div className="sum-card sum-l">
                        <div className="sn">{countsCalendar.tardes}</div>
                        <div className="sl">Retardos</div>
                      </div>
                    </div>

                    <div className="summary-grid2">
                      <div className="sum-card2">
                        <div className="sn">{countsCalendar.libres}</div>
                        <div className="sl">Días libres</div>
                      </div>
                      <div className="sum-card2 sum-f">
                        <div className="sn">0</div>
                        <div className="sl">Festivos</div>
                      </div>
                      <div className="sum-card2">
                        <div className="sn">{vistaCalendario.diasMes}</div>
                        <div className="sl">Total de dias</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detalle-lista">
                  {registrosEmpleado.length === 0 ? <SinDatos mensaje="No hay registros para este filtro." /> : registrosEmpleado.map((item) => {
                    const estado = estadoUiDesdeMotivo(item.motivo_inasistencia);
                    return (
                      <div key={String(item.cod_inasistencias)} className="detalle-item-inasistencia">
                        <div>
                          <strong>{formatearFechaCorta(item.fecha_inasistencia)}</strong>
                          <p>{item.motivo_inasistencia}</p>
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
