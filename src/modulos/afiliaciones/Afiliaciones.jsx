import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, FiltrosBusqueda, TarjetasResumen, SinDatos } from '../../componentes';
import { useCatalogos } from '../../contextos/CatalogosContext';
import { catalogoAfiliacionDesdeGlobal } from '../../services/catalogos';
import { ModalAfiliacion } from './componentes';
import {
  getAfiliaciones,
  getAfiliacionById,
  deleteAfiliacion,
  extraerFilasAfiliaciones,
  codigoAfiliacionDesde,
} from '../../services/afiliaciones';
import {
  getEmpleadosCatalogo,
  extraerFilasEmpleados,
  nombreCompletoEmpleado,
  codigoEmpleadoDesde,
} from '../../services/empleados';
import { alertaErrorApi, confirmarEliminacion } from '../../utils/alertasSwal';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { ejecutarCargaEnFases } from '../../utils/cargaEnFases';
import { etiquetaEstadoAfiliacion } from '../../utils/afiliacionEstado';
import '../../estilos/modulos/afiliaciones.css';

function mapaPorCod(lista, clave) {
  const m = new Map();
  if (!Array.isArray(lista)) return m;
  for (const row of lista) {
    if (row && typeof row === 'object') {
      const k = row[clave];
      if (k != null && k !== '') m.set(Number(k), row);
    }
  }
  return m;
}

function formatearSoloFecha(valor) {
  if (!valor) return '—';
  const t = String(valor).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return t;
}

function tipoRegimenMostrar(v) {
  const u = String(v || '').toUpperCase();
  if (u === 'SUBSIDIADO') return 'Subsidiado';
  if (u === 'CONTRIBUTIVO') return 'Contributivo';
  return v ? String(v) : '—';
}

function Afiliaciones() {
  const navegar = useNavigate();
  const { catalogos: catalogosGlobal } = useCatalogos();
  const catalogos = useMemo(
    () => catalogoAfiliacionDesdeGlobal(catalogosGlobal),
    [catalogosGlobal],
  );
  const [lista, setLista] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeLista, setMensajeLista] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [afiliacionEditar, setAfiliacionEditar] = useState(null);
  const [criteriosFiltro, setCriteriosFiltro] = useState({
    busqueda: '',
    estado: '',
    eps: '',
  });
  const mapas = useMemo(() => {
    const empleadosMap = (() => {
      const m = new Map();
      for (const e of empleados) {
        const c = codigoEmpleadoDesde(e);
        if (c != null) m.set(Number(c), e);
      }
      return m;
    })();
    if (!catalogos) {
      return {
        empleados: empleadosMap,
        eps: new Map(),
        arls: new Map(),
        pensiones: new Map(),
        cesantias: new Map(),
        compensaciones: new Map(),
      };
    }
    return {
      empleados: empleadosMap,
      eps: mapaPorCod(catalogos.eps, 'cod_eps'),
      arls: mapaPorCod(catalogos.arls, 'cod_arl'),
      pensiones: mapaPorCod(catalogos.pensiones, 'cod_fondo_pensiones'),
      cesantias: mapaPorCod(catalogos.cesantias, 'cod_fondo_cesantias'),
      compensaciones: mapaPorCod(catalogos.compensaciones, 'cod_caja_compensacion'),
    };
  }, [catalogos, empleados]);

  const filasVista = useMemo(() => {
    if (!mapas) return [];
    return lista.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const codEmp = row.cod_empleado != null ? Number(row.cod_empleado) : null;
      const emp = codEmp != null && Number.isFinite(codEmp) ? mapas.empleados.get(codEmp) : null;
      const eps = mapas.eps.get(Number(row.cod_eps));
      const estadoEt = etiquetaEstadoAfiliacion(row.estado_afiliacion);
      const codAf = codigoAfiliacionDesde(row);
      return {
        ...row,
        _empleado: emp ? nombreCompletoEmpleado(emp) : '—',
        _documento: emp ? String(emp.doc_iden ?? '—') : '—',
        _eps: eps?.nombre_eps ?? '—',
        _estadoEtiqueta: estadoEt,
        _codigoUi: codAf != null ? `AF-${codAf}` : '—',
        _fechaSolicitud: formatearSoloFecha(row.fecha_afiliacion_eps),
        _tipoRegimen: tipoRegimenMostrar(row.tipo_regimen),
      };
    });
  }, [lista, mapas]);

  const filasFiltradas = useMemo(() => {
    const q = (criteriosFiltro.busqueda || '').trim().toLowerCase();
    const est = criteriosFiltro.estado || '';
    const epsF = criteriosFiltro.eps || '';

    return filasVista.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      if (est && String(row._estadoEtiqueta) !== est) return false;
      if (epsF && String(row.cod_eps) !== epsF) return false;
      if (q) {
        const nom = String(row._empleado || '').toLowerCase();
        const doc = String(row._documento || '').toLowerCase();
        const cod = String(row._codigoUi || '').toLowerCase();
        if (!nom.includes(q) && !doc.includes(q) && !cod.includes(q)) return false;
      }
      return true;
    });
  }, [filasVista, criteriosFiltro]);

  const kpis = useMemo(() => {
    const u = (s) => String(s || '').toUpperCase().replace(/\s/g, '_');
    const base = filasFiltradas;
    return {
      total: base.length,
      aprobadas: base.filter((r) => {
        const e = u(r.estado_afiliacion);
        return e === 'ACTIVA' || e === 'APROBADA';
      }).length,
      pendientes: base.filter((r) => {
        const e = u(r.estado_afiliacion);
        return e === 'PENDIENTE' || e === 'EN_PROCESO';
      }).length,
      retiradas: base.filter((r) => {
        const e = u(r.estado_afiliacion);
        return e === 'RETIRADA' || e === 'RETIRADO' || e === 'RECHAZADA';
      }).length,
    };
  }, [filasFiltradas]);

  const tarjetasResumen = useMemo(
    () => [
      { etiqueta: 'Total', valor: String(kpis.total), color: 'azul', icono: '' },
      { etiqueta: 'Aprobadas', valor: String(kpis.aprobadas), color: 'verde', icono: '' },
      { etiqueta: 'Pendientes', valor: String(kpis.pendientes), color: 'azul', icono: '' },
      { etiqueta: 'Retiradas', valor: String(kpis.retiradas), color: 'amarillo', icono: '' },
    ],
    [kpis],
  );

  const opcionesFiltroEps = useMemo(() => {
    if (!catalogos?.eps?.length) return [];
    return catalogos.eps.map((e) => ({
      valor: String(e.cod_eps),
      texto: e.nombre_eps ?? `EPS ${e.cod_eps}`,
    }));
  }, [catalogos]);

  const recargarLista = useCallback(async () => {
    setMensajeLista('');
    setCargando(true);
    try {
      const json = await getAfiliaciones({ forzar: true });
      setLista(extraerFilasAfiliaciones(json));
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
    void ejecutarCargaEnFases({
      principal: (op) => getAfiliaciones(op),
      secundarios: [(op) => getEmpleadosCatalogo(op)],
      onPrincipal: (json, err) => {
        if (!activo) return;
        if (err) {
          setLista([]);
          setMensajeLista(mensajeErrorApi(err));
        } else {
          setLista(extraerFilasAfiliaciones(json));
        }
        setCargando(false);
      },
      onSecundario: (indice, json, err) => {
        if (!activo) return;
        if (indice === 0) {
          if (err) setEmpleados([]);
          else setEmpleados(extraerFilasEmpleados(json));
        }
      },
    });
    return () => {
      activo = false;
    };
  }, []);

  const manejarNuevaAfiliacion = () => {
    setAfiliacionEditar(null);
    setMostrarModal(true);
  };

  const manejarModificar = async (fila) => {
    const cod = codigoAfiliacionDesde(fila);
    if (cod == null) return;
    try {
      const json = await getAfiliacionById(cod);
      setAfiliacionEditar(json?.data ?? json);
      setMostrarModal(true);
    } catch (err) {
      void alertaErrorApi('No se pudo abrir la afiliación', err);
    }
  };

  const confirmarEliminar = async (fila) => {
    const cod = codigoAfiliacionDesde(fila);
    if (cod == null) return;
    const ok = await confirmarEliminacion({ titulo: '¿Eliminar esta afiliación?' });
    if (!ok) return;
    try {
      await deleteAfiliacion(cod);
      await recargarLista();
      setMensajeExito('Afiliación eliminada correctamente.');
      window.setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      void alertaErrorApi('No se pudo eliminar la afiliación', e);
    }
  };

  const alExitoGuardado = async () => {
    await recargarLista();
    setMensajeExito('Cambios guardados correctamente.');
    window.setTimeout(() => setMensajeExito(''), 3000);
    setAfiliacionEditar(null);
  };

  const manejarVerDetalles = (fila) => {
    const cod = codigoAfiliacionDesde(fila);
    if (cod != null) navegar(`/afiliaciones/${cod}`);
  };

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Módulo de Afiliaciones"
        subtitulo="Gestión de afiliaciones a seguridad social"
        textoBoton="Nueva Afiliación"
        alHacerClic={manejarNuevaAfiliacion}
      />

      <div className="afiliaciones-contenido">
        {mensajeLista ? (
          <div className="login-alerta login-alerta--error" style={{ marginBottom: 16 }} role="alert">
            <p className="login-alerta-mensaje">{mensajeLista}</p>
          </div>
        ) : null}
        {mensajeExito ? (
          <div className="login-alerta login-alerta--exito" style={{ marginBottom: 16 }} role="status">
            <p className="login-alerta-mensaje">{mensajeExito}</p>
          </div>
        ) : null}
        {cargando ? <p className="contrato-pagina-cargando">Cargando afiliaciones…</p> : null}

        <TarjetasResumen tarjetas={tarjetasResumen} />

        <FiltrosBusqueda
          placeholderBusqueda="Buscar por empleado, documento o código..."
          filtrosSelect={[
            {
              nombre: 'estado',
              placeholder: 'Todos los Estados',
              opciones: ['Aprobada', 'Pendiente', 'Retirada'],
            },
            {
              nombre: 'eps',
              placeholder: 'Todas las EPS',
              opciones: opcionesFiltroEps,
            },
          ]}
          onFiltrar={(filtros) => {
            setCriteriosFiltro({
              busqueda: filtros.busqueda || '',
              estado: filtros.estado || '',
              eps: filtros.eps || '',
            });
          }}
        />

        <div className="afiliaciones-contenedor-principal">
          <h2 className="afiliaciones-titulo-seccion">Afiliaciones Registradas</h2>

          <div className="lista-afiliaciones">
            {filasFiltradas.length === 0 && !cargando ? (
              <SinDatos mensaje="No se encontraron afiliaciones" />
            ) : (
              filasFiltradas.map((afiliacion) => (
                <div key={String(codigoAfiliacionDesde(afiliacion))} className="tarjeta-afiliacion">
                  <div className="tarjeta-afiliacion-header">
                    <div className="tarjeta-afiliacion-info">
                      <h3 className="tarjeta-afiliacion-nombre">{afiliacion._empleado}</h3>
                      <p className="tarjeta-afiliacion-documento">Documento: {afiliacion._documento}</p>
                    </div>
                    <div className="tarjeta-afiliacion-estado">
                      <span className="etiqueta etiqueta-verde">{afiliacion._estadoEtiqueta}</span>
                    </div>
                  </div>

                  <div className="tarjeta-afiliacion-detalles">
                    <div className="detalle-fila">
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">Código:</span>
                        <span className="detalle-valor">{afiliacion._codigoUi}</span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">EPS:</span>
                        <span className="detalle-valor">{afiliacion._eps}</span>
                      </div>
                    </div>
                    <div className="detalle-fila">
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">Fecha solicitud:</span>
                        <span className="detalle-valor">{afiliacion._fechaSolicitud}</span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">Tipo/Régimen:</span>
                        <span className="detalle-valor">{afiliacion._tipoRegimen}</span>
                      </div>
                    </div>
                  </div>

                  <div className="tarjeta-afiliacion-acciones">
                    <button
                      type="button"
                      className="btn-accion-afiliacion btn-eliminar"
                      onClick={() => confirmarEliminar(afiliacion)}
                    >
                      Eliminar
                    </button>
                    <button type="button" className="btn-accion-afiliacion btn-modificar" onClick={() => manejarModificar(afiliacion)}>
                      Modificar
                    </button>
                    <button type="button" className="btn-accion-afiliacion btn-ver-detalles" onClick={() => manejarVerDetalles(afiliacion)}>
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ModalAfiliacion
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setAfiliacionEditar(null);
        }}
        datosAfiliacion={afiliacionEditar}
        empleados={empleados}
        catalogos={catalogos}
        alExito={alExitoGuardado}
      />
    </ContenedorPrincipal>
  );
}

export default Afiliaciones;
