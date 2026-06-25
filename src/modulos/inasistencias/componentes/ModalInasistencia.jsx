import { useEffect, useMemo, useState } from 'react';
import Modal, { BotonCancelarModal } from '../../../componentes/comunes/Modal';
import {
  construirPayloadInasistencia,
  extraerMensajeValidacion,
  estadoUiDesdeMotivo,
  limpiarMotivoPersistido,
  ESTADO_UI,
} from '../utils/inasistencias.mapper';
import { alertaError, alertaErrorApi } from '../../../utils/alertasSwal';

function estadoInicial(registro, fechaPreseleccionada, codEmpleadoPreseleccionado) {
  if (!registro) {
    const hoy = fechaPreseleccionada || new Date().toISOString().slice(0, 10);
    return {
      fecha: hoy,
      cod_empleado: codEmpleadoPreseleccionado || '',
      estado: ESTADO_UI.AUSENTE,
      motivo: '',
      justificado: false,
      observaciones: '',
    };
  }
  return {
    fecha: String(registro.fecha_inasistencia || '').slice(0, 10),
    cod_empleado: String(registro.cod_empleado || ''),
    estado: estadoUiDesdeMotivo(registro.motivo_inasistencia),
    motivo: limpiarMotivoPersistido(registro.motivo_inasistencia || ''),
    justificado: String(registro.justificado || '').toUpperCase() === 'SI',
    observaciones: registro.observaciones || '',
  };
}

function ModalInasistencia({
  mostrar,
  onClose,
  empleados,
  registroEditar,
  onGuardar,
  fechaPreseleccionada,
  codEmpleadoPreseleccionado,
}) {
  const [formulario, setFormulario] = useState(
    estadoInicial(null, fechaPreseleccionada, codEmpleadoPreseleccionado),
  );
  const [errores, setErrores] = useState({});
  const [docEmpleado, setDocEmpleado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const bloquearEmpleado = !registroEditar && !!codEmpleadoPreseleccionado;

  useEffect(() => {
    if (!mostrar) return;
    setFormulario(estadoInicial(registroEditar, fechaPreseleccionada, codEmpleadoPreseleccionado));
    setErrores({});
    const cod = registroEditar?.cod_empleado ?? codEmpleadoPreseleccionado ?? '';
    if (cod) {
      const emp = empleados.find((e) => String(e.cod_empleado) === String(cod));
      setDocEmpleado(emp?.doc_iden != null ? String(emp.doc_iden) : '');
    } else {
      setDocEmpleado('');
    }
  }, [mostrar, registroEditar, fechaPreseleccionada, codEmpleadoPreseleccionado, empleados]);

  const codigoUi = useMemo(() => {
    const n = registroEditar?.cod_inasistencias ?? null;
    return n != null && n !== '' ? `INS-${n}` : 'INS-5355';
  }, [registroEditar]);

  const empleadoBloqueado = useMemo(() => {
    if (!bloquearEmpleado) return null;
    const cod = String(formulario.cod_empleado ?? '');
    if (!cod) return null;
    return empleados.find((e) => String(e.cod_empleado) === cod) ?? null;
  }, [bloquearEmpleado, empleados, formulario.cod_empleado]);

  const nombreEmpleadoBloqueado = useMemo(() => {
    const e = empleadoBloqueado;
    if (!e) return '';
    const nombre = [e.nombre_empleado, e.apellidos_empleado].filter(Boolean).join(' ').trim();
    const cargo = e.cargo || e.nom_cargo || '';
    return cargo ? `${nombre} - ${cargo}` : nombre;
  }, [empleadoBloqueado]);

  const validar = () => {
    const next = {};
    if (!formulario.fecha) next.fecha = 'La fecha es requerida.';
    if (!formulario.cod_empleado) next.cod_empleado = 'Seleccione un empleado.';
    if (formulario.estado === ESTADO_UI.PRESENTE) {
      next.estado =
        'No se registra asistencia explícita: sin novedad en un día ya cuenta como asistencia. Elimina este registro antiguo o elige ausencia, tardanza o día libre.';
    }
    if (!formulario.motivo.trim()) next.motivo = 'El motivo es requerido.';
    if (formulario.motivo.length > 50) next.motivo = 'Maximo 50 caracteres.';
    if (formulario.observaciones.length > 80) next.observaciones = 'Maximo 80 caracteres.';
    setErrores(next);
    return Object.keys(next).length === 0;
  };

  const errorEstado = errores.estado;

  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      await onGuardar({
        id: registroEditar?.cod_inasistencias,
        payload: construirPayloadInasistencia(formulario),
      });
      onClose();
    } catch (error) {
      setErrores((prev) => ({
        ...prev,
        motivo: extraerMensajeValidacion(error, 'motivo_inasistencia') || prev.motivo,
        fecha: extraerMensajeValidacion(error, 'fecha_inasistencia') || prev.fecha,
        cod_empleado: extraerMensajeValidacion(error, 'cod_empleado') || prev.cod_empleado,
        observaciones: extraerMensajeValidacion(error, 'observaciones') || prev.observaciones,
        justificado: extraerMensajeValidacion(error, 'justificado') || prev.justificado,
      }));
      await alertaError('No se pudo guardar', error?.validation?.message || 'Revisa los campos.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      mostrar={mostrar}
      cerrar={onClose}
      titulo={registroEditar ? 'Editar Inasistencia' : 'Registrar Inasistencia'}
      classNameContenedor="inasistencia-modal"
      confirmarAlCerrar
    >
      <form className="inasistencia-form" onSubmit={manejarSubmit}>
        <section className="bloque-form bloque-paso-1">
          <h4>
            <span className="paso-numero paso-numero--paso1">1</span>Empleado y fecha
          </h4>
          <div className="inasistencia-step-grid">
            <div className="inasistencia-step-col">
              <div className="inasistencia-campo-codigo">
                <div className="inasistencia-codigo-label">CÓDIGO</div>
                <div className="inasistencia-codigo-valor">
                  {codigoUi} <span className="inasistencia-codigo-auto">(auto)</span>
                </div>
              </div>

              <label>
                <span>EMPLEADO *</span>
                {bloquearEmpleado ? (
                  <div className="inasistencia-emp-readonly">
                    {String(formulario.cod_empleado)} {nombreEmpleadoBloqueado}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Documento de identidad"
                      value={docEmpleado}
                      onChange={(e) => {
                        const doc = e.target.value.replace(/\D/g, '');
                        setDocEmpleado(doc);
                        const emp = empleados.find((x) => String(x.doc_iden ?? '').trim() === doc);
                        setFormulario((p) => ({
                          ...p,
                          cod_empleado: emp ? String(emp.cod_empleado) : '',
                        }));
                      }}
                    />
                    {formulario.cod_empleado ? (
                      <small className="inasistencia-hint-asistencia">
                        {[empleados.find((e) => String(e.cod_empleado) === String(formulario.cod_empleado))?.nombre_empleado,
                          empleados.find((e) => String(e.cod_empleado) === String(formulario.cod_empleado))?.apellidos_empleado]
                          .filter(Boolean)
                          .join(' ')}
                      </small>
                    ) : docEmpleado.trim().length >= 5 ? (
                      <small className="campo-seccion-error">No hay empleado con ese documento.</small>
                    ) : null}
                  </>
                )}
                {errores.cod_empleado ? <small className="campo-seccion-error">{errores.cod_empleado}</small> : null}
              </label>
            </div>

            <div className="inasistencia-step-col">
              <label>
                <span>FECHA *</span>
                <input
                  type="date"
                  value={formulario.fecha}
                  onChange={(e) => setFormulario((p) => ({ ...p, fecha: e.target.value }))}
                />
                {errores.fecha ? <small className="campo-seccion-error">{errores.fecha}</small> : null}
              </label>
            </div>
          </div>
        </section>

        <section className="bloque-form bloque-paso-2">
          <h4>
            <span className="paso-numero paso-numero--paso2">2</span>Tipo de registro
          </h4>

          <div className="inasistencia-micro-label">Novedad del día</div>
          <p className="inasistencia-hint-asistencia">
            Solo registras excepciones (ausencia, tardanza, día libre). Si no hay registro en un día, se entiende que
            asistió desde su fecha de ingreso al contrato.
          </p>

          <div className="inasistencia-estados">
            <button
              type="button"
              className={`chip-estado chip-ausente ${formulario.estado === ESTADO_UI.AUSENTE ? 'activo' : ''}`}
              onClick={() => setFormulario((p) => ({ ...p, estado: ESTADO_UI.AUSENTE }))}
            >
              <span className="chip-punto chip-punto--ausente" aria-hidden />
              Ausente
            </button>
            <button
              type="button"
              className={`chip-estado chip-tarde ${formulario.estado === ESTADO_UI.TARDE ? 'activo' : ''}`}
              onClick={() => setFormulario((p) => ({ ...p, estado: ESTADO_UI.TARDE }))}
            >
              <span className="chip-punto chip-punto--tarde" aria-hidden />
              Tardanza
            </button>
            <button
              type="button"
              className={`chip-estado chip-libre ${formulario.estado === ESTADO_UI.LIBRE ? 'activo' : ''}`}
              onClick={() => setFormulario((p) => ({ ...p, estado: ESTADO_UI.LIBRE }))}
            >
              <span className="chip-punto chip-punto--libre" aria-hidden />
              Libre
            </button>
          </div>
          {errorEstado ? <small className="campo-seccion-error inasistencia-error-estado">{errorEstado}</small> : null}

          <label className="inasistencia-label-motivo">
            <span>MOTIVO *</span>
            <input
              type="text"
              value={formulario.motivo}
              maxLength={50}
              onChange={(e) => setFormulario((p) => ({ ...p, motivo: e.target.value }))}
              placeholder="Escribe el motivo..."
            />
            <small className="contador-texto">{formulario.motivo.length}/50</small>
            {errores.motivo ? <small className="campo-seccion-error">{errores.motivo}</small> : null}
          </label>
        </section>

        <section className="bloque-form bloque-paso-3">
          <h4>
            <span className="paso-numero paso-numero--paso3">3</span>Justificación y notas
          </h4>

          <div className="inasistencia-justificacion-row">
            <div className="inasistencia-justificacion-text">
              {formulario.justificado ? '✓ Justificada' : 'x No justificada'}
            </div>

            <div className="toggle-ios">
              <label className="toggle-ios-switch">
                <input
                  type="checkbox"
                  checked={formulario.justificado}
                  onChange={(e) => setFormulario((p) => ({ ...p, justificado: e.target.checked }))}
                />
                <span className="toggle-ios-slider" />
              </label>
            </div>
          </div>

          {errores.justificado ? <small className="campo-seccion-error">{errores.justificado}</small> : null}

          <label className="inasistencia-label-observaciones">
            <span>OBSERVACIONES</span>
            <textarea
              value={formulario.observaciones}
              maxLength={80}
              onChange={(e) => setFormulario((p) => ({ ...p, observaciones: e.target.value }))}
              placeholder="Detalles adicionales..."
              rows={3}
            />
            <small className="contador-texto">{formulario.observaciones.length}/80</small>
            {errores.observaciones ? <small className="campo-seccion-error">{errores.observaciones}</small> : null}
          </label>
        </section>

        <div className="inasistencia-form-acciones">
          <BotonCancelarModal className="btn-secundario" disabled={guardando} />
          <button type="submit" className="btn-primario" disabled={guardando}>
            {guardando ? 'Guardando...' : registroEditar ? 'Actualizar' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalInasistencia;
