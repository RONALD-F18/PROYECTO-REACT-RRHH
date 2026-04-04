import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos, FiltrosBusqueda } from '../../componentes';
import { ModalContrato } from './componentes';
import {
  getContratos,
  getContratoById,
  extraerFilasContratos,
  codigoContratoDesde,
} from '../../services/contratos';
import { getEmpleados, extraerFilasEmpleados, nombreCompletoEmpleado, codigoEmpleadoDesde } from '../../services/empleados';
import { getCargos, extraerFilasCargos, nombreCargoDesde, codigoCargoDesde } from '../../services/cargos';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { alertaErrorApi } from '../../utils/alertasSwal';
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
//1
function formatearSalarioCO(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
}

function estadoContratoActivo(valor) {
  return String(valor || '').toUpperCase() === 'ACTIVO';
}

/** Para filtrar: INACTIVO (API legada) cuenta como FINALIZADO. */
function estadoContratoNormalizadoFiltro(valor) {
  const u = String(valor || '').toUpperCase();
  return u === 'INACTIVO' ? 'FINALIZADO' : u;
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
        const [rCtr, rEmp, rCar] = await Promise.allSettled([getContratos(), getEmpleados(), getCargos()]);
        if (!activo) return;
        const partes = [];
        if (rCtr.status === 'fulfilled') setLista(extraerFilasContratos(rCtr.value));
        else {
          setLista([]);
          partes.push(mensajeErrorApi(rCtr.reason));
        }
        if (rEmp.status === 'fulfilled') setEmpleados(extraerFilasEmpleados(rEmp.value));
        else setEmpleados([]);
        if (rCar.status === 'fulfilled') setCargos(extraerFilasCargos(rCar.value));
        else setCargos([]);
        if (partes.length) setMensajeLista(partes.join(' · '));
      } catch (e) {
        if (!activo) return;
        setLista([]);
        setMensajeLista(mensajeErrorApi(e));
      } finally {
        if (activo) setCargando(false);
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
      if (est && estadoContratoNormalizadoFiltro(row.estado_contrato) !== est) return false;
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

  const resumenContratos = useMemo(() => {
    const total = filasFiltradas.length;
    const activos = filasFiltradas.filter((x) => estadoContratoActivo(x.estado_contrato)).length;
    const finalizados = total - activos;
    return { total, activos, finalizados };
  }, [filasFiltradas]);

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
      void alertaErrorApi('No se pudo abrir el contrato', err);
    }
  };

  const confirmarEliminar = async (fila) => {
    const cod = codigoContratoDesde(fila);
    if (cod == null) return;
    const ok = await confirmarEliminacion({
      titulo: '¿Eliminar este contrato?',
    });
    if (!ok) return;
    try {
      await deleteContrato(cod);
      await recargarLista();
      setMensajeExito('Contrato eliminado correctamente.');
      window.setTimeout(() => setMensajeExito(''), 3000);
    } catch (e) {
      void alertaErrorEliminacion(e, 'contrato');
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

        <section className="contratos-kpis">
          <article className="contrato-kpi contrato-kpi--total">
            <span>Total</span>
            <strong>{resumenContratos.total}</strong>
          </article>
          <article className="contrato-kpi contrato-kpi--activos">
            <span>Activos</span>
            <strong>{resumenContratos.activos}</strong>
          </article>
          <article className="contrato-kpi contrato-kpi--finalizados">
            <span>Finalizados</span>
            <strong>{resumenContratos.finalizados}</strong>
          </article>
        </section>

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
                { valor: 'FINALIZADO', texto: 'Finalizado' },
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

        <div className="contrato-tabla-wrap">
          <TablaDatos
            accionesAlineacion="center"
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
              <>
                <button
                  type="button"
                  className="btn-accion-tabla btn-accion-ver"
                  title="Ver detalle"
                  aria-label="Ver detalle"
                  onClick={() => {
                    const c = codigoContratoDesde(contrato);
                    if (c != null) navegar(`/contratos/${c}`);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="btn-accion-tabla btn-accion-editar"
                  title="Editar"
                  aria-label="Editar contrato"
                  onClick={() => abrirEditar(contrato)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </>
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
