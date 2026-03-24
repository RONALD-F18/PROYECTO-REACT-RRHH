import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TarjetaInformacion } from '../../componentes';
import { ModalAfiliacion } from './componentes';
import {
  getAfiliacionById,
  deleteAfiliacion,
  patchAfiliacion,
  normalizarRegistroAfiliacion,
  codigoAfiliacionDesde,
  obtenerCatalogosAfiliacion,
} from '../../services/afiliaciones';
import { getEmpleados, extraerFilasEmpleados, nombreCompletoEmpleado, codigoEmpleadoDesde } from '../../services/empleados';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { etiquetaEstadoAfiliacion, estadoAfiliacionDesdeEtiquetaUi, tipoRegimenFormDesdeApi } from '../../utils/afiliacionEstado';
import '../../estilos/modulos/afiliaciones.css';

function formatearSoloFecha(valor) {
  if (!valor) return '—';
  const t = String(valor).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(valor);
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

const ESTADOS_UI = ['Activa', 'Aprobada', 'Pendiente', 'En Proceso', 'Rechazada'];

function DetallesAfiliacion() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [registro, setRegistro] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    setError('');
    setCargando(true);
    try {
      const raw = await getAfiliacionById(id);
      const r = normalizarRegistroAfiliacion(raw) ?? raw?.data ?? raw;
      const cod = codigoAfiliacionDesde(r);
      if (!r || cod == null) {
        setRegistro(null);
        setError('No se encontró la afiliación.');
        return;
      }
      setRegistro(r);
    } catch (e) {
      setRegistro(null);
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
        const [je, cat] = await Promise.all([getEmpleados(), obtenerCatalogosAfiliacion()]);
        if (!a) return;
        setEmpleados(extraerFilasEmpleados(je));
        setCatalogos(cat);
      } catch {
        if (a) {
          setEmpleados([]);
          setCatalogos(null);
        }
      }
    })();
    return () => {
      a = false;
    };
  }, []);

  const vista = useMemo(() => {
    if (!registro || !catalogos) return null;
    const maps = {
      eps: mapaPorCod(catalogos.eps, 'cod_eps'),
      riesgos: mapaPorCod(catalogos.riesgos, 'cod_riesgo'),
      arls: mapaPorCod(catalogos.arls, 'cod_arl'),
      pensiones: mapaPorCod(catalogos.pensiones, 'cod_fondo_pensiones'),
      cesantias: mapaPorCod(catalogos.cesantias, 'cod_fondo_cesantias'),
      compensaciones: mapaPorCod(catalogos.compensaciones, 'cod_caja_compensacion'),
    };
    let emp =
      registro.empleado && typeof registro.empleado === 'object' && !Array.isArray(registro.empleado)
        ? registro.empleado
        : null;
    if (!emp && registro.cod_empleado != null) {
      emp = empleados.find((e) => String(codigoEmpleadoDesde(e)) === String(registro.cod_empleado)) ?? null;
    }
    const nombreEmp = emp ? nombreCompletoEmpleado(emp) : '—';
    const docEmp = emp ? String(emp.doc_iden ?? '—') : '—';
    const codAf = codigoAfiliacionDesde(registro);
    const eps = maps.eps.get(Number(registro.cod_eps));
    const arl = maps.arls.get(Number(registro.cod_arl));
    const riesgo = maps.riesgos.get(Number(registro.cod_riesgo));
    const pen = maps.pensiones.get(Number(registro.cod_fondo_pensiones));
    const ces = maps.cesantias.get(Number(registro.cod_fondo_cesantias));
    const caja = maps.compensaciones.get(Number(registro.cod_caja_compensacion));
    const estadoEtiqueta = etiquetaEstadoAfiliacion(registro.estado_afiliacion);

    return {
      empleado: nombreEmp,
      iniciales: inicialesDesdeNombre(nombreEmp),
      documento: docEmp,
      codigo: codAf != null ? `AF-${codAf}` : '—',
      estadoUi: estadoEtiqueta,
      eps: {
        entidad: eps?.nombre_eps ?? '—',
        tipo: tipoRegimenFormDesdeApi(registro.tipo_regimen),
        fechaAfiliacion: formatearSoloFecha(registro.fecha_afiliacion_eps),
      },
      pensiones: {
        entidad: pen?.nombre_fondo_pension ?? '—',
        fechaAfiliacion: formatearSoloFecha(registro.fecha_afiliacion_fondo_pensiones),
      },
      cesantias: {
        entidad: ces?.nombre_fondo_cesantia ?? '—',
        fechaAfiliacion: formatearSoloFecha(registro.fecha_afiliacion_fondo_cesantias),
      },
      arl: {
        entidad: arl?.nombre_arl ?? '—',
        claseRiesgo: riesgo?.nombre_riesgo ?? '—',
        fechaAfiliacion: formatearSoloFecha(registro.fecha_afiliacion_arl),
      },
      cajaCompensacion: {
        entidad: caja?.nombre_caja_compensacion ?? '—',
        fechaAfiliacion: formatearSoloFecha(registro.fecha_afiliacion_caja),
      },
      descripcion: registro.descripcion?.trim() ? registro.descripcion : '—',
    };
  }, [registro, catalogos, empleados]);

  const manejarCambioEstado = async (etiquetaUi) => {
    const cod = registro ? codigoAfiliacionDesde(registro) : null;
    if (cod == null) return;
    const estadoBd = estadoAfiliacionDesdeEtiquetaUi(etiquetaUi);
    setActualizandoEstado(true);
    try {
      await patchAfiliacion(cod, { estado_afiliacion: estadoBd });
      setRegistro((prev) => (prev ? { ...prev, estado_afiliacion: estadoBd } : prev));
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    } finally {
      setActualizandoEstado(false);
    }
  };

  const manejarEliminar = async () => {
    const cod = registro ? codigoAfiliacionDesde(registro) : null;
    if (cod == null) return;
    if (!window.confirm('¿Eliminar esta afiliación?')) return;
    try {
      await deleteAfiliacion(cod);
      navegar('/afiliaciones');
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  if (cargando || (!error && registro && !catalogos)) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Afiliaciones" subtitulo="Detalle" mostrarBoton={false} />
        <p className="contrato-pagina-cargando">Cargando…</p>
      </ContenedorPrincipal>
    );
  }

  if (error || !registro || !vista) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Afiliaciones" subtitulo="Detalle" mostrarBoton={false} />
        <div className="contrato-pagina-alerta contrato-pagina-alerta--error" role="alert">
          <p>{error || 'No disponible.'}</p>
          <button type="button" className="btn-volver" style={{ marginTop: 12 }} onClick={() => navegar('/afiliaciones')}>
            ← Volver al listado
          </button>
        </div>
      </ContenedorPrincipal>
    );
  }

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo titulo="Afiliaciones" subtitulo="Detalle completo de la afiliación seleccionada" mostrarBoton={false} />

      <div className="detalle-afiliacion">
        <div className="detalles-acciones">
          <button type="button" className="btn-volver" onClick={() => navegar('/afiliaciones')}>
            ← Volver
          </button>
          <div className="detalles-botones-accion">
            <button type="button" className="btn-accion btn-accion-editar" onClick={() => setMostrarModal(true)} title="Editar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button type="button" className="btn-accion btn-accion-eliminar" onClick={manejarEliminar} title="Eliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>

        <section className="detalle-afiliacion-encabezado">
          <div className="detalle-afiliacion-info">
            <div className="detalle-afiliacion-avatar">
              <span>{vista.iniciales}</span>
            </div>
            <div className="detalle-afiliacion-datos">
              <h1>Detalle de Afiliación</h1>
              <p>Información completa de seguridad social</p>
              <div className="detalle-afiliacion-empleado">
                <span className="detalle-afiliacion-nombre">{vista.empleado}</span>
                <span className="detalle-afiliacion-documento">{vista.documento}</span>
                <span className="detalle-afiliacion-codigo">Código {vista.codigo}</span>
              </div>
            </div>
          </div>
          <div className="detalle-afiliacion-estado">
            {(() => {
              const estadoVal = vista.estadoUi && vista.estadoUi !== '—' ? vista.estadoUi : 'Aprobada';
              const opciones = ESTADOS_UI.includes(estadoVal) ? ESTADOS_UI : [...ESTADOS_UI, estadoVal];
              return (
                <select
                  value={estadoVal}
                  onChange={(e) => manejarCambioEstado(e.target.value)}
                  className="select-estado-afiliacion"
                  disabled={actualizandoEstado}
                  aria-busy={actualizandoEstado}
                >
                  {opciones.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              );
            })()}
          </div>
        </section>

        <div className="detalle-afiliacion-grid">
          <TarjetaInformacion
            titulo="Entidad Promotora de Salud (EPS)"
            color="azul"
            campos={[
              { etiqueta: 'Entidad', valor: vista.eps.entidad },
              { etiqueta: 'Tipo', valor: vista.eps.tipo },
              { etiqueta: 'Fecha de Afiliación', valor: vista.eps.fechaAfiliacion },
            ]}
          />
          <TarjetaInformacion
            titulo="Fondo de Pensiones"
            color="verde"
            campos={[
              { etiqueta: 'Entidad', valor: vista.pensiones.entidad },
              { etiqueta: 'Fecha de Afiliación', valor: vista.pensiones.fechaAfiliacion },
            ]}
          />
          <TarjetaInformacion
            titulo="Fondo de Cesantías"
            color="morado"
            campos={[
              { etiqueta: 'Entidad', valor: vista.cesantias.entidad },
              { etiqueta: 'Fecha de Afiliación', valor: vista.cesantias.fechaAfiliacion },
            ]}
          />
          <TarjetaInformacion
            titulo="Aseguradora de riesgos Laborales (ARL)"
            color="rojo"
            campos={[
              { etiqueta: 'Entidad', valor: vista.arl.entidad },
              { etiqueta: 'Clase de Riesgo', valor: vista.arl.claseRiesgo },
              { etiqueta: 'Fecha de Afiliación', valor: vista.arl.fechaAfiliacion },
            ]}
          />
        </div>

        <TarjetaInformacion
          titulo="Caja de Compensación Familiar"
          color="amarillo"
          campos={[
            { etiqueta: 'Entidad', valor: vista.cajaCompensacion.entidad },
            { etiqueta: 'Fecha de Afiliación', valor: vista.cajaCompensacion.fechaAfiliacion },
          ]}
        />

        <section className="detalle-afiliacion-seccion-acciones" style={{ marginTop: 24 }}>
          <h2 className="detalle-seccion-titulo">Descripción</h2>
          <p style={{ color: '#475569', lineHeight: 1.5 }}>{vista.descripcion}</p>
        </section>

        <section className="detalle-afiliacion-seccion-acciones">
          <h2 className="detalle-seccion-titulo">Acciones</h2>
          <div className="detalle-afiliacion-acciones">
            <button type="button" className="btn-detalle btn-detalle-secundario" onClick={() => navegar('/afiliaciones')}>
              Volver
            </button>
          </div>
        </section>
      </div>

      <ModalAfiliacion
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
        datosAfiliacion={registro}
        empleados={empleados}
        catalogos={catalogos}
        alExito={async () => {
          await cargar();
          setMostrarModal(false);
        }}
      />
    </ContenedorPrincipal>
  );
}

export default DetallesAfiliacion;
