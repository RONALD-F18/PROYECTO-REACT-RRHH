import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos } from '../../componentes';
import { ModalGestionarPrestacion } from './componentes';
import Swal from 'sweetalert2';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { nombreCompletoEmpleado } from '../../services/empleados';
import { nombreCargoDesde } from '../../services/cargos';
import {
  getContratoPrestaciones,
  postCalcularPrestacionesContrato,
  deletePrestacionSocialPeriodo,
  formatearMonedaCop,
  textoPeriodoPrestacion,
} from '../../services/prestacionesSociales';

/**
 * Detalle por cod_contrato (ruta /prestaciones/:id).
 *
 * El backend no ofrece PUT/PATCH para fechas ni montos de un período: solo
 * POST calcular-prestaciones (período nuevo hasta hoy), POST gestionar (Pendiente→Pagado|Trasladado)
 * y DELETE si el período sigue Pendiente.
 */
function DetallesPrestaciones() {
  const { id: codContratoParam } = useParams();
  const navegar = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [prestaciones, setPrestaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [calculando, setCalculando] = useState(false);

  const [modalGestionar, setModalGestionar] = useState(false);
  const [periodoGestionar, setPeriodoGestionar] = useState(null);

  const codContrato = codContratoParam != null ? String(codContratoParam).trim() : '';

  const recargar = useCallback(async () => {
    if (!codContrato) {
      setContrato(null);
      setPrestaciones([]);
      setCargando(false);
      setError('Contrato no indicado.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const { contrato: c, prestaciones: lista } = await getContratoPrestaciones(codContrato);
      setContrato(c);
      setPrestaciones(lista);
    } catch (e) {
      const status = e.response?.status;
      setContrato(null);
      setPrestaciones([]);
      if (status === 404) {
        setError('No se encontró ese contrato o no tiene datos de prestaciones.');
      } else {
        setError(mensajeErrorApi(e));
      }
    } finally {
      setCargando(false);
    }
  }, [codContrato]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const emp = contrato?.empleado ?? {};
  const cargo = contrato?.cargo ?? {};
  const nombreEmp = nombreCompletoEmpleado(emp);
  const nombreCargo = nombreCargoDesde(cargo);
  const salarioMostrar = formatearMonedaCop(contrato?.salario_base);

  const manejarCalcular = async () => {
    if (!codContrato) return;
    setCalculando(true);
    try {
      await postCalcularPrestacionesContrato(codContrato);
      await Swal.fire({
        icon: 'success',
        title: 'Período calculado',
        text: 'Se registró un nuevo período con estado Pendiente.',
      });
      await recargar();
    } catch (e) {
      await Swal.fire({ icon: 'error', title: 'No se pudo calcular', text: mensajeErrorApi(e) });
    } finally {
      setCalculando(false);
    }
  };

  const abrirGestionar = (fila) => {
    if (String(fila.estado_pago ?? '').trim() !== 'Pendiente') return;
    setPeriodoGestionar(fila);
    setModalGestionar(true);
  };

  const manejarEliminar = async (fila) => {
    if (String(fila.estado_pago ?? '').trim() !== 'Pendiente') return;
    const res = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar este período?',
      text: 'Solo los períodos en estado Pendiente pueden eliminarse. Podrás volver a calcular después.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!res.isConfirmed) return;
    try {
      await deletePrestacionSocialPeriodo(fila.cod_prestacion_social_periodo);
      await Swal.fire({ icon: 'success', title: 'Período eliminado' });
      await recargar();
    } catch (e) {
      await Swal.fire({ icon: 'error', title: 'Error', text: mensajeErrorApi(e) });
    }
  };

  const filasTabla = prestaciones.map((p) => ({
    ...p,
    _periodoTexto: textoPeriodoPrestacion(p.fecha_periodo_inicio, p.fecha_periodo_fin),
    _cesantias: formatearMonedaCop(p.cesantias_valor),
    _intereses: formatearMonedaCop(p.intereses_cesantias_valor),
    _prima: formatearMonedaCop(p.prima_valor),
    _vacaciones: formatearMonedaCop(p.vacaciones_valor),
  }));

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Prestaciones Sociales"
        subtitulo="Gestión, cálculo y pagos de beneficios laborales"
        mostrarBoton={false}
      />

      <button type="button" className="btn-volver" onClick={() => navegar('/prestaciones')} style={{ marginBottom: '24px' }}>
        ← Volver
      </button>

      {cargando ? (
        <p>Cargando…</p>
      ) : error ? (
        <p className="mensaje-error">{error}</p>
      ) : (
        <div className="detalles-prestaciones">
          <h2 className="detalles-titulo">Gestión de prestaciones sociales</h2>

          <div className="tarjeta-empleado">
            <div className="tarjeta-empleado-info">
              <div className="info-fila">
                <span className="info-etiqueta">Empleado(a)</span>
                <span className="info-valor">{nombreEmp}</span>
              </div>
              <div className="info-fila">
                <span className="info-etiqueta">Cargo</span>
                <span className="info-valor">{nombreCargo}</span>
              </div>
              <div className="info-fila">
                <span className="info-etiqueta">Salario base (contrato)</span>
                <span className="info-valor">{salarioMostrar}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-exito"
              onClick={manejarCalcular}
              disabled={calculando}
            >
              {calculando ? 'Calculando…' : 'Calcular prestaciones'}
            </button>
          </div>

          <p className="prestaciones-nota-api" style={{ color: 'var(--gris-600)', fontSize: 'var(--texto-sm)' }}>
            El servidor calcula el período hasta la fecha actual; no se pueden editar montos ni fechas por
            formulario. Para corregir un período en Pendiente, elimínelo y vuelva a calcular.
          </p>

          <h2 className="detalles-titulo">Cálculos</h2>

          <TablaDatos
            columnas={[
              { campo: '_periodoTexto', encabezado: 'Período' },
              {
                campo: 'dias_trabajados',
                encabezado: 'Días',
                renderizar: (d) => (d != null ? d : '—'),
              },
              { campo: '_cesantias', encabezado: 'Cesantías' },
              { campo: '_intereses', encabezado: 'Intereses' },
              { campo: '_prima', encabezado: 'Prima' },
              { campo: '_vacaciones', encabezado: 'Vacaciones' },
              {
                campo: 'estado_pago',
                encabezado: 'Estado',
                renderizar: (est, fila) => {
                  const s = String(est ?? '');
                  const cls =
                    s === 'Pagado'
                      ? 'badge-estado badge-pagado'
                      : s === 'Trasladado'
                        ? 'badge-estado badge-trasladado'
                        : 'badge-estado badge-pendiente';
                  return (
                    <div className="estados-container">
                      <span className={cls}>{s || '—'}</span>
                      {s === 'Pendiente' ? (
                        <button
                          type="button"
                          className="btn btn-primario btn-sm"
                          style={{ marginTop: 8 }}
                          onClick={() => abrirGestionar(fila)}
                        >
                          Gestionar estado
                        </button>
                      ) : null}
                    </div>
                  );
                },
              },
            ]}
            datos={filasTabla}
            renderAcciones={(fila) => {
              const pendiente = String(fila.estado_pago ?? '').trim() === 'Pendiente';
              return (
                <button
                  type="button"
                  className="btn-accion-tabla btn-accion-eliminar"
                  title={
                    pendiente
                      ? 'Eliminar período (solo Pendiente)'
                      : 'Solo se puede eliminar si el estado es Pendiente'
                  }
                  disabled={!pendiente}
                  onClick={() => manejarEliminar(fila)}
                >
                  🗑
                </button>
              );
            }}
          />
        </div>
      )}

      <ModalGestionarPrestacion
        mostrar={modalGestionar}
        cerrar={() => {
          setModalGestionar(false);
          setPeriodoGestionar(null);
        }}
        periodo={periodoGestionar}
        contrato={contrato}
        alExito={recargar}
      />
    </ContenedorPrincipal>
  );
}

export default DetallesPrestaciones;
