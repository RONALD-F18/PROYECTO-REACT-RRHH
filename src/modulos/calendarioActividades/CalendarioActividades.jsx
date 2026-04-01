import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo, SinDatos, TarjetasResumen } from '../../componentes';
import Modal from '../../componentes/comunes/Modal';
import {
  listarCalendarioActividadesApi,
  obtenerCalendarioActividadApi,
  crearCalendarioActividadApi,
  actualizarCalendarioActividadApi,
  eliminarCalendarioActividadApi,
  extraerActividadesApi,
  extraerActividadApi,
} from '../../services/api/calendarioActividadesApi';
import { codUsuarioSesionLocal } from '../../services/autenticacion';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { alertaError, alertaExito, confirmarAccion } from '../../utils/alertas';
import '../../estilos/modulos/calendario-actividades.css';

const TIPOS = ['TAREA', 'REUNION', 'RECORDATORIO'];
const TIPOS_SUGERIDOS = ['TAREA', 'REUNION', 'RECORDATORIO', 'CAPACITACION', 'SEGUIMIENTO', 'ENTREGA', 'REPORTE'];
const ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'];
const PRIORIDADES = ['ALTA', 'MEDIA', 'BAJA'];
const COLORES = ['#6366F1', '#F97316', '#22C55E', '#EAB308', '#D946EF', '#06B6D4', '#EF4444', '#8B5CF6'];
const NOMBRES_MESES = [
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

function ymd(value) {
  if (!value) return '';
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const t = String(value).trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : '';
}

function inicioMes(anio, mes) {
  return new Date(anio, mes - 1, 1);
}

function isoDesdePartes(anio, mes, dia) {
  return `${String(anio)}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function formatearFechaVista(valor) {
  const t = ymd(valor);
  if (!t) return '—';
  const [a, m, d] = t.split('-');
  return `${d}/${m}/${a}`;
}

function categoriaTipo(tipo) {
  const t = String(tipo || '').toUpperCase();
  if (t.includes('REUN')) return 'REUNION';
  if (t.includes('RECORD') || t.includes('REMIND')) return 'RECORDATORIO';
  return 'TAREA';
}

function etiquetaTipo(tipo) {
  return String(tipo || '')
    .toLowerCase()
    .split('_')
    .map((p) => (p ? `${p.charAt(0).toUpperCase()}${p.slice(1)}` : p))
    .join(' ');
}

function etiquetaPascalConEspacios(valor) {
  return String(valor || '')
    .toLowerCase()
    .split('_')
    .map((p) => (p ? `${p.charAt(0).toUpperCase()}${p.slice(1)}` : p))
    .join(' ');
}

function extraerErrorCampo(error, campo) {
  const lista = error?.validation?.errors?.[campo] ?? error?.response?.data?.errors?.[campo];
  if (!Array.isArray(lista) || !lista.length) return '';
  return String(lista[0] || '');
}

function normalizarActividad(item) {
  return {
    cod_actividad: Number(item?.cod_actividad),
    titulo: String(item?.titulo || '').slice(0, 50),
    tipo: String(item?.tipo || '').toUpperCase(),
    fecha_inicio: ymd(item?.fecha_inicio),
    fecha_fin: ymd(item?.fecha_fin),
    estado: String(item?.estado || '').toUpperCase(),
    descripcion: String(item?.descripcion || ''),
    prioridad: String(item?.prioridad || '').toUpperCase(),
    color: String(item?.color || '').toUpperCase(),
    cod_usuario: item?.cod_usuario != null ? Number(item.cod_usuario) : null,
    fecha_creacion: ymd(item?.fecha_creacion),
    fecha_recordatorio: ymd(item?.fecha_recordatorio),
  };
}

function validarFormulario(form) {
  const err = {};
  const titulo = String(form.titulo || '').trim();
  const tipo = String(form.tipo || '').trim().toUpperCase();
  const fechaInicio = ymd(form.fecha_inicio);
  const fechaFin = ymd(form.fecha_fin);
  const estado = String(form.estado || '').trim().toUpperCase();
  const prioridad = String(form.prioridad || '').trim().toUpperCase();
  const color = String(form.color || '').trim();
  const fechaCreacion = ymd(form.fecha_creacion);
  const recordatorio = ymd(form.fecha_recordatorio);
  const codUsuario = Number(form.cod_usuario);

  if (!titulo) err.titulo = 'El titulo es obligatorio.';
  else if (titulo.length > 50) err.titulo = 'Maximo 50 caracteres.';

  if (!tipo) err.tipo = 'El tipo es obligatorio.';
  else if (tipo.length > 20) err.tipo = 'Maximo 20 caracteres.';

  if (!fechaInicio) err.fecha_inicio = 'La fecha de inicio es obligatoria.';

  if (fechaFin && fechaInicio && fechaFin < fechaInicio) {
    err.fecha_fin = 'La fecha fin debe ser mayor o igual a fecha inicio.';
  }

  if (!estado) err.estado = 'El estado es obligatorio.';
  else if (estado.length > 20) err.estado = 'Maximo 20 caracteres.';

  if (!prioridad) err.prioridad = 'La prioridad es obligatoria.';
  else if (prioridad.length > 20) err.prioridad = 'Maximo 20 caracteres.';

  if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    err.color = 'Color invalido. Usa formato #RRGGBB.';
  }
  if (color && color.length > 10) err.color = 'Maximo 10 caracteres.';

  if (recordatorio && fechaInicio && recordatorio < fechaInicio) {
    err.fecha_recordatorio = 'Recordatorio debe ser mayor o igual a fecha inicio.';
  }

  if (fechaCreacion && !/^\d{4}-\d{2}-\d{2}$/.test(fechaCreacion)) {
    err.fecha_creacion = 'Fecha de creacion invalida.';
  }

  if (!Number.isFinite(codUsuario) || codUsuario <= 0) {
    err.cod_usuario = 'No se encontro usuario autenticado valido.';
  }

  return err;
}

function construirPayload(form) {
  return {
    titulo: String(form.titulo || '').trim(),
    tipo: String(form.tipo || '').trim().toUpperCase(),
    fecha_inicio: ymd(form.fecha_inicio),
    fecha_fin: ymd(form.fecha_fin) || null,
    estado: String(form.estado || '').trim().toUpperCase(),
    descripcion: String(form.descripcion || '').trim() || null,
    prioridad: String(form.prioridad || '').trim().toUpperCase(),
    color: String(form.color || '').trim() || null,
    cod_usuario: Number(form.cod_usuario),
    fecha_creacion: ymd(form.fecha_creacion) || null,
    fecha_recordatorio: ymd(form.fecha_recordatorio) || null,
  };
}

function CalendarioActividades() {
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState('');
  const [filtros, setFiltros] = useState({ tipo: '', estado: '' });
  const [vista, setVista] = useState(() => {
    const now = new Date();
    return { anio: now.getFullYear(), mes: now.getMonth() + 1 };
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [actividadEditar, setActividadEditar] = useState(null);
  const [errorGlobalForm, setErrorGlobalForm] = useState('');
  const [erroresForm, setErroresForm] = useState({});
  const [selectorMesAbierto, setSelectorMesAbierto] = useState(false);
  const [anioSelector, setAnioSelector] = useState(() => new Date().getFullYear());
  const [fechaSeleccionadaModal, setFechaSeleccionadaModal] = useState('');
  const [diaSeleccionadoIso, setDiaSeleccionadoIso] = useState('');
  const clickDiaTimerRef = useRef(null);
  const codUsuario = codUsuarioSesionLocal();
  const [form, setForm] = useState({
    titulo: '',
    tipo: 'TAREA',
    fecha_inicio: ymd(new Date()),
    fecha_fin: ymd(new Date()),
    estado: 'PENDIENTE',
    descripcion: '',
    prioridad: 'MEDIA',
    color: '#6366F1',
    cod_usuario: codUsuario != null ? String(codUsuario) : '',
    fecha_creacion: ymd(new Date()),
    fecha_recordatorio: '',
  });

  const recargar = useCallback(async () => {
    setErrorLista('');
    setCargando(true);
    try {
      const json = await listarCalendarioActividadesApi();
      const lista = extraerActividadesApi(json).map(normalizarActividad).filter((x) => Number.isFinite(x.cod_actividad));
      setActividades(lista);
    } catch (e) {
      setActividades([]);
      setErrorLista(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  useEffect(
    () => () => {
      if (clickDiaTimerRef.current) {
        clearTimeout(clickDiaTimerRef.current);
        clickDiaTimerRef.current = null;
      }
    },
    [],
  );

  const mesIso = `${vista.anio}-${String(vista.mes).padStart(2, '0')}`;
  const actividadesMes = useMemo(
    () => actividades.filter((a) => String(a.fecha_inicio || '').startsWith(mesIso)),
    [actividades, mesIso],
  );

  const actividadesFiltradas = useMemo(() => {
    return actividadesMes.filter((a) => {
      if (filtros.tipo && categoriaTipo(a.tipo) !== filtros.tipo) return false;
      if (filtros.estado && a.estado !== filtros.estado) return false;
      return true;
    });
  }, [actividadesMes, filtros]);

  const kpis = useMemo(() => {
    const total = actividadesMes.length;
    const tareas = actividadesMes.filter((a) => categoriaTipo(a.tipo) === 'TAREA').length;
    const reuniones = actividadesMes.filter((a) => categoriaTipo(a.tipo) === 'REUNION').length;
    const recordatorios = actividadesMes.filter((a) => categoriaTipo(a.tipo) === 'RECORDATORIO').length;
    const pendientes = actividadesMes.filter((a) => a.estado === 'PENDIENTE').length;
    const completadas = actividadesMes.filter((a) => a.estado === 'COMPLETADA').length;
    return { total, tareas, reuniones, recordatorios, pendientes, completadas };
  }, [actividadesMes]);

  const tarjetasResumen = useMemo(
    () => [
      { etiqueta: 'Total', valor: String(kpis.total), color: 'azul', icono: '' },
      { etiqueta: 'Tareas', valor: String(kpis.tareas), color: 'morado', icono: '' },
      { etiqueta: 'Reuniones', valor: String(kpis.reuniones), color: 'verde', icono: '' },
      { etiqueta: 'Recordatorios', valor: String(kpis.recordatorios), color: 'amarillo', icono: '' },
      { etiqueta: 'Pendientes', valor: String(kpis.pendientes), color: 'rojo', icono: '' },
      { etiqueta: 'Completadas', valor: String(kpis.completadas), color: 'verde', icono: '' },
    ],
    [kpis],
  );

  const actividadesPorFecha = useMemo(() => {
    const map = new Map();
    for (const a of actividadesFiltradas) {
      const f = ymd(a.fecha_inicio);
      if (!f) continue;
      const prev = map.get(f) || [];
      prev.push(a);
      map.set(f, prev);
    }
    for (const [k, v] of map) {
      map.set(
        k,
        [...v].sort((x, y) => String(x.prioridad || '').localeCompare(String(y.prioridad || ''))),
      );
    }
    return map;
  }, [actividadesFiltradas]);

  const actividadesPanelDerecho = useMemo(() => {
    if (!diaSeleccionadoIso) return actividadesFiltradas;
    return actividadesPorFecha.get(diaSeleccionadoIso) || [];
  }, [diaSeleccionadoIso, actividadesFiltradas, actividadesPorFecha]);

  const vistaCalendario = useMemo(() => {
    const diasMes = new Date(vista.anio, vista.mes, 0).getDate();
    const first = inicioMes(vista.anio, vista.mes);
    const jsDow = first.getDay();
    const offset = (jsDow + 6) % 7;
    const prevDate = new Date(vista.anio, vista.mes - 2, 1);
    const prevAnio = prevDate.getFullYear();
    const prevMes = prevDate.getMonth() + 1;
    const diasPrevMes = new Date(prevAnio, prevMes, 0).getDate();
    const celdas = [];
    for (let i = 0; i < offset; i += 1) {
      const day = diasPrevMes - offset + i + 1;
      celdas.push({
        iso: isoDesdePartes(prevAnio, prevMes, day),
        day,
        enMesActual: false,
      });
    }
    for (let day = 1; day <= diasMes; day += 1) {
      celdas.push({
        iso: isoDesdePartes(vista.anio, vista.mes, day),
        day,
        enMesActual: true,
      });
    }
    const nextDate = new Date(vista.anio, vista.mes, 1);
    const nextAnio = nextDate.getFullYear();
    const nextMes = nextDate.getMonth() + 1;
    const maxCells = 42;
    for (let i = 1; celdas.length < maxCells; i += 1) {
      celdas.push({
        iso: isoDesdePartes(nextAnio, nextMes, i),
        day: i,
        enMesActual: false,
      });
    }
    return { ...vista, tituloMes: `${NOMBRES_MESES[vista.mes - 1]} ${vista.anio}`, celdas };
  }, [vista]);

  const abrirNuevo = (fecha = '') => {
    setActividadEditar(null);
    setErrorGlobalForm('');
    setErroresForm({});
    const fechaBase = ymd(fecha) || ymd(new Date());
    setFechaSeleccionadaModal(fechaBase);
    setForm({
      titulo: '',
      tipo: 'TAREA',
      fecha_inicio: fechaBase,
      fecha_fin: fechaBase,
      estado: 'PENDIENTE',
      descripcion: '',
      prioridad: 'MEDIA',
      color: '#6366F1',
      cod_usuario: codUsuario != null ? String(codUsuario) : '',
      fecha_creacion: ymd(new Date()),
      fecha_recordatorio: '',
    });
    setModalAbierto(true);
  };

  const abrirEditar = async (actividad) => {
    try {
      const json = await obtenerCalendarioActividadApi(actividad.cod_actividad);
      const detalle = normalizarActividad(extraerActividadApi(json) || actividad);
      setActividadEditar(detalle);
      setErrorGlobalForm('');
      setErroresForm({});
      setForm({
        titulo: detalle.titulo || '',
        tipo: detalle.tipo || 'TAREA',
        fecha_inicio: detalle.fecha_inicio || '',
        fecha_fin: detalle.fecha_fin || '',
        estado: detalle.estado || 'PENDIENTE',
        descripcion: detalle.descripcion || '',
        prioridad: detalle.prioridad || 'MEDIA',
        color: detalle.color || '#6366F1',
        cod_usuario:
          detalle.cod_usuario != null
            ? String(detalle.cod_usuario)
            : codUsuario != null
              ? String(codUsuario)
              : '',
        fecha_creacion: detalle.fecha_creacion || ymd(new Date()),
        fecha_recordatorio: detalle.fecha_recordatorio || '',
      });
      setFechaSeleccionadaModal(detalle.fecha_inicio || ymd(new Date()));
      setModalAbierto(true);
    } catch (error) {
      await alertaError('No se pudo abrir la actividad', mensajeErrorApi(error));
    }
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setActividadEditar(null);
    setFechaSeleccionadaModal('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    const errores = validarFormulario(form);
    setErroresForm(errores);
    setErrorGlobalForm('');
    if (Object.keys(errores).length > 0) return;
    setGuardando(true);
    try {
      const payload = construirPayload({
        ...form,
        cod_usuario: codUsuario != null ? String(codUsuario) : form.cod_usuario,
      });
      if (actividadEditar?.cod_actividad != null) {
        await actualizarCalendarioActividadApi(actividadEditar.cod_actividad, payload);
      } else {
        await crearCalendarioActividadApi(payload);
      }
      await recargar();
      setModalAbierto(false);
      setActividadEditar(null);
      await alertaExito(actividadEditar ? 'Actividad actualizada' : 'Actividad creada');
    } catch (error) {
      setErroresForm({
        titulo: extraerErrorCampo(error, 'titulo'),
        tipo: extraerErrorCampo(error, 'tipo'),
        fecha_inicio: extraerErrorCampo(error, 'fecha_inicio'),
        fecha_fin: extraerErrorCampo(error, 'fecha_fin'),
        estado: extraerErrorCampo(error, 'estado'),
        descripcion: extraerErrorCampo(error, 'descripcion'),
        prioridad: extraerErrorCampo(error, 'prioridad'),
        color: extraerErrorCampo(error, 'color'),
        cod_usuario: extraerErrorCampo(error, 'cod_usuario'),
        fecha_creacion: extraerErrorCampo(error, 'fecha_creacion'),
        fecha_recordatorio: extraerErrorCampo(error, 'fecha_recordatorio'),
      });
      setErrorGlobalForm(error?.validation?.message || error?.response?.data?.message || mensajeErrorApi(error));
      await alertaError('No se pudo guardar', error?.validation?.message || 'Revisa los campos.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!actividadEditar?.cod_actividad) return;
    const ok = await confirmarAccion({
      titulo: 'Eliminar actividad',
      texto: 'Esta accion no se puede deshacer.',
      confirmButtonText: 'Si, eliminar',
    });
    if (!ok) return;
    try {
      await eliminarCalendarioActividadApi(actividadEditar.cod_actividad);
      setModalAbierto(false);
      setActividadEditar(null);
      await recargar();
      await alertaExito('Actividad eliminada');
    } catch (error) {
      await alertaError('No se pudo eliminar', mensajeErrorApi(error));
    }
  };

  const manejarClickDia = (iso, enMesActual) => {
    if (!enMesActual) return;
    if (clickDiaTimerRef.current) {
      clearTimeout(clickDiaTimerRef.current);
      clickDiaTimerRef.current = null;
    }
    clickDiaTimerRef.current = setTimeout(() => {
      setDiaSeleccionadoIso((prev) => (prev === iso ? '' : iso));
      clickDiaTimerRef.current = null;
    }, 220);
  };

  const manejarDobleClickDia = (iso, enMesActual) => {
    if (!enMesActual) return;
    if (clickDiaTimerRef.current) {
      clearTimeout(clickDiaTimerRef.current);
      clickDiaTimerRef.current = null;
    }
    abrirNuevo(iso);
  };

  return (
    <ContenedorPrincipal>
      <div className="cal-act-modulo">
        <EncabezadoModulo
          titulo="Actividades"
          subtitulo="Calendario de tareas, reuniones y recordatorios"
          textoBoton="Nueva actividad"
          alHacerClic={() => abrirNuevo()}
        />

        {errorLista ? (
          <div className="contrato-pagina-alerta contrato-pagina-alerta--error" role="alert">
            <strong>Error al cargar actividades</strong>
            <p>{errorLista}</p>
          </div>
        ) : null}
        {cargando ? <p className="contrato-pagina-cargando">Cargando actividades...</p> : null}

        <TarjetasResumen tarjetas={tarjetasResumen} />

        <div className="cal-act-filtros">
          <select value={filtros.estado} onChange={(e) => setFiltros((p) => ({ ...p, estado: e.target.value }))}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{etiquetaPascalConEspacios(e)}</option>
            ))}
          </select>
          <button
            type="button"
            className="cal-nav-btn"
            onClick={() => {
              const prev = new Date(vista.anio, vista.mes - 2, 1);
              setVista({ anio: prev.getFullYear(), mes: prev.getMonth() + 1 });
              setDiaSeleccionadoIso('');
            }}
          >
            &lt;
          </button>
          <button
            type="button"
            className="cal-hoy-btn"
            onClick={() => {
              setVista({ anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 });
              setDiaSeleccionadoIso('');
            }}
          >
            Hoy
          </button>
          <button
            type="button"
            className="cal-nav-btn"
            onClick={() => {
              const next = new Date(vista.anio, vista.mes, 1);
              setVista({ anio: next.getFullYear(), mes: next.getMonth() + 1 });
              setDiaSeleccionadoIso('');
            }}
          >
            &gt;
          </button>
        </div>

        <section className="cal-act-layout">
          <article className="cal-act-calendario">
            <header className="cal-act-header-mes">
              <h3>{vistaCalendario.tituloMes}</h3>
              <button
                type="button"
                className="cal-month-trigger"
                onClick={() => {
                  setAnioSelector(vista.anio);
                  setSelectorMesAbierto((v) => !v);
                }}
              >
                Seleccionar mes
              </button>
            </header>
            {selectorMesAbierto ? (
              <div className="cal-month-picker">
                <div className="cal-month-picker-head">
                  <button type="button" onClick={() => setAnioSelector((y) => y - 1)}>‹</button>
                  <strong>{anioSelector}</strong>
                  <button type="button" onClick={() => setAnioSelector((y) => y + 1)}>›</button>
                </div>
                <div className="cal-month-picker-grid">
                  {NOMBRES_MESES.map((nombre, idx) => (
                    <button
                      key={nombre}
                      type="button"
                      className={vista.mes === idx + 1 && vista.anio === anioSelector ? 'activo' : ''}
                      onClick={() => {
                        setVista({ anio: anioSelector, mes: idx + 1 });
                        setSelectorMesAbierto(false);
                        setDiaSeleccionadoIso('');
                      }}
                    >
                      {nombre.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="cal-act-grid">
              {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map((d) => (
                <div key={d} className="cal-act-dow">{d}</div>
              ))}
              {vistaCalendario.celdas.map((cell) => {
                const iso = cell.iso;
                const chips = actividadesPorFecha.get(iso) || [];
                const seleccionado = diaSeleccionadoIso === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    className={`cal-act-day ${cell.enMesActual ? '' : 'cal-act-day--other'} ${seleccionado ? 'cal-act-day--selected' : ''}`.trim()}
                    onClick={() => manejarClickDia(iso, cell.enMesActual)}
                    onDoubleClick={() => manejarDobleClickDia(iso, cell.enMesActual)}
                  >
                    <span className="cal-act-day-num">{cell.day}</span>
                    <span className="cal-act-chips">
                      {chips.slice(0, 3).map((a) => (
                        <span
                          key={a.cod_actividad}
                          className={`cal-chip ${
                            categoriaTipo(a.tipo) === 'REUNION'
                              ? 'cal-chip--meeting'
                              : categoriaTipo(a.tipo) === 'RECORDATORIO'
                                ? 'cal-chip--reminder'
                                : 'cal-chip--task'
                          }`}
                          style={{ borderColor: a.color || '#e5e7eb' }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            abrirEditar(a);
                          }}
                        >
                          {a.titulo}
                        </span>
                      ))}
                      {chips.length > 3 ? <span className="cal-chip cal-chip--more">+{chips.length - 3}</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          <aside className="cal-act-lista">
            <h4>{diaSeleccionadoIso ? `Actividades del ${formatearFechaVista(diaSeleccionadoIso)}` : 'Actividades del mes'}</h4>
            {diaSeleccionadoIso ? (
              <button type="button" className="cal-list-reset" onClick={() => setDiaSeleccionadoIso('')}>
                Ver todo el mes
              </button>
            ) : null}
            {actividadesPanelDerecho.length === 0 ? (
              <SinDatos mensaje={diaSeleccionadoIso ? 'No hay actividades registradas en este dia.' : 'No hay actividades para este filtro.'} />
            ) : (
              <div className="cal-act-lista-items">
                {actividadesPanelDerecho.map((a) => (
                  <button key={a.cod_actividad} type="button" className="cal-list-item" onClick={() => abrirEditar(a)}>
                    <span className="cal-list-color" style={{ background: a.color || '#d1d5db' }} />
                    <div className="cal-list-content">
                      <strong>{a.titulo}</strong>
                      <small>{formatearFechaVista(a.fecha_inicio)}</small>
                      <div className="cal-list-meta">
                        <span>{a.tipo}</span>
                        <span>{etiquetaPascalConEspacios(a.estado)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </section>
      </div>

      <Modal
        mostrar={modalAbierto}
        cerrar={cerrarModal}
        titulo={actividadEditar ? `Editar actividad #${actividadEditar.cod_actividad}` : 'Nueva actividad'}
        classNameContenedor="cal-act-modal"
      >
        <form className="cal-act-form" onSubmit={guardar}>
          <div className="cal-form-date-banner">
            <span>Fecha seleccionada</span>
            <strong>{formatearFechaVista(fechaSeleccionadaModal || form.fecha_inicio)}</strong>
          </div>
          {errorGlobalForm ? <p className="mensaje-error">{errorGlobalForm}</p> : null}
          <section className="cal-form-section">
            <div className="cal-form-section-title"><span>1</span>Informacion general</div>
            <label>
              <span>Titulo *</span>
              <input value={form.titulo} maxLength={50} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} placeholder="Nombre de la actividad..." />
              {erroresForm.titulo ? <small className="campo-seccion-error">{erroresForm.titulo}</small> : null}
            </label>
            <div className="cal-act-form-grid">
              <label>
                <span>Tipo *</span>
                <div className="cal-tipo-busqueda">
                  <span className="cal-tipo-busqueda-icono" aria-hidden>⌕</span>
                  <input
                    value={form.tipo}
                    maxLength={20}
                    onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value.toUpperCase() }))}
                    placeholder="Ej: TAREA, CAPACITACION..."
                  />
                </div>
                <div className="cal-tipo-sugerencias">
                  {TIPOS_SUGERIDOS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={String(form.tipo || '').toUpperCase() === t ? 'activo' : ''}
                      onClick={() => setForm((p) => ({ ...p, tipo: t }))}
                    >
                      {etiquetaTipo(t)}
                    </button>
                  ))}
                </div>
                {erroresForm.tipo ? <small className="campo-seccion-error">{erroresForm.tipo}</small> : null}
              </label>
              <label>
                <span>Prioridad *</span>
                <select value={form.prioridad} onChange={(e) => setForm((p) => ({ ...p, prioridad: e.target.value }))}>
                  {PRIORIDADES.map((x) => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
                {erroresForm.prioridad ? <small className="campo-seccion-error">{erroresForm.prioridad}</small> : null}
              </label>
            </div>
          </section>

          <section className="cal-form-section">
            <div className="cal-form-section-title"><span>2</span>Fecha y hora</div>
            <div className="cal-act-form-grid">
              <label>
                <span>Fecha inicio *</span>
                <input type="date" value={form.fecha_inicio} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))} />
                {erroresForm.fecha_inicio ? <small className="campo-seccion-error">{erroresForm.fecha_inicio}</small> : null}
              </label>
              <label>
                <span>Fecha fin</span>
                <input type="date" value={form.fecha_fin} onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))} />
                {erroresForm.fecha_fin ? <small className="campo-seccion-error">{erroresForm.fecha_fin}</small> : null}
              </label>
              <label>
                <span>Fecha recordatorio</span>
                <input
                  type="date"
                  value={form.fecha_recordatorio}
                  onChange={(e) => setForm((p) => ({ ...p, fecha_recordatorio: e.target.value }))}
                />
                {erroresForm.fecha_recordatorio ? <small className="campo-seccion-error">{erroresForm.fecha_recordatorio}</small> : null}
              </label>
              <label>
                <span>Fecha creacion</span>
                <input
                  type="date"
                  value={form.fecha_creacion}
                  onChange={(e) => setForm((p) => ({ ...p, fecha_creacion: e.target.value }))}
                />
                {erroresForm.fecha_creacion ? <small className="campo-seccion-error">{erroresForm.fecha_creacion}</small> : null}
              </label>
            </div>
          </section>

          <section className="cal-form-section">
            <div className="cal-form-section-title"><span>3</span>Detalles</div>
            <label>
              <span>Descripcion</span>
              <textarea
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Informacion adicional sobre la actividad..."
              />
              {erroresForm.descripcion ? <small className="campo-seccion-error">{erroresForm.descripcion}</small> : null}
            </label>
            <div className="cal-act-form-grid">
              <label>
                <span>Color</span>
                <input value={form.color} maxLength={10} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value.toUpperCase() }))} />
                <div className="cal-color-palette">
                  {COLORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`cal-color-dot ${String(form.color).toUpperCase() === c ? 'activo' : ''}`}
                      style={{ background: c }}
                      onClick={() => setForm((p) => ({ ...p, color: c }))}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
                {erroresForm.color ? <small className="campo-seccion-error">{erroresForm.color}</small> : null}
              </label>
              <label>
                <span>Estado *</span>
                <select value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}>
                  {ESTADOS.map((x) => (
                    <option key={x} value={x}>{etiquetaPascalConEspacios(x)}</option>
                  ))}
                </select>
                {erroresForm.estado ? <small className="campo-seccion-error">{erroresForm.estado}</small> : null}
              </label>
              <label className="cal-form-col-span">
                <span>cod_usuario *</span>
                <input
                  value={form.cod_usuario}
                  onChange={(e) => setForm((p) => ({ ...p, cod_usuario: e.target.value.replace(/\D/g, '') }))}
                  inputMode="numeric"
                  readOnly
                />
                {erroresForm.cod_usuario ? <small className="campo-seccion-error">{erroresForm.cod_usuario}</small> : null}
              </label>
            </div>
          </section>

          <div className="cal-act-form-acciones">
            <button type="button" className="btn btn-secundario btn-sm" onClick={cerrarModal}>
              Cancelar
            </button>
            {actividadEditar ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={eliminar} disabled={guardando}>
                Eliminar
              </button>
            ) : null}
            <button type="submit" className="btn btn-primario btn-sm" disabled={guardando}>
              {guardando ? 'Guardando...' : actividadEditar ? 'Guardar cambios' : 'Crear actividad'}
            </button>
          </div>
        </form>
      </Modal>
    </ContenedorPrincipal>
  );
}

export default CalendarioActividades;
