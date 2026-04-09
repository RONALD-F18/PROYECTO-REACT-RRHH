import { useState, useEffect } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import {
  formatearMonedaCop,
  textoPeriodoPrestacion,
  postGestionarPrestacionSocial,
  mensajeErrorPrestacionesSociales,
} from '../../../services/prestacionesSociales';
import { nombreCompletoEmpleado } from '../../../services/empleados';
import { nombreCargoDesde } from '../../../services/cargos';

/**
 * Cambio de estado Pendiente → Pagado | Trasladado (flujo permitido por el sistema).
 * No hay edición manual de montos ni fechas en esta pantalla.
 */
function ModalGestionarPrestacion({
  mostrar,
  cerrar,
  periodo = null,
  contrato = null,
  alExito,
}) {
  const [estadoElegido, setEstadoElegido] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  useEffect(() => {
    if (mostrar) {
      setEstadoElegido('');
      setErrorLocal('');
    }
  }, [mostrar, periodo]);

  const emp = contrato?.empleado ?? {};
  const cargo = contrato?.cargo ?? {};
  const nombreEmp = nombreCompletoEmpleado(emp);
  const codCtr = contrato?.cod_contrato;
  const etiquetaContrato =
    codCtr != null ? `N°${codCtr} — ${nombreCargoDesde(cargo)}` : '—';

  const manejarActualizar = async () => {
    if (!periodo?.cod_prestacion_social_periodo) return;
    if (!estadoElegido) {
      setErrorLocal('Seleccione el nuevo estado.');
      return;
    }
    setEnviando(true);
    setErrorLocal('');
    try {
      await postGestionarPrestacionSocial({
        cod_prestacion_social_periodo: periodo.cod_prestacion_social_periodo,
        estado_pago: estadoElegido,
      });
      if (alExito) alExito();
      cerrar();
    } catch (e) {
      setErrorLocal(mensajeErrorPrestacionesSociales(e));
    } finally {
      setEnviando(false);
    }
  };

  if (!periodo) return null;

  return (
    <Modal
      mostrar={mostrar}
      cerrar={cerrar}
      titulo="Gestionar prestación social"
      classNameContenedor="modal-contenido--ancho-medio"
    >
      <p className="prestaciones-modal-subtitulo">
        Cambiar estado de período: Pendiente → Pagado o Trasladado
      </p>

      <div className="prestaciones-tarjeta-info">
        <h4 className="prestaciones-tarjeta-info-titulo">Período a gestionar</h4>
        <div className="prestaciones-grid-datos">
          <div>
            <span className="prestaciones-etiqueta-mini">Empleado</span>
            <p className="prestaciones-valor-mini">{nombreEmp}</p>
          </div>
          <div>
            <span className="prestaciones-etiqueta-mini">Contrato</span>
            <p className="prestaciones-valor-mini">{etiquetaContrato}</p>
          </div>
          <div>
            <span className="prestaciones-etiqueta-mini">Período</span>
            <p className="prestaciones-valor-mini">
              {textoPeriodoPrestacion(
                periodo.fecha_periodo_inicio,
                periodo.fecha_periodo_fin
              )}
            </p>
          </div>
          <div>
            <span className="prestaciones-etiqueta-mini">Estado actual</span>
            <p>
              <span className="badge-estado badge-pendiente">
                {periodo.estado_pago ?? '—'}
              </span>
            </p>
          </div>
        </div>
        <div className="prestaciones-montos-inline">
          <div>
            <span className="prestaciones-etiqueta-mini">Cesantías</span>
            <p className="prestaciones-valor-mini">
              {formatearMonedaCop(periodo.cesantias_valor)}
            </p>
          </div>
          <div>
            <span className="prestaciones-etiqueta-mini">Intereses</span>
            <p className="prestaciones-valor-mini">
              {formatearMonedaCop(periodo.intereses_cesantias_valor)}
            </p>
          </div>
          <div>
            <span className="prestaciones-etiqueta-mini">Prima</span>
            <p className="prestaciones-valor-mini">
              {formatearMonedaCop(periodo.prima_valor)}
            </p>
          </div>
          <div>
            <span className="prestaciones-etiqueta-mini">Vacaciones</span>
            <p className="prestaciones-valor-mini">
              {formatearMonedaCop(periodo.vacaciones_valor)}
            </p>
          </div>
        </div>
      </div>

      <div className="prestaciones-tarjeta-info prestaciones-tarjeta-info--accion">
        <h4 className="prestaciones-tarjeta-info-titulo">Actualizar estado de pago</h4>
        <label className="prestaciones-etiqueta-mini" htmlFor="nuevo-estado-ps">
          Nuevo estado
        </label>
        <select
          id="nuevo-estado-ps"
          className="select-estado-prestacion prestaciones-select-ancho"
          value={estadoElegido}
          onChange={(e) => setEstadoElegido(e.target.value)}
        >
          <option value="">Seleccione…</option>
          <option value="Pagado">Pagado</option>
          <option value="Trasladado">Trasladado</option>
        </select>
        {errorLocal ? (
          <p className="mensaje-error" style={{ marginTop: 8 }}>
            {errorLocal}
          </p>
        ) : null}
        <div className="prestaciones-modal-botones">
          <button type="button" className="btn-volver" onClick={cerrar} disabled={enviando}>
            Volver
          </button>
          <button
            type="button"
            className="btn btn-primario"
            onClick={manejarActualizar}
            disabled={enviando}
          >
            {enviando ? 'Guardando…' : 'Actualizar estado'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalGestionarPrestacion;
