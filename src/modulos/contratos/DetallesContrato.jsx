import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';
import { ModalContrato } from './componentes';
import {
  getContratoById,
  deleteContrato,
  patchContrato,
  normalizarRegistroContrato,
  codigoContratoDesde,
} from '../../services/contratos';
import {
  nombreCompletoEmpleado,
  getEmpleados,
  extraerFilasEmpleados,
} from '../../services/empleados';
import { nombreCargoDesde } from '../../services/cargos';
import { getCargos, extraerFilasCargos } from '../../services/cargos';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { ESTADO_CONTRATO } from './contratoEnums';

function formatearSoloFecha(valor) {
  if (!valor) return '—';
  const t = String(valor).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(valor);
}

function formatearSalarioCO(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);
}

function DetallesContrato() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [empleadosLista, setEmpleadosLista] = useState([]);
  const [cargosLista, setCargosLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    setError('');
    setCargando(true);
    try {
      const raw = await getContratoById(id);
      const c = normalizarRegistroContrato(raw) ?? raw?.data ?? raw;
      const cod = codigoContratoDesde(c);
      if (!c || cod == null) {
        setContrato(null);
        setError('No se encontró el contrato.');
        return;
      }
      setContrato(c);
    } catch (e) {
      setContrato(null);
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
        const [se, sc] = await Promise.allSettled([getEmpleados(), getCargos()]);
        if (!a) return;
        if (se.status === 'fulfilled') setEmpleadosLista(extraerFilasEmpleados(se.value));
        else setEmpleadosLista([]);
        if (sc.status === 'fulfilled') setCargosLista(extraerFilasCargos(sc.value));
        else setCargosLista([]);
      } catch {
        if (a) {
          setEmpleadosLista([]);
          setCargosLista([]);
        }
      }
    })();
    return () => {
      a = false;
    };
  }, []);

  const manejarCambioEstado = async (nuevo) => {
    const cod = contrato ? codigoContratoDesde(contrato) : null;
    if (cod == null || !nuevo) return;
    setActualizandoEstado(true);
    try {
      await patchContrato(cod, { estado_contrato: nuevo });
      setContrato((prev) => (prev ? { ...prev, estado_contrato: nuevo } : prev));
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    } finally {
      setActualizandoEstado(false);
    }
  };

  const manejarEliminar = async () => {
    const cod = contrato ? codigoContratoDesde(contrato) : null;
    if (cod == null) return;
    if (!window.confirm('¿Eliminar este contrato?')) return;
    try {
      await deleteContrato(cod);
      navegar('/contratos');
    } catch (e) {
      window.alert(mensajeErrorApi(e));
    }
  };

  if (cargando) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Contratos" subtitulo="Detalle" mostrarBoton={false} />
        <p className="contrato-pagina-cargando">Cargando…</p>
      </ContenedorPrincipal>
    );
  }

  if (error || !contrato) {
    return (
      <ContenedorPrincipal>
        <EncabezadoModulo titulo="Contratos" subtitulo="Detalle" mostrarBoton={false} />
        <div className="contrato-pagina-alerta contrato-pagina-alerta--error" role="alert">
          <p>{error || 'No disponible.'}</p>
          <button type="button" className="btn-volver" style={{ marginTop: 12 }} onClick={() => navegar('/contratos')}>
            ← Volver al listado
          </button>
        </div>
      </ContenedorPrincipal>
    );
  }

  const emp = contrato.empleado && typeof contrato.empleado === 'object' ? contrato.empleado : null;
  const cargoObj = contrato.cargo && typeof contrato.cargo === 'object' ? contrato.cargo : null;
  const nombreEmp = emp ? nombreCompletoEmpleado(emp) : '—';
  const docEmp = emp?.doc_iden ?? '—';
  const telEmp = emp?.numero_telefono ?? '—';
  const cargoNombre = cargoObj ? nombreCargoDesde(cargoObj) : '—';
  const codCtr = codigoContratoDesde(contrato);

  const fechaFinTexto =
    contrato.fecha_fin == null || String(contrato.fecha_fin).trim() === ''
      ? 'Sin fecha de fin (vigencia abierta)'
      : formatearSoloFecha(contrato.fecha_fin);

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo titulo="Contratos" subtitulo="Detalle del contrato" mostrarBoton={false} />

      <div className="detalles-contrato">
        <div className="detalles-acciones">
          <button type="button" className="btn-volver" onClick={() => navegar('/contratos')}>
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

        <div className="contrato-cabecera-resumen">
          <div className="contrato-cabecera-resumen-texto">
            <h2 className="contrato-cabecera-titulo">Contrato #{codCtr}</h2>
            <p className="contrato-cabecera-sub">
              {nombreEmp} · {formatearSoloFecha(contrato.fecha_ingreso)}
            </p>
          </div>
          <div className="contrato-cabecera-estado">
            <span className="contrato-cabecera-estado-label">Estado</span>
            <select
              value={String(contrato.estado_contrato || '').toUpperCase() || 'ACTIVO'}
              onChange={(e) => manejarCambioEstado(e.target.value)}
              className="select-estado-empleado"
              disabled={actualizandoEstado}
              aria-busy={actualizandoEstado}
            >
              {ESTADO_CONTRATO.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información del empleado</h3>
          <div className="campos-grid">
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Nombre completo</span>
              <span className="campo-valor">{nombreEmp}</span>
            </div>
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Documento</span>
              <span className="campo-valor">{docEmp}</span>
            </div>
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Celular</span>
              <span className="campo-valor">{telEmp}</span>
            </div>
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Cargo</span>
              <span className="campo-valor">{cargoNombre}</span>
            </div>
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Código de contrato</span>
              <span className="campo-valor">{codCtr}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Términos contractuales</h3>
          <div className="campos-grid">
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Tipo de contrato</span>
              <span className="campo-valor">{contrato.tipo_contrato ?? '—'}</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Modalidad</span>
              <span className="campo-valor">{contrato.modalidad_trabajo ?? '—'}</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Forma de pago</span>
              <span className="campo-valor">{contrato.forma_de_pago ?? '—'}</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Horario</span>
              <span className="campo-valor">{contrato.horario_trabajo ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Compensación y vigencia</h3>
          <div className="campos-grid">
            <div className="campo-item campo-morado">
              <span className="campo-etiqueta">Salario base</span>
              <span className="campo-valor">{formatearSalarioCO(contrato.salario_base)}</span>
            </div>
            <div className="campo-item campo-morado">
              <span className="campo-etiqueta">Auxilio de transporte</span>
              <span className="campo-valor">{contrato.auxilio_transporte ? 'Sí' : 'No'}</span>
            </div>
            <div className="campo-item campo-azul">
              <span className="campo-etiqueta">Fecha de ingreso</span>
              <span className="campo-valor">{formatearSoloFecha(contrato.fecha_ingreso)}</span>
            </div>
            <div className="campo-item campo-azul">
              <span className="campo-etiqueta">Fecha de finalización</span>
              <span className="campo-valor">{fechaFinTexto}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Descripción</h3>
          <div className="campo-descripcion">
            <div className="descripcion-barra" />
            <p className="descripcion-texto">{contrato.descripcion?.trim() ? contrato.descripcion : '—'}</p>
          </div>
        </div>
      </div>

      <ModalContrato
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
        datosContrato={contrato}
        empleados={empleadosLista}
        cargos={cargosLista}
        alExito={async () => {
          await cargar();
          setMostrarModal(false);
        }}
      />
    </ContenedorPrincipal>
  );
}

export default DetallesContrato;
