import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContenedorPrincipal, EncabezadoModulo, FiltrosBusqueda, SinDatos, Tabs } from '../../componentes';
import { ModalFormularioComunicacion, ModalDetalleComunicacion } from './componentes';
import {
  getComunicacionesDisciplinarias,
  getComunicacionDisciplinariaById,
  deleteComunicacionDisciplinaria,
  extraerFilasComunicaciones,
  codigoDisciplinarioDesde,
  normalizarRegistroComunicacion,
} from '../../services/comunicacionesDisciplinarias';
import {
  getEmpleadosCatalogo,
  extraerFilasEmpleados,
  nombreCompletoEmpleado,
  codigoEmpleadoDesde,
} from '../../services/empleados';
import { getUsuarios, extraerFilasUsuarios } from '../../services/usuario';
import { esAdminSesionLocal } from '../../services/autenticacion';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { ejecutarCargaEnFases } from '../../utils/cargaEnFases';
import { alertaErrorApi, confirmarEliminacion } from '../../utils/alertasSwal';
import { obtenerCatalogos } from '../../services/catalogos';
import {
  TIPOS_COMUNICACION,
  ESTADOS_COMUNICACION,
  canonicalTipoApi,
  canonicalEstadoApi,
  etiquetaTipo,
  etiquetaEstado,
  radicadoDesdeCod,
  claseBadgeTipo,
  claseBadgeEstado,
  listaEstadosComunicacion,
  listaTiposComunicacion,
} from './disciplinariasConstants';

function IcoEditarDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// TODO: Cambiar los servicios por los módulos del sistema
function IcoVerDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IcoEliminarDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polyline
        points="3 6 5 6 21 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function mesAnioDesdeFecha(fecha) {
  const t = fecha ? String(fecha).trim().slice(0, 10) : '';
  const m = t.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (m) return `${m[2]}/${m[1]}`;
  return '—';
}

function formatearFechaDma(fecha) {
  const t = fecha ? String(fecha).trim().slice(0, 10) : '';
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return t || '—';
}

function inicialesNombre(nombre) {
  const p = String(nombre || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/** Variante de color del avatar (mockup Por empleado) */
function claseAvatarPorEmpleado(cod) {
  const n = Number(cod);
  let i = 0;
  if (Number.isFinite(n)) {
    i = Math.abs(Math.trunc(n)) % 5;
  } else {
    const s = String(cod ?? '');
    for (let k = 0; k < s.length; k += 1) i += s.charCodeAt(k);
    i %= 5;
  }
  return `disc-emp-avatar disc-emp-avatar--v${i}`;
}

function cargoDesdeEmpleado(emp) {
  if (!emp || typeof emp !== 'object') return '—';
  return (
    emp.nomb_cargo ?? emp.nombre_cargo ?? emp.cargo?.nombre_cargo ?? emp.cargo?.nomb_cargo ?? '—'
  );
}

function ComunicacionesDisciplinarias() {
  const esAdmin = esAdminSesionLocal();

  const [lista, setLista] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeLista, setMensajeLista] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [vistaTab, setVistaTab] = useState('documentos');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [detalleSeleccion, setDetalleSeleccion] = useState(null);
  const [filtroCodEmpleado, setFiltroCodEmpleado] = useState(null);
  const [criteriosFiltro, setCriteriosFiltro] = useState({
    busqueda: '',
    tipo: '',
    estado: '',
  });
  const mapaEmpleados = useMemo(() => {
    const m = new Map();
    for (const e of empleados) {
      const c = codigoEmpleadoDesde(e);
      if (c != null) m.set(Number(c), e);
    }
    return m;
  }, [empleados]);

  const mapaUsuarios = useMemo(() => {
    const m = new Map();
    for (const u of usuarios) {
      const c = u.cod_usuario ?? u.id;
      if (c != null && c !== '') m.set(Number(c), u);
    }
    return m;
  }, [usuarios]);

  const filasVista = useMemo(() => {
    return lista.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const cod = codigoDisciplinarioDesde(row);
      const codEmp = row.cod_empleado != null ? Number(row.cod_empleado) : null;
      const emp = codEmp != null && Number.isFinite(codEmp) ? mapaEmpleados.get(codEmp) : null;
      const nombreEmp = emp ? nombreCompletoEmpleado(emp) : '—';
      const codU = row.cod_usuario != null ? Number(row.cod_usuario) : null;
      const usu = codU != null && Number.isFinite(codU) ? mapaUsuarios.get(codU) : null;
      const nombreUsu = usu ? String(usu.nombre_usuario ?? usu.nombre ?? '—') : '—';

      return {
        ...row,
        _radicado: radicadoDesdeCod(cod),
        _mesAnio: mesAnioDesdeFecha(row.fecha_emision),
        _nombreEmpleado: nombreEmp,
        _cargoEmpleado: emp ? cargoDesdeEmpleado(emp) : '—',
        _docEmpleado: emp?.doc_iden != null ? String(emp.doc_iden) : '—',
        _iniciales: inicialesNombre(nombreEmp),
        _nombreEmisor: nombreUsu,
        _tipoCanon: canonicalTipoApi(row.tipo_comunicacion),
        _estadoCanon: canonicalEstadoApi(row.estado_comunicacion),
      };
    });
  }, [lista, mapaEmpleados, mapaUsuarios]);

  const filasFiltradas = useMemo(() => {
    const q = (criteriosFiltro.busqueda || '').trim().toLowerCase();
    const tipoF = criteriosFiltro.tipo || '';
    const estF = criteriosFiltro.estado || '';

    return filasVista.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      if (filtroCodEmpleado != null) {
        const ce = row.cod_empleado != null ? Number(row.cod_empleado) : NaN;
        if (ce !== filtroCodEmpleado) return false;
      }
      if (tipoF && row._tipoCanon !== tipoF) return false;
      if (estF && row._estadoCanon !== estF) return false;
      if (q) {
        const nom = String(row._nombreEmpleado || '').toLowerCase();
        if (vistaTab === 'empleados') {
          if (!nom.includes(q)) return false;
        } else {
          const mot = String(row.motivo_comunicacion || '').toLowerCase();
          const rad = String(row._radicado || '').toLowerCase();
          const desc = String(row.descripcion || '').toLowerCase();
          if (!nom.includes(q) && !mot.includes(q) && !rad.includes(q) && !desc.includes(q)) return false;
        }
      }
      return true;
    });
  }, [filasVista, criteriosFiltro, filtroCodEmpleado, vistaTab]);

  const kpis = useMemo(() => {
    const base = filasFiltradas;
    return {
      total: base.length,
      memorandos: base.length,
    };
  }, [filasFiltradas]);

  const filtrosTipoDisponibles = useMemo(
    () => listaTiposComunicacion(catalogos),
    [catalogos],
  );

  const gruposPorEmpleado = useMemo(() => {
    const m = new Map();
    for (const row of filasFiltradas) {
      const codEmp = row.cod_empleado != null ? Number(row.cod_empleado) : null;
      if (!Number.isFinite(codEmp)) continue;
      if (!m.has(codEmp)) {
        m.set(codEmp, {
          cod_empleado: codEmp,
          nombre: row._nombreEmpleado,
          cargo: row._cargoEmpleado,
          iniciales: row._iniciales,
          porTipo: { MEMORANDO: 0, LLAMADO_VERBAL: 0, SUSPENSION: 0, FELICITACION: 0 },
          ultima: '',
          total: 0,
        });
      }
      const g = m.get(codEmp);
      const t = row._tipoCanon;
      if (g.porTipo[t] != null) g.porTipo[t] += 1;
      g.total += 1;
      const fe = row.fecha_emision ? String(row.fecha_emision).slice(0, 10) : '';
      if (fe && (!g.ultima || fe > g.ultima)) g.ultima = fe;
    }
    return [...m.values()].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [filasFiltradas]);

  const recargarLista = useCallback(async () => {
    setMensajeLista('');
    setCargando(true);
    try {
      const json = await getComunicacionesDisciplinarias();
      setLista(extraerFilasComunicaciones(json));
    } catch (e) {
      setLista([]);
      setMensajeLista(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    setMensajeLista('');
    setCargando(true);
    const secundarios = esAdmin
      ? [(op) => getEmpleadosCatalogo(op), (op) => getUsuarios(op)]
      : [(op) => getEmpleadosCatalogo(op)];
    void obtenerCatalogos().then((c) => {
      if (activo) setCatalogos(c);
    }).catch(() => {
      if (activo) setCatalogos(null);
    });
    void ejecutarCargaEnFases({
      principal: (op) => getComunicacionesDisciplinarias(op),
      secundarios,
      onPrincipal: (json, err) => {
        if (!activo) return;
        if (err) {
          setLista([]);
          setMensajeLista(mensajeErrorApi(err));
        } else {
          setLista(extraerFilasComunicaciones(json));
        }
        setCargando(false);
      },
      onSecundario: (indice, json, err) => {
        if (!activo) return;
        if (indice === 0) {
          if (err) setEmpleados([]);
          else setEmpleados(extraerFilasEmpleados(json));
        }
        if (esAdmin && indice === 1) {
          if (err) setUsuarios([]);
          else setUsuarios(extraerFilasUsuarios(json));
        }
        if (!esAdmin) setUsuarios([]);
      },
    });
    return () => {
      activo = false;
    };
  }, [esAdmin]);

  const alExitoFormulario = async () => {
    await recargarLista();
    setMensajeExito('Cambios guardados correctamente.');
    window.setTimeout(() => setMensajeExito(''), 3000);
    setRegistroEditar(null);
  };

  const abrirNuevo = () => {
    setRegistroEditar(null);
    setMostrarForm(true);
  };

  const abrirDetalle = (fila) => {
    setDetalleSeleccion(fila);
    setMostrarDetalle(true);
  };

  const manejarEditar = async (fila) => {
    const cod = codigoDisciplinarioDesde(fila);
    if (cod == null) return;
    try {
      const json = await getComunicacionDisciplinariaById(cod);
      const raw = normalizarRegistroComunicacion(json) ?? json?.data ?? json;
      setRegistroEditar(raw ?? fila);
      setMostrarForm(true);
    } catch (err) {
      void alertaErrorApi('No se pudo abrir el documento', err);
    }
  };

  const confirmarEliminar = async (fila) => {
    const cod = codigoDisciplinarioDesde(fila);
    if (cod == null) return;
    const ok = await confirmarEliminacion({ titulo: '¿Eliminar este documento disciplinario?' });
    if (!ok) return;
    try {
      await deleteComunicacionDisciplinaria(cod);
      setMostrarDetalle(false);
      setDetalleSeleccion(null);
      await recargarLista();
      setMensajeExito('Documento eliminado correctamente.');
      window.setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      void alertaErrorApi('No se pudo eliminar el documento', e);
    }
  };

  const nombreFiltroEmpleado =
    filtroCodEmpleado != null
      ? filasVista.find((r) => Number(r.cod_empleado) === filtroCodEmpleado)?._nombreEmpleado ?? null
      : null;

  return (
    <ContenedorPrincipal>
      <div className="disc-modulo">
        <EncabezadoModulo
          titulo="Comunicaciones Disciplinarias"
          subtitulo="Registro y seguimiento de memorandos disciplinarios"
          textoBoton="Nuevo documento"
          alHacerClic={abrirNuevo}
        />

        {mensajeLista ? (
          <div className="login-alerta login-alerta--error disc-alerta" role="alert">
            <p className="login-alerta-mensaje">{mensajeLista}</p>
          </div>
        ) : null}
        {mensajeExito ? (
          <div className="login-alerta login-alerta--exito disc-alerta" role="status">
            <p className="login-alerta-mensaje">{mensajeExito}</p>
          </div>
        ) : null}

        <div className="disc-kpis">
          <div className="disc-kpi disc-kpi--total">
            <span className="disc-kpi-valor">{kpis.total}</span>
            <span className="disc-kpi-etiq">Total documentos</span>
          </div>
          <div className="disc-kpi disc-kpi--memo">
            <span className="disc-kpi-valor">{kpis.memorandos}</span>
            <span className="disc-kpi-etiq">Memorandos</span>
          </div>
        </div>

        <div className="disc-c-tabs-wrap">
          <Tabs
            tabs={[
              { id: 'documentos', etiqueta: 'Por Documento' },
              { id: 'empleados', etiqueta: 'Por Empleado' },
            ]}
            activa={vistaTab}
            onChange={(id) => {
              setVistaTab(id);
              if (id === 'empleados') setFiltroCodEmpleado(null);
            }}
          />
        </div>

        <div className="disc-barra-busqueda">
          {filtroCodEmpleado != null ? (
            <div className="disc-filtro-empleado-chip disc-filtro-empleado-chip--inline">
              <span>
                Filtrando: <strong>{nombreFiltroEmpleado ?? `#${filtroCodEmpleado}`}</strong>
              </span>
              <button type="button" className="disc-chip-cerrar" onClick={() => setFiltroCodEmpleado(null)}>
                Quitar
              </button>
            </div>
          ) : null}
          <FiltrosBusqueda
            placeholderBusqueda={
              vistaTab === 'empleados'
                ? 'Buscar empleado por nombre…'
                : 'Buscar por empleado o radicado…'
            }
            filtrosSelect={[
              ...(filtrosTipoDisponibles.length > 1
                ? [
                    {
                      nombre: 'tipo',
                      etiqueta: 'Tipo',
                      placeholder: 'Todos los tipos',
                      opciones: filtrosTipoDisponibles.map((t) => ({ valor: t, texto: t })),
                    },
                  ]
                : []),
              {
                nombre: 'estado',
                etiqueta: 'Estado',
                placeholder: 'Todos los estados',
                opciones: listaEstadosComunicacion(catalogos).map((s) => ({ valor: s, texto: s })),
              },
            ]}
            onFiltrar={(f) => {
              setFiltroCodEmpleado(null);
              setCriteriosFiltro({
                busqueda: f.busqueda || '',
                tipo: f.tipo || '',
                estado: f.estado || '',
              });
            }}
          />
        </div>

        {cargando ? <p className="contrato-pagina-cargando">Cargando comunicaciones…</p> : null}

        <div className="disc-vista-contenido">
        {vistaTab === 'documentos' ? (
          <div className="disc-grid-docs">
            {!cargando && filasFiltradas.length === 0 ? (
              <div className="disc-sin-datos-centro">
                <SinDatos mensaje="No hay documentos con los filtros actuales" />
              </div>
            ) : (
              filasFiltradas.map((row, idx) => {
                const cod = codigoDisciplinarioDesde(row);
                return (
                  <article key={cod != null ? String(cod) : `disc-fila-${idx}`} className="disc-card-doc">
                    <header className="disc-card-doc-head">
                      <span className="disc-card-radicado">{row._radicado}</span>
                      <span className="disc-card-fecha">{row._mesAnio}</span>
                    </header>
                    <div className="disc-card-badges">
                      <span className={`disc-badge ${claseBadgeTipo(row.tipo_comunicacion)}`}>
                        {etiquetaTipo(row.tipo_comunicacion)}
                      </span>
                      <span className={`disc-badge-est ${claseBadgeEstado(row.estado_comunicacion)}`}>
                        {etiquetaEstado(row.estado_comunicacion)}
                      </span>
                    </div>
                    <p className="disc-card-motivo">{row.motivo_comunicacion || '—'}</p>
                    {row._tipoCanon === 'SUSPENSION' && row.dias_suspension != null && Number(row.dias_suspension) > 0 ? (
                      <div className="disc-card-susp-dias">{row.dias_suspension} días de suspensión</div>
                    ) : null}
                    <footer className="disc-card-doc-foot">
                      <div className="disc-card-emp">
                        <span className="disc-card-avatar">{row._iniciales}</span>
                        <div>
                          <strong className="disc-card-nombre">{row._nombreEmpleado}</strong>
                          <span className="disc-card-cargo">{row._cargoEmpleado}</span>
                        </div>
                      </div>
                      <div className="disc-card-acciones" role="group" aria-label="Acciones del documento">
                        <button
                          type="button"
                          className="disc-card-ico-btn disc-card-ico-btn--editar"
                          title="Editar"
                          aria-label="Editar"
                          onClick={() => manejarEditar(row)}
                        >
                          <IcoEditarDoc />
                        </button>
                        <button
                          type="button"
                          className="disc-card-ico-btn disc-card-ico-btn--ver"
                          title="Ver detalle"
                          aria-label="Ver detalle"
                          onClick={() => abrirDetalle(row)}
                        >
                          <IcoVerDoc />
                        </button>
                        <button
                          type="button"
                          className="disc-card-ico-btn disc-card-ico-btn--eliminar"
                          title="Eliminar"
                          aria-label="Eliminar"
                          onClick={() => confirmarEliminar(row)}
                        >
                          <IcoEliminarDoc />
                        </button>
                      </div>
                    </footer>
                  </article>
                );
              })
            )}
          </div>
        ) : (
          <div className="disc-grid-emp">
            {!cargando && gruposPorEmpleado.length === 0 ? (
              <div className="disc-sin-datos-centro">
                <SinDatos mensaje="No hay empleados con documentos en el filtro actual" />
              </div>
            ) : (
              gruposPorEmpleado.map((g) => (
                <article key={String(g.cod_empleado)} className="disc-card-empleado">
                  <div className="disc-emp-card-head">
                    <span className={claseAvatarPorEmpleado(g.cod_empleado)}>{g.iniciales}</span>
                    <div className="disc-emp-card-meta">
                      <strong className="disc-emp-card-nombre">{g.nombre}</strong>
                      <span className="disc-emp-card-cargo">{g.cargo}</span>
                    </div>
                  </div>
                  <div className="disc-emp-card-badges">
                    {g.porTipo.MEMORANDO > 0 ? (
                      <span className="disc-emp-pill disc-emp-pill--memo">
                        {g.porTipo.MEMORANDO === 1
                          ? '1 Memorando'
                          : `${g.porTipo.MEMORANDO} Memorandos`}
                      </span>
                    ) : null}
                    {g.porTipo.LLAMADO_VERBAL > 0 ? (
                      <span className="disc-emp-pill disc-emp-pill--llamado">
                        {g.porTipo.LLAMADO_VERBAL === 1
                          ? '1 Llamado verbal'
                          : `${g.porTipo.LLAMADO_VERBAL} Llamados verbales`}
                      </span>
                    ) : null}
                    {g.porTipo.SUSPENSION > 0 ? (
                      <span className="disc-emp-pill disc-emp-pill--susp">
                        {g.porTipo.SUSPENSION === 1
                          ? '1 Suspensión'
                          : `${g.porTipo.SUSPENSION} Suspensiones`}
                      </span>
                    ) : null}
                    {g.porTipo.FELICITACION > 0 ? (
                      <span className="disc-emp-pill disc-emp-pill--feli">
                        {g.porTipo.FELICITACION === 1
                          ? '1 Felicitación'
                          : `${g.porTipo.FELICITACION} Felicitaciones`}
                      </span>
                    ) : null}
                  </div>
                  <footer className="disc-emp-card-foot">
                    <span className="disc-emp-card-ultimo">Último: {formatearFechaDma(g.ultima)}</span>
                    <button
                      type="button"
                      className="disc-emp-card-link"
                      onClick={() => {
                        setFiltroCodEmpleado(g.cod_empleado);
                        setVistaTab('documentos');
                      }}
                    >
                      {g.total} doc{g.total !== 1 ? 's' : ''} →
                    </button>
                  </footer>
                </article>
              ))
            )}
          </div>
        )}
        </div>
      </div>

      <ModalFormularioComunicacion
        mostrar={mostrarForm}
        cerrar={() => {
          setMostrarForm(false);
          setRegistroEditar(null);
        }}
        registroEditar={registroEditar}
        empleados={empleados}
        catalogos={catalogos}
        alExito={alExitoFormulario}
      />

      <ModalDetalleComunicacion
        mostrar={mostrarDetalle}
        cerrar={() => {
          setMostrarDetalle(false);
          setDetalleSeleccion(null);
        }}
        vistaFallback={detalleSeleccion}
        onActualizado={recargarLista}
        onEliminado={recargarLista}
        onEditar={(r) => {
          setRegistroEditar(r);
          setMostrarForm(true);
        }}
      />
    </ContenedorPrincipal>
  );
}

export default ComunicacionesDisciplinarias;
