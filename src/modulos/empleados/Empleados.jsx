import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContenedorPrincipal,
  EncabezadoModulo,
  TablaDatos,
  FiltrosBusqueda,
  PaginacionTabla,
} from '../../componentes';
import { ModalEmpleado } from './componentes';
import {
  getEmpleados,
  getEmpleadoById,
  extraerFilasEmpleados,
  extraerMetaPaginacion,
  PER_PAGE_TABLA_DEFAULT,
  nombreCompletoEmpleado,
  normalizarRegistroEmpleado,
  codigoEmpleadoDesde,
} from '../../services/empleados';
import { getBancos, extraerFilasBancos } from '../../services/bancos';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { ejecutarCargaEnFases } from '../../utils/cargaEnFases';
import { alertaErrorApi } from '../../utils/alertasSwal';

function estadoEmpLista(valor) {
  const u = String(valor || '').toUpperCase();
  if (u === 'ACTIVO') return { texto: 'Activo', cls: 'activo' };
  if (u === 'RETIRADO' || u === 'INACTIVO') return { texto: 'Retirado', cls: 'retirado' };
  return { texto: valor ? String(valor) : '—', cls: 'inactivo' };
}

/** fecha_nac del API (YYYY-MM-DD) → dd/mm/yyyy sin cambiar zona horaria */
function formatearFechaNacimientoLista(valor) {
  if (valor == null || valor === '') return '—';
  const t = String(valor).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? String(valor) : d.toLocaleDateString('es-CO');
}

function Empleados() {
  const navegar = useNavigate();
  const [lista, setLista] = useState([]);
  const [meta, setMeta] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [bancos, setBancos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeLista, setMensajeLista] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const [criteriosFiltro, setCriteriosFiltro] = useState({
    busqueda: '',
    estado: '',
  });

  const cargarPagina = useCallback(async (paginaPedida, forzar = false) => {
    setMensajeLista('');
    setCargando(true);
    try {
      const jsonEmp = await getEmpleados({
        forzar,
        page: paginaPedida,
        per_page: PER_PAGE_TABLA_DEFAULT,
      });
      setLista(extraerFilasEmpleados(jsonEmp));
      setMeta(extraerMetaPaginacion(jsonEmp));
      setPagina(paginaPedida);
    } catch (e) {
      setLista([]);
      setMeta(null);
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
      principal: (op) =>
        getEmpleados({ ...op, page: 1, per_page: PER_PAGE_TABLA_DEFAULT }),
      secundarios: [(op) => getBancos(op)],
      onPrincipal: (json, err) => {
        if (!activo) return;
        if (err) {
          setLista([]);
          setMeta(null);
          setMensajeLista(mensajeErrorApi(err));
        } else {
          setLista(extraerFilasEmpleados(json));
          setMeta(extraerMetaPaginacion(json));
          setPagina(1);
        }
        setCargando(false);
      },
      onSecundario: (_i, json) => {
        if (!activo) return;
        setBancos(extraerFilasBancos(json));
      },
    });
    return () => {
      activo = false;
    };
  }, []);

  const filasFiltradas = useMemo(() => {
    const q = (criteriosFiltro.busqueda || '').trim().toLowerCase();
    const est = (criteriosFiltro.estado || '').toUpperCase();

    return lista.filter((e) => {
      if (!e || typeof e !== 'object') return false;
      const u = String(e.estado_emp || '').toUpperCase();
      if (est === 'RETIRADO' && u !== 'RETIRADO' && u !== 'INACTIVO') return false;
      if (est === 'ACTIVO' && u !== 'ACTIVO') return false;
      if (est && est !== 'ACTIVO' && est !== 'RETIRADO' && u !== est) return false;
      if (q) {
        const nombre = nombreCompletoEmpleado(e).toLowerCase();
        const doc = String(e.doc_iden ?? '').toLowerCase();
        if (!nombre.includes(q) && !doc.includes(q)) return false;
      }
      return true;
    });
  }, [lista, criteriosFiltro]);

  const abrirNuevo = () => {
    setEmpleadoEditar(null);
    setMostrarModal(true);
  };

  const abrirEditar = async (fila) => {
    const cod = codigoEmpleadoDesde(fila);
    if (cod == null) return;
    try {
      const json = await getEmpleadoById(cod);
      const emp = normalizarRegistroEmpleado(json) ?? json?.data ?? json;
      setEmpleadoEditar(emp && typeof emp === 'object' ? emp : fila);
      setMostrarModal(true);
    } catch (err) {
      void alertaErrorApi('No se pudo abrir el empleado', err);
    }
  };

  const alExitoGuardado = async (tipo) => {
    await cargarPagina(pagina, true);
    setMensajeExito(
      tipo === 'creado' ? 'Empleado registrado correctamente.' : 'Empleado actualizado correctamente.',
    );
    window.setTimeout(() => setMensajeExito(''), 3000);
    setEmpleadoEditar(null);
  };

  return (
    <ContenedorPrincipal>
      <div className="modulo-empleados">
        <EncabezadoModulo
          titulo="Módulo de Empleados"
          subtitulo="Gestión del directorio de empleados y su información"
          textoBoton="Nuevo Empleado"
          alHacerClic={abrirNuevo}
        />

        {mensajeLista ? (
          <div className="empleado-pagina-alerta empleado-pagina-alerta--error" role="alert">
            <strong>Error al cargar empleados</strong>
            <p>{mensajeLista}</p>
          </div>
        ) : null}
        {mensajeExito ? (
          <div className="empleado-pagina-alerta empleado-pagina-alerta--info" role="status">
            <strong>Listo</strong>
            <p>{mensajeExito}</p>
          </div>
        ) : null}
        {cargando ? <p className="empleado-pagina-cargando">Cargando empleados…</p> : null}

        <FiltrosBusqueda
          titulo="Empleados registrados"
          placeholderBusqueda="Buscar por nombre o documento…"
          filtrosSelect={[
            {
              nombre: 'estado',
              etiqueta: 'Estado',
              placeholder: 'Todos los estados',
              opciones: [
                { valor: 'ACTIVO', texto: 'Activo' },
                { valor: 'RETIRADO', texto: 'Retirado' },
              ],
            },
          ]}
          onFiltrar={(filtros) => {
            setCriteriosFiltro({
              busqueda: filtros.busqueda || '',
              estado: filtros.estado || '',
            });
          }}
        />
        {(criteriosFiltro.busqueda || criteriosFiltro.estado) && (
          <p className="empleado-pagina-aviso-paginacion">
            La búsqueda y el filtro de estado aplican solo a los registros de esta página.
          </p>
        )}

        <div style={{ marginTop: '20px' }}>
          <TablaDatos
            columnas={[
              { campo: 'doc_iden', encabezado: 'Documento' },
              {
                campo: 'nombre_completo',
                encabezado: 'Nombre',
                renderizar: (_, fila) => nombreCompletoEmpleado(fila),
              },
              {
                campo: 'fecha_nac',
                encabezado: 'Fecha de nacimiento',
                renderizar: (v) => formatearFechaNacimientoLista(v),
              },
              {
                campo: 'numero_telefono',
                encabezado: 'Teléfono',
                renderizar: (v) =>
                  v != null && String(v).trim() !== '' ? String(v).trim() : '—',
              },
              {
                campo: 'estado_emp',
                encabezado: 'Estado',
                renderizar: (v) => {
                  const { texto, cls } = estadoEmpLista(v);
                  return <span className={`etiqueta etiqueta-${cls}`}>{texto}</span>;
                },
              },
            ]}
            datos={filasFiltradas}
            renderAcciones={(empleado) => (
              <>
                <button
                  type="button"
                  className="btn-accion-tabla btn-accion-editar"
                  title="Editar"
                  onClick={() => abrirEditar(empleado)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="btn-accion-tabla btn-accion-ver"
                  title="Ver"
                  onClick={() => {
                    const c = codigoEmpleadoDesde(empleado);
                    if (c != null) navegar(`/empleados/${c}`);
                  }}
                >
                  👁
                </button>
              </>
            )}
          />
          <PaginacionTabla
            meta={meta}
            cargando={cargando}
            onCambiarPagina={(p) => void cargarPagina(p)}
          />
        </div>
      </div>

      <ModalEmpleado
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setEmpleadoEditar(null);
        }}
        datosEmpleado={empleadoEditar}
        bancos={bancos}
        alExito={alExitoGuardado}
      />
    </ContenedorPrincipal>
  );
}

export default Empleados;
