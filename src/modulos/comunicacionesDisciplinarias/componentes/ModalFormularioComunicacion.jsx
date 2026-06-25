import { useState, useEffect, useMemo } from 'react';
import Modal, { BotonCancelarModal } from '../../../componentes/comunes/Modal';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import { alertaError } from '../../../utils/alertasSwal';
import {
  createComunicacionDisciplinaria,
  updateComunicacionDisciplinaria,
  normalizarRegistroComunicacion,
  codigoDisciplinarioDesde,
} from '../../../services/comunicacionesDisciplinarias';
import {
  buscarEmpleadoPorDocumento,
  codigoEmpleadoDesde,
  nombreCompletoEmpleado,
} from '../../../services/empleados';
import {
  TIPOS_COMUNICACION,
  ESTADOS_FORMULARIO,
  canonicalTipoApi,
  canonicalEstadoApi,
  esMemorandoConSuspension,
  ESTADO_INICIAL_AL_CREAR,
  MAX_MOTIVO_CHARS,
  MAX_DESCRIPCION_CHARS,
} from '../disciplinariasConstants';

function IconoTipoDoc({ icono, activo }) {
  const stroke = (w) => ({ fill: 'none', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' });
  if (icono === 'memo') {
    return (
      <svg className="disc-tipo-card-svg" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
        <path
          {...stroke(1.35)}
          stroke="currentColor"
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        />
        <polyline {...stroke(1.35)} stroke="currentColor" points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" {...stroke(1.35)} />
        <line x1="9" y1="17" x2="13" y2="17" stroke="currentColor" {...stroke(1.35)} />
      </svg>
    );
  }
  if (icono === 'chat') {
    return (
      <svg className="disc-tipo-card-svg" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
        <circle cx="9" cy="8" r="2.75" {...stroke(1.35)} stroke="currentColor" />
        <path
          {...stroke(1.35)}
          stroke="currentColor"
          d="M5.5 20v-.5a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v.5"
        />
        <path {...stroke(1.25)} stroke="currentColor" d="M15.5 10.5c1.8.6 2.8 2 3 4" />
        <path {...stroke(1.25)} stroke="currentColor" d="M17 8.5c2.2.8 3.2 2.8 3.2 5.2" />
      </svg>
    );
  }
  if (icono === 'star') {
    return (
      <svg
        className={`disc-tipo-card-svg disc-tipo-card-svg--star${activo ? ' disc-tipo-card-svg--star-on' : ''}`}
        viewBox="0 0 24 24"
        width="32"
        height="32"
        aria-hidden
      >
        <path
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
          d="M12 2.5l2.8 6.9h7.4l-6 4.6 2.3 7-6.5-4.7-6.5 4.7 2.3-7-6-4.6h7.4L12 2.5z"
          fill={activo ? '#eab308' : 'none'}
        />
      </svg>
    );
  }
  return null;
}

function diasSuspensionEntreFechas(isoIni, isoFin) {
  if (!isoIni || !isoFin) return 0;
  const p = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const t0 = p(isoIni);
  const t1 = p(isoFin);
  if (t1 < t0) return 0;
  return Math.floor((t1 - t0) / 86400000) + 1;
}

function MensajeCampo({ mensaje }) {
  if (!mensaje) return null;
  return (
    <span className="disc-field-error" role="alert">
      {mensaje}
    </span>
  );
}

const ETIQUETAS_ERROR = {
  docEmpleado: 'Documento del empleado',
  fechaEmision: 'Fecha de emisión',
  motivo: 'Motivo',
  fechaIniSusp: 'Inicio de suspensión',
  fechaFinSusp: 'Fin de suspensión',
  diasSuspension: 'Días de suspensión',
};

function ModalFormularioComunicacion({ mostrar, cerrar, registroEditar, empleados = [], alExito }) {
  const esEdicion = registroEditar != null && codigoDisciplinarioDesde(registroEditar) != null;
  const codEdicion = esEdicion ? codigoDisciplinarioDesde(registroEditar) : null;

  const [tipoComunicacion, setTipoComunicacion] = useState('MEMORANDO');
  const [codEmpleado, setCodEmpleado] = useState('');
  const [docEmpleadoInput, setDocEmpleadoInput] = useState('');
  const [estadoForm, setEstadoForm] = useState('BORRADOR');
  const [fechaEmision, setFechaEmision] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaIniSusp, setFechaIniSusp] = useState('');
  const [fechaFinSusp, setFechaFinSusp] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);

  useEffect(() => {
    if (!mostrar) return;
    setErrores({});
    setIntentoEnvio(false);
    if (esEdicion) {
      const r = normalizarRegistroComunicacion(registroEditar) ?? registroEditar;
      setTipoComunicacion(canonicalTipoApi(r.tipo_comunicacion));
      setCodEmpleado(r.cod_empleado != null ? String(r.cod_empleado) : '');
      const est = canonicalEstadoApi(r.estado_comunicacion);
      setEstadoForm(est === 'NOTIFICADO' ? 'NOTIFICADO' : est === 'EMITIDO' ? 'EMITIDO' : 'BORRADOR');
      setFechaEmision(r.fecha_emision ? String(r.fecha_emision).slice(0, 10) : '');
      setMotivo(r.motivo_comunicacion != null ? String(r.motivo_comunicacion) : '');
      setDescripcion(r.descripcion != null ? String(r.descripcion) : '');
      setFechaIniSusp(r.fecha_inicio_suspension ? String(r.fecha_inicio_suspension).slice(0, 10) : '');
      setFechaFinSusp(r.fecha_fin_suspension ? String(r.fecha_fin_suspension).slice(0, 10) : '');
    } else {
      const hoy = new Date().toISOString().slice(0, 10);
      setTipoComunicacion('MEMORANDO');
      setCodEmpleado('');
      setDocEmpleadoInput('');
      setEstadoForm('BORRADOR');
      setFechaEmision(hoy);
      setMotivo('');
      setDescripcion('');
      setFechaIniSusp('');
      setFechaFinSusp('');
    }
  }, [mostrar, registroEditar, esEdicion]);

  useEffect(() => {
    if (!mostrar || !esEdicion || !codEmpleado) return;
    const emp = empleados.find((e) => String(codigoEmpleadoDesde(e)) === String(codEmpleado));
    if (emp?.doc_iden != null) setDocEmpleadoInput(String(emp.doc_iden).trim());
  }, [mostrar, esEdicion, codEmpleado, empleados]);

  const esMemorando = esMemorandoConSuspension(tipoComunicacion);
  const esFelicitacion = canonicalTipoApi(tipoComunicacion) === 'FELICITACION';

  const diasSuspensionCalc = useMemo(
    () => diasSuspensionEntreFechas(fechaIniSusp, fechaFinSusp),
    [fechaIniSusp, fechaFinSusp],
  );

  const empleadoResuelto = useMemo(() => {
    if (!codEmpleado) return null;
    return empleados.find((e) => String(codigoEmpleadoDesde(e)) === String(codEmpleado)) ?? null;
  }, [codEmpleado, empleados]);

  const nombreEmpleadoMostrado = empleadoResuelto ? nombreCompletoEmpleado(empleadoResuelto) : '';

  const limpiarError = (campo) => {
    if (!errores[campo]) return;
    setErrores((prev) => {
      const next = { ...prev };
      delete next[campo];
      return next;
    });
  };

  const estadoApiDesdeForm = (est) => {
    const c = canonicalEstadoApi(est);
    if (c === 'BORRADOR') return ESTADO_INICIAL_AL_CREAR;
    return c;
  };

  const construirPayload = () => {
    const tipo = canonicalTipoApi(tipoComunicacion);
    const motivoCorto = motivo.trim().slice(0, MAX_MOTIVO_CHARS);
    const desc = descripcion.trim().slice(0, MAX_DESCRIPCION_CHARS);
    const codEmp = Number(codEmpleado);
    return {
      tipo_comunicacion: tipo,
      fecha_emision: fechaEmision,
      fecha_inicio_suspension: esMemorando && fechaIniSusp ? fechaIniSusp : null,
      fecha_fin_suspension: esMemorando && fechaFinSusp ? fechaFinSusp : null,
      estado_comunicacion: estadoApiDesdeForm(estadoForm),
      motivo_comunicacion: motivoCorto,
      descripcion: desc || null,
      dias_suspension: esMemorando && diasSuspensionCalc > 0 ? diasSuspensionCalc : null,
      cod_empleado: codEmp,
    };
  };

  const validar = () => {
    const next = {};
    const doc = docEmpleadoInput.trim();
    if (!doc) {
      next.docEmpleado = 'Indique el número de documento del empleado.';
    } else if (!codEmpleado) {
      next.docEmpleado = 'No hay empleado registrado con ese documento.';
    }
    if (!fechaEmision) next.fechaEmision = 'Indique la fecha de emisión.';
    if (!motivo.trim()) next.motivo = 'El motivo es obligatorio.';
    if (esMemorando) {
      if (!fechaIniSusp) next.fechaIniSusp = 'Indique la fecha de inicio de la suspensión.';
      if (!fechaFinSusp) next.fechaFinSusp = 'Indique la fecha de fin de la suspensión.';
      if (fechaIniSusp && fechaFinSusp && diasSuspensionCalc < 1) {
        next.diasSuspension =
          diasSuspensionCalc <= 0
            ? 'La fecha de fin debe ser igual o posterior a la de inicio.'
            : 'El memorando debe incluir al menos 1 día de suspensión.';
      }
    }
    return next;
  };

  const clavesErrores = Object.keys(errores);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setIntentoEnvio(true);
    const v = validar();
    setErrores(v);
    if (Object.keys(v).length > 0) return;

    const payload = construirPayload();
    setEnviando(true);
    try {
      if (esEdicion && codEdicion != null) {
        await updateComunicacionDisciplinaria(codEdicion, payload);
        await alExito?.('actualizado');
      } else {
        await createComunicacionDisciplinaria(payload);
        await alExito?.('creado');
      }
      cerrar();
    } catch (err) {
      void alertaError('No se pudo guardar', mensajeErrorApi(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      mostrar={mostrar}
      cerrar={cerrar}
      titulo={esEdicion ? 'Editar documento disciplinario' : 'Nuevo documento disciplinario'}
      classNameContenedor="modal-contenido--disciplinario-form"
      confirmarAlCerrar
    >
      <form onSubmit={manejarSubmit} className="disc-form disc-form--layout" noValidate>
        <section className="disc-seccion">
          <div className="disc-seccion-num">1</div>
          <div className="disc-seccion-body">
            <h3 className="disc-seccion-titulo">Tipo de documento</h3>
            <div className="disc-tipo-grid disc-tipo-grid--tres">
              {TIPOS_COMUNICACION.map((t) => {
                const activo = tipoComunicacion === t.api;
                return (
                  <button
                    key={t.api}
                    type="button"
                    className={`disc-tipo-card ${activo ? `disc-tipo-card--activo disc-tipo-card--${t.icono}` : ''}`}
                    onClick={() => {
                      setTipoComunicacion(t.api);
                      limpiarError('fechaIniSusp');
                      limpiarError('fechaFinSusp');
                      limpiarError('diasSuspension');
                    }}
                  >
                    <span className="disc-tipo-card-icon-wrap">
                      <IconoTipoDoc icono={t.icono} activo={activo} />
                    </span>
                    <span className="disc-tipo-card-text">{t.etiqueta}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="disc-seccion">
          <div className="disc-seccion-num">2</div>
          <div className="disc-seccion-body">
            <h3 className="disc-seccion-titulo">Personas involucradas</h3>
            <div className="disc-grid-2 disc-grid-personas">
              <label className="disc-field disc-field--full">
                <span className="disc-field-label">Documento del empleado *</span>
                <input
                  type="text"
                  value={docEmpleadoInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDocEmpleadoInput(v);
                    const emp = buscarEmpleadoPorDocumento(empleados, v);
                    const c = emp ? codigoEmpleadoDesde(emp) : null;
                    setCodEmpleado(c != null ? String(c) : '');
                    limpiarError('docEmpleado');
                  }}
                  className={`disc-input${errores.docEmpleado ? ' disc-input--error' : ''}`}
                  disabled={esEdicion}
                  placeholder="Número de documento"
                  autoComplete="off"
                />
                <MensajeCampo mensaje={errores.docEmpleado} />
              </label>
              {nombreEmpleadoMostrado ? (
                <div className="disc-field disc-field--full">
                  <span className="disc-field-label">Nombre del empleado</span>
                  <p className="disc-field-readonly disc-doc-nombre-resuelto">{nombreEmpleadoMostrado}</p>
                </div>
              ) : null}
              <label className="disc-field">
                <span className="disc-field-label">Fecha emisión *</span>
                <input
                  type="date"
                  value={fechaEmision}
                  onChange={(e) => {
                    setFechaEmision(e.target.value);
                    limpiarError('fechaEmision');
                  }}
                  className={`disc-input${errores.fechaEmision ? ' disc-input--error' : ''}`}
                />
                <MensajeCampo mensaje={errores.fechaEmision} />
              </label>
              <label className="disc-field">
                <span className="disc-field-label">Estado</span>
                <select
                  value={estadoForm}
                  onChange={(e) => setEstadoForm(e.target.value)}
                  className="disc-select"
                >
                  {ESTADOS_FORMULARIO.map((s) => (
                    <option key={s.api} value={s.api}>
                      {s.etiqueta}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="disc-seccion">
          <div className="disc-seccion-num">3</div>
          <div className="disc-seccion-body">
            <h3 className="disc-seccion-titulo">
              {esFelicitacion ? 'Contenido del reconocimiento' : 'Contenido del documento'}
            </h3>
            {esFelicitacion ? (
              <div className="disc-banner disc-banner--feli">
                <p>Completa el motivo del reconocimiento y una descripción del logro.</p>
              </div>
            ) : null}
            <label className="disc-field disc-field--full">
              <span className="disc-field-label">
                {esFelicitacion ? 'Motivo del reconocimiento *' : 'Motivo *'}
              </span>
              <input
                type="text"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value.slice(0, MAX_MOTIVO_CHARS));
                  limpiarError('motivo');
                }}
                maxLength={MAX_MOTIVO_CHARS}
                placeholder={esFelicitacion ? 'Ej: Excelente desempeño en proyecto…' : 'Razón resumida…'}
                className={`disc-input${errores.motivo ? ' disc-input--error' : ''}`}
              />
              <MensajeCampo mensaje={errores.motivo} />
              <span className="disc-counter">
                {motivo.length}/{MAX_MOTIVO_CHARS}
              </span>
            </label>
            <label className="disc-field disc-field--full">
              <span className="disc-field-label">
                {esFelicitacion ? 'Descripción del logro' : 'Descripción detallada'}
              </span>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION_CHARS))}
                rows={5}
                maxLength={MAX_DESCRIPCION_CHARS}
                placeholder={
                  esFelicitacion
                    ? 'Detalla el logro o comportamiento a reconocer…'
                    : 'Describe el caso con detalle…'
                }
                className="disc-textarea"
              />
              <span className="disc-counter disc-counter--textarea">
                {descripcion.length}/{MAX_DESCRIPCION_CHARS}
              </span>
            </label>
          </div>
        </section>

        {esMemorando ? (
          <section className="disc-seccion disc-seccion--susp">
            <div className="disc-seccion-num">4</div>
            <div className="disc-seccion-body">
              <h3 className="disc-seccion-titulo">Días de suspensión *</h3>
              <div className={`disc-suspension-box${errores.diasSuspension ? ' disc-suspension-box--error' : ''}`}>
                <div className="disc-dias-wrap disc-dias-wrap--destacado">
                  <span className="disc-dias-grande" aria-live="polite">
                    {diasSuspensionCalc}
                  </span>
                  <span className="disc-dias-sufijo">días sin goce de salario</span>
                </div>
                <MensajeCampo mensaje={errores.diasSuspension} />
                <div className="disc-grid-2 disc-grid-susp-fechas">
                  <label className="disc-field">
                    <span className="disc-field-label">Inicio suspensión *</span>
                    <input
                      type="date"
                      value={fechaIniSusp}
                      onChange={(e) => {
                        setFechaIniSusp(e.target.value);
                        limpiarError('fechaIniSusp');
                        limpiarError('diasSuspension');
                      }}
                      className={`disc-input${errores.fechaIniSusp ? ' disc-input--error' : ''}`}
                    />
                    <MensajeCampo mensaje={errores.fechaIniSusp} />
                  </label>
                  <label className="disc-field">
                    <span className="disc-field-label">Fin suspensión *</span>
                    <input
                      type="date"
                      value={fechaFinSusp}
                      onChange={(e) => {
                        setFechaFinSusp(e.target.value);
                        limpiarError('fechaFinSusp');
                        limpiarError('diasSuspension');
                      }}
                      className={`disc-input${errores.fechaFinSusp ? ' disc-input--error' : ''}`}
                    />
                    <MensajeCampo mensaje={errores.fechaFinSusp} />
                  </label>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {intentoEnvio && clavesErrores.length > 0 ? (
          <div className="disc-form-errores-resumen" role="alert">
            <p className="disc-form-errores-resumen-titulo">Complete los campos pendientes:</p>
            <ul className="disc-form-errores-lista">
              {clavesErrores.map((k) => (
                <li key={k}>
                  <strong>{ETIQUETAS_ERROR[k] ?? k}:</strong> {errores[k]}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="modal-acciones disc-form-acciones">
          <BotonCancelarModal className="btn-cancelar" disabled={enviando} />
          <button type="submit" className="btn-guardar disc-btn-crear" disabled={enviando}>
            {enviando ? 'Guardando…' : esEdicion ? 'Actualizar documento' : 'Crear documento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalFormularioComunicacion;
