import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos, FiltrosBusqueda } from '../../componentes';
import { ModalContrato } from './componentes';
import {
  getContratos,
  getContratoById,
  deleteContrato,
  extraerFilasContratos,
  codigoContratoDesde,
  patchContrato,
} from '../../services/contratos';
import { getEmpleados, extraerFilasEmpleados, nombreCompletoEmpleado, codigoEmpleadoDesde } from '../../services/empleados';
import { getCargos, extraerFilasCargos, nombreCargoDesde, codigoCargoDesde } from '../../services/cargos';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { etiquetaEstadoContrato } from './contratoEnums';


//Formatear la fecha de inicio del contrato.....
function formatearSoloFecha(valor) {
  if (!valor) return '—';
  const t = String(valor).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(valor);
}


//Formatear el salario del contrato.....
function formatearSalarioCO(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
}

function estadoContratoActivo(valor) {
  return String(valor || '').toUpperCase() === 'ACTIVO';
}

function Contratos() {
  const navegar = useNavigate();
  const [lista, setLista] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeLista, setMensajeLista] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [contratoEditar, setContratoEditar] = useState(null);
  const [criteriosFiltro, setCriteriosFiltro] = useState({
    busqueda: '',
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

  const mapaCargos = useMemo(() => {
    const m = new Map();
    for (const c of cargos) {
      const id = codigoCargoDesde(c);
      if (id != null) m.set(Number(id), c);
    }
    return m;
  }, [cargos]);

  const filasEnriquecidas = useMemo(() => {
    return lista.map((row) => {
      if (!row || typeof row !== 'object') return row;
      const codEmp = row.cod_empleado != null ? Number(row.cod_empleado) : null;
      const codCar = row.cod_cargo != null ? Number(row.cod_cargo) : null;
      const emp = codEmp != null && Number.isFinite(codEmp) ? mapaEmpleados.get(codEmp) : null;
      const car = codCar != null && Number.isFinite(codCar) ? mapaCargos.get(codCar) : null;
      return {
        ...row,
        _nombre_empleado: emp ? nombreCompletoEmpleado(emp) : '—',
        _nomb_cargo: car ? nombreCargoDesde(car) : '—',
      };
    });
  }, [lista, mapaEmpleados, mapaCargos]);

  const recargarLista = useCallback(async () => {
    setMensajeLista('');
    setCargando(true);
    try {
      const json = await getContratos();
      setLista(extraerFilasContratos(json));
    } catch (e) {
      setLista([]);
      setMensajeLista(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      setMensajeLista('');
      setCargando(true);
      try {
        const jsonCtr = await getContratos();
        if (!activo) return;
        setLista(extraerFilasContratos(jsonCtr));
      } catch (e) {
        if (!activo) return;
        setLista([]);
        setMensajeLista(mensajeErrorApi(e));
      } finally {
        if (activo) setCargando(false);
      }
      try {
        const jsonEmp = await getEmpleados();
        if (activo) setEmpleados(extraerFilasEmpleados(jsonEmp));
      } catch {
        if (activo) setEmpleados([]);
      }
      try {
        const jsonCar = await getCargos();
        if (activo) setCargos(extraerFilasCargos(jsonCar));
      } catch {
        if (activo) setCargos([]);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const filasFiltradas = useMemo(() => {
    const q = (criteriosFiltro.busqueda || '').trim().toLowerCase();
    const est = (criteriosFiltro.estado || '').toUpperCase();

    return filasEnriquecidas.filter((row) => {
      if (!row || typeof row !== 'object') return false;
      if (est && String(row.estado_contrato || '').toUpperCase() !== est) return false;
      if (q) {
        const nom = String(row._nombre_empleado || '').toLowerCase();
        const cod = String(row.cod_contrato ?? '');
        const emp = mapaEmpleados.get(Number(row.cod_empleado));
        const doc = emp ? String(emp.doc_iden ?? '').toLowerCase() : '';
        if (!nom.includes(q) && !cod.includes(q) && !doc.includes(q)) return false;
      }
      return true;
    });
  }, [filasEnriquecidas, criteriosFiltro, mapaEmpleados]);

  const abrirNuevo = () => {
    setContratoEditar(null);
    setMostrarModal(true);
  };

  const abrirEditar = async (fila) => {
    const cod = codigoContratoDesde(fila);
    if (cod == null) return;
    try {
      const json = await getContratoById(cod);
      setContratoEditar(json?.data ?? json);
      setMostrarModal(true);
    } catch (err) {
      window.alert(mensajeErrorApi(err));
    }
  };

  const confirmarEliminar = async (fila) => {
    const cod = codigoContratoDesde(fila);
    if (cod == null) return;
    if (!window.confirm('¿Eliminar este contrato? Esta acción no se puede deshacer.')) return;
    try {
      await deleteContrato(cod);
      await recargarLista();
      setMensajeExito('Contrato eliminado correctamente.');
      window.setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  const finalizarContrato = async (fila) => {
    const cod = codigoContratoDesde(fila);
    if (cod == null) return;
    if (!estadoContratoActivo(fila.estado_contrato)) {
      window.alert('Este contrato ya está finalizado.');
      return;
    }
    if (!window.confirm('¿Marcar este contrato como finalizado (inactivo)?')) return;
    try {
      await patchContrato(cod, { estado_contrato: 'INACTIVO' });
      await recargarLista();
      setMensajeExito('Contrato actualizado.');
      window.setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  const alExitoGuardado = async () => {
    await recargarLista();
    setMensajeExito('Cambios guardados correctamente.');
    window.setTimeout(() => setMensajeExito(''), 3000);
    setContratoEditar(null);
  };

  return (
    <ContenedorPrincipal>
      <div className="modulo-contratos">
        <EncabezadoModulo
          titulo="Gestión de contratos"
          subtitulo="Registro y seguimiento de contratos de trabajo"
          textoBoton="Nuevo contrato"
          alHacerClic={abrirNuevo}
        />

        {mensajeLista ? (
          <div className="contrato-pagina-alerta contrato-pagina-alerta--error" role="alert">
            <strong>Error al cargar contratos</strong>
            <p>{mensajeLista}</p>
          </div>
        ) : null}
        {mensajeExito ? (
          <div className="contrato-pagina-alerta contrato-pagina-alerta--info" role="status">
            <strong>Listo</strong>
            <p>{mensajeExito}</p>
          </div>
        ) : null}
        {cargando ? <p className="contrato-pagina-cargando">Cargando contratos…</p> : null}

        <FiltrosBusqueda
          titulo="Contratos registrados"
          placeholderBusqueda="Buscar por empleado, documento o código…"
          filtrosSelect={[
            {
              nombre: 'estado',
              etiqueta: 'Estado',
              placeholder: 'Todos los estados',
              opciones: [
                { valor: 'ACTIVO', texto: 'Vigente' },
                { valor: 'INACTIVO', texto: 'Finalizado' },
              ],
            },
          ]}
          onFiltrar={(filtros) =>
            setCriteriosFiltro({
              busqueda: filtros.busqueda || '',
              estado: filtros.estado || '',
            })
          }
        />

        <div className="contrato-tabla-wrap">
          <TablaDatos
            columnas={[
              { campo: 'cod_contrato', encabezado: 'Código' },
              {
                campo: '_nombre_empleado',
                encabezado: 'Empleado',
                renderizar: (v) => (v && v !== '—' ? v : '—'),
              },
              {
                campo: '_nomb_cargo',
                encabezado: 'Cargo',
                renderizar: (v) => String(v || '—').toUpperCase(),
              },
              {
                campo: 'salario_base',
                encabezado: 'Salario',
                renderizar: (v) => formatearSalarioCO(v),
              },
              {
                campo: 'fecha_ingreso',
                encabezado: 'Inicio',
                renderizar: (v) => formatearSoloFecha(v),
              },
              {
                campo: 'estado_contrato',
                encabezado: 'Estado',
                renderizar: (v) => {
                  const activo = estadoContratoActivo(v);
                  return (
                    <span className={`etiqueta etiqueta-${activo ? 'activo' : 'inactivo'}`}>
                      {etiquetaEstadoContrato(v)}
                    </span>
                  );
                },
              },
            ]}
            datos={filasFiltradas}
            renderAcciones={(contrato) => (
              <div className="tabla-acciones-contrato">
                <button
                  type="button"
                  className="tabla-enlace-accion tabla-enlace-accion--ver"
                  onClick={() => {
                    const c = codigoContratoDesde(contrato);
                    if (c != null) navegar(`/contratos/${c}`);
                  }}
                >
                  Ver
                </button>
                <button type="button" className="tabla-enlace-accion tabla-enlace-accion--editar" onClick={() => abrirEditar(contrato)}>
                  Editar
                </button>
                {estadoContratoActivo(contrato.estado_contrato) ? (
                  <button type="button" className="tabla-enlace-accion tabla-enlace-accion--finalizar" onClick={() => finalizarContrato(contrato)}>
                    Finalizar
                  </button>
                ) : null}
                <button type="button" className="tabla-enlace-accion tabla-enlace-accion--eliminar" onClick={() => confirmarEliminar(contrato)}>
                  Eliminar
                </button>
              </div>
            )}
          />
        </div>
      </div>

      <ModalContrato
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setContratoEditar(null);
        }}
        datosContrato={contratoEditar}
        empleados={empleados}
        cargos={cargos}
        alExito={alExitoGuardado}
      />
    </ContenedorPrincipal>
  );
}

export default Contratos;
