import { useState, useEffect, useMemo } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
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
  canonicalTipoApi,
  canonicalEstadoApi,
  ESTADO_INICIAL_AL_CREAR,
  MAX_MOTIVO_CHARS,
  MAX_DESCRIPCION_CHARS,
} from '../disciplinariasConstants';

/** Iconos tipo línea / mockup (SVG, no emoji). */
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
  if (icono === 'stop') {
    return (
      <svg className="disc-tipo-card-svg disc-tipo-card-svg--susp" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
        <circle cx="12" cy="12" r="9" {...stroke(1.35)} stroke="currentColor" />
        <line x1="7" y1="7" x2="17" y2="17" stroke="currentColor" {...stroke(1.35)} />
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

/** Días calendario inclusivos entre dos fechas YYYY-MM-DD. */
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

function ModalFormularioComunicacion({
  mostrar,
  cerrar,
  registroEditar,
  empleados = [],
  alExito,
}) {
  const esEdicion = registroEditar != null && codigoDisciplinarioDesde(registroEditar) != null;
  const codEdicion = esEdicion ? codigoDisciplinarioDesde(registroEditar) : null;

  const [tipoComunicacion, setTipoComunicacion] = useState('MEMORANDO');
  const [codEmpleado, setCodEmpleado] = useState('');
  const [docEmpleadoInput, setDocEmpleadoInput] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaIniSusp, setFechaIniSusp] = useState('');
  const [fechaFinSusp, setFechaFinSusp] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (!mostrar) return;
    setErrorGeneral('');
    if (esEdicion) {
      const r = normalizarRegistroComunicacion(registroEditar) ?? registroEditar;
      setTipoComunicacion(canonicalTipoApi(r.tipo_comunicacion));
      setCodEmpleado(r.cod_empleado != null ? String(r.cod_empleado) : '');
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

  const esSuspension = canonicalTipoApi(tipoComunicacion) === 'SUSPENSION';
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

  const construirPayload = () => {
    const tipo = canonicalTipoApi(tipoComunicacion);
    const reg = esEdicion ? (normalizarRegistroComunicacion(registroEditar) ?? registroEditar) : null;
    let estado = esEdicion ? canonicalEstadoApi(reg?.estado_comunicacion) : ESTADO_INICIAL_AL_CREAR;
    if (esEdicion && estado === 'BORRADOR') estado = ESTADO_INICIAL_AL_CREAR;
    const motivoCorto = motivo.trim().slice(0, MAX_MOTIVO_CHARS);
    const desc = descripcion.trim().slice(0, MAX_DESCRIPCION_CHARS);
    const codEmp = Number(codEmpleado);
    const payload = {
      tipo_comunicacion: tipo,
      fecha_emision: fechaEmision,
      fecha_inicio_suspension: esSuspension && fechaIniSusp ? fechaIniSusp : null,
      fecha_fin_suspension: esSuspension && fechaFinSusp ? fechaFinSusp : null,
      estado_comunicacion: estado,
      motivo_comunicacion: motivoCorto,
      descripcion: desc || null,
      dias_suspension: esSuspension ? diasSuspensionCalc : null,
      cod_empleado: codEmp,
    };
    return payload;
  };

  const validar = () => {
    if (!codEmpleado) return 'Indique un número de documento que corresponda a un empleado registrado.';
    if (!fechaEmision) return 'Indique la fecha de emisión.';
    if (!motivo.trim()) return 'El motivo es obligatorio.';
    if (esSuspension) {
      if (!fechaIniSusp || !fechaFinSusp) return 'Indique fecha de inicio y fin de la suspensión.';
      if (diasSuspensionCalc <= 0) return 'La fecha de fin debe ser igual o posterior a la de inicio.';
    }
    return null;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const v = validar();
    if (v) {
      setErrorGeneral(v);
      return;
    }
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
      setErrorGeneral(mensajeErrorApi(err));
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
    >
      <div className="disc-modal-subtitulo">Comunicaciones Disciplinarias · Talent Sphere</div>
      <form onSubmit={manejarSubmit} className="disc-form disc-form--layout">
        {errorGeneral ? (
          <div className="login-alerta login-alerta--error disc-form-alerta" role="alert">
            <p className="login-alerta-mensaje">{errorGeneral}</p>
          </div>
        ) : null}

        <section className="disc-seccion">
          <div className="disc-seccion-num">1</div>
          <div className="disc-seccion-body">
            <h3 className="disc-seccion-titulo">Tipo de documento</h3>
            <div className="disc-tipo-grid">
              {TIPOS_COMUNICACION.map((t) => {
                const activo = tipoComunicacion === t.api;
                return (
                  <button
                    key={t.api}
                    type="button"
                    className={`disc-tipo-card ${activo ? `disc-tipo-card--activo disc-tipo-card--${t.icono}` : ''}`}
                    onClick={() => setTipoComunicacion(t.api)}
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
                  }}
                  className="disc-input"
                  disabled={esEdicion}
                  placeholder="Número de documento"
                  autoComplete="off"
                />
              </label>
              {nombreEmpleadoMostrado ? (
                <div className="disc-field disc-field--full">
                  <span className="disc-field-label">Nombre del empleado</span>
                  <p className="disc-field-readonly disc-doc-nombre-resuelto">{nombreEmpleadoMostrado}</p>
                </div>
              ) : null}
              {!esEdicion && docEmpleadoInput.trim() && !codEmpleado ? (
                <p className="disc-doc-aviso disc-doc-aviso--alerta disc-field--full">
                  No hay empleado registrado con ese documento.
                </p>
              ) : null}
              <label className="disc-field disc-field--full disc-field-fecha-emision">
                <span className="disc-field-label">Fecha emisión</span>
                <input
                  type="date"
                  value={fechaEmision}
                  onChange={(e) => setFechaEmision(e.target.value)}
                  className="disc-input"
                />
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
                {esFelicitacion ? 'Motivo del reconocimiento *' : 'Motivo *'}{' '}
                <small className="disc-hint">(máx. {MAX_MOTIVO_CHARS} caracteres en API)</small>
              </span>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value.slice(0, MAX_MOTIVO_CHARS))}
                maxLength={MAX_MOTIVO_CHARS}
                placeholder={esFelicitacion ? 'Ej: Excelente desempeño' : 'Razón resumida…'}
                className="disc-input"
              />
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
              <span className="disc-counter disc-counter--textarea">{descripcion.length}/{MAX_DESCRIPCION_CHARS}</span>
            </label>
            {esSuspension ? (
              <div className="disc-suspension-box">
                <div className="disc-grid-2">
                  <label className="disc-field">
                    <span className="disc-field-label">Inicio suspensión *</span>
                    <input
                      type="date"
                      value={fechaIniSusp}
                      onChange={(e) => setFechaIniSusp(e.target.value)}
                      className="disc-input"
                    />
                  </label>
                  <label className="disc-field">
                    <span className="disc-field-label">Fin suspensión *</span>
                    <input
                      type="date"
                      value={fechaFinSusp}
                      onChange={(e) => setFechaFinSusp(e.target.value)}
                      className="disc-input"
                    />
                  </label>
                </div>
                <div className="disc-field disc-field--full">
                  <span className="disc-field-label">Días de suspensión</span>
                  <p className="disc-field-readonly disc-dias-susp-calc">
                    {fechaIniSusp && fechaFinSusp && diasSuspensionCalc > 0
                      ? `${diasSuspensionCalc} día${diasSuspensionCalc !== 1 ? 's' : ''} sin goce de salario (calculado con las fechas)`
                      : fechaIniSusp && fechaFinSusp
                        ? 'Ajuste las fechas: la fin debe ser igual o posterior al inicio.'
                        : 'Complete inicio y fin para calcular los días automáticamente.'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="modal-acciones disc-form-acciones">
          <button type="button" className="btn-cancelar" onClick={cerrar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar disc-btn-crear" disabled={enviando}>
            {enviando ? 'Guardando…' : esEdicion ? 'Actualizar documento' : 'Crear documento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalFormularioComunicacion;
