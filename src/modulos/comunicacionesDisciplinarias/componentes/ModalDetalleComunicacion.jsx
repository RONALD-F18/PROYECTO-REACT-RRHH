import { useState, useEffect, useCallback } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import { alertaErrorApi, confirmarEliminacion } from '../../../utils/alertasSwal';
import {
  getComunicacionDisciplinariaById,
  patchComunicacionDisciplinaria,
  deleteComunicacionDisciplinaria,
  normalizarRegistroComunicacion,
  codigoDisciplinarioDesde,
} from '../../../services/comunicacionesDisciplinarias';
import { nombreCompletoEmpleado } from '../../../services/empleados';
import {
  etiquetaTipo,
  etiquetaEstado,
  radicadoDesdeCod,
  canonicalEstadoApi,
  ESTADOS_COMUNICACION,
} from '../disciplinariasConstants';

function formatearFechaMostrar(iso) {
  if (!iso) return '—';
  const t = String(iso).trim().slice(0, 10);
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return t;
}

function nombreEmpleadoDesdeRegistro(r) {
  const emp = r?.empleado && typeof r.empleado === 'object' ? r.empleado : null;
  if (emp) return nombreCompletoEmpleado(emp);
  return r?._nombreEmpleado ?? '—';
}

function cargoEmpleadoDesdeRegistro(r) {
  const emp = r?.empleado && typeof r.empleado === 'object' ? r.empleado : null;
  if (emp) {
    return emp.nomb_cargo ?? emp.nombre_cargo ?? emp.cargo?.nombre_cargo ?? emp.cargo?.nomb_cargo ?? '—';
  }
  return r?._cargoEmpleado ?? '—';
}

function docEmpleadoDesdeRegistro(r) {
  const emp = r?.empleado && typeof r.empleado === 'object' ? r.empleado : null;
  if (emp?.doc_iden) return String(emp.doc_iden);
  return r?._docEmpleado ?? '—';
}

function nombreEmisorDesdeRegistro(r) {
  const u = r?.usuario && typeof r.usuario === 'object' ? r.usuario : null;
  if (u) return String(u.nombre_usuario ?? u.nombre ?? '—');
  return r?._nombreEmisor ?? '—';
}

function ModalDetalleComunicacion({ mostrar, cerrar, vistaFallback, onActualizado, onEditar, onEliminado }) {
  const cod = vistaFallback ? codigoDisciplinarioDesde(vistaFallback) : null;
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const fusionar = useCallback(
    (apiRow) => {
      if (!apiRow) return null;
      if (vistaFallback && typeof vistaFallback === 'object') {
        return { ...vistaFallback, ...apiRow };
      }
      return apiRow;
    },
    [vistaFallback],
  );

  const cargar = useCallback(async () => {
    if (!cod) return;
    setErrorCarga('');
    setCargando(true);
    try {
      const raw = await getComunicacionDisciplinariaById(cod);
      const d = normalizarRegistroComunicacion(raw) ?? raw?.data ?? raw;
      setDetalle(fusionar(d));
    } catch (e) {
      setDetalle(vistaFallback ? fusionar(vistaFallback) : null);
      setErrorCarga(mensajeErrorApi(e));
    } finally {
      setCargando(false);
    }
  }, [cod, fusionar, vistaFallback]);

  useEffect(() => {
    if (!mostrar || !cod) {
      setDetalle(null);
      return;
    }
    cargar();
  }, [mostrar, cod, cargar]);

  const r = detalle;
  const radicado = r ? radicadoDesdeCod(codigoDisciplinarioDesde(r)) : '';
  const tipoTxt = r ? etiquetaTipo(r.tipo_comunicacion) : '';
  const estadoApi = r ? canonicalEstadoApi(r.estado_comunicacion) : 'EMITIDO';
  const idxEstadoPaso =
    estadoApi === 'NOTIFICADO' ? 1 : estadoApi === 'EMITIDO' ? 0 : -1;

  const manejarCambiarEstado = async (nuevoApi) => {
    if (!r || cod == null) return;
    setActualizandoEstado(true);
    try {
      await patchComunicacionDisciplinaria(cod, { estado_comunicacion: nuevoApi });
      setDetalle((prev) => (prev ? { ...prev, estado_comunicacion: nuevoApi } : prev));
      await onActualizado?.();
    } catch (e) {
      void alertaErrorApi('No se pudo actualizar el estado', e);
    } finally {
      setActualizandoEstado(false);
    }
  };

  const manejarEliminar = async () => {
    if (!cod) return;
    const ok = await confirmarEliminacion({ titulo: '¿Eliminar este documento disciplinario?' });
    if (!ok) return;
    try {
      await deleteComunicacionDisciplinaria(cod);
      await onEliminado?.();
      cerrar();
    } catch (e) {
      void alertaErrorApi('No se pudo eliminar el documento', e);
    }
  };

  if (!mostrar) return null;

  return (
    <Modal
      mostrar={mostrar}
      cerrar={cerrar}
      titulo={r ? `${radicado} — ${tipoTxt}` : 'Detalle'}
      classNameContenedor="modal-contenido--disciplinario-detalle"
    >
      <div className="disc-detalle-body">
        {cargando && !r ? <p className="contrato-pagina-cargando">Cargando…</p> : null}
        {errorCarga && !r ? <p className="login-alerta-mensaje">{errorCarga}</p> : null}
        {r ? (
          <>
            <div className="disc-stepper disc-stepper--dos" role="tablist" aria-label="Estado del documento">
              {ESTADOS_COMUNICACION.map((s, idxPaso) => {
                const completado = idxEstadoPaso > idxPaso;
                const activo =
                  idxEstadoPaso === idxPaso || (idxEstadoPaso === -1 && idxPaso === 0);
                return (
                  <button
                    key={s.api}
                    type="button"
                    className={`disc-step ${activo ? 'disc-step--activo' : ''} ${completado ? 'disc-step--completado' : ''}`}
                    disabled={actualizandoEstado}
                    onClick={() => manejarCambiarEstado(s.api)}
                  >
                    {s.etiqueta}
                  </button>
                );
              })}
            </div>
            <p className="disc-stepper-hint">
              Marca como notificado cuando el empleado haya recibido el documento.
            </p>

            <div className="disc-paper">
              <div className="disc-paper-banner">
                <strong>Talent Sphere S.A.S</strong>
                <span>Gestión de recursos humanos · NIT: 900.123.456-7</span>
              </div>
              <h2 className="disc-paper-tipo">{String(r.tipo_comunicacion || tipoTxt).toUpperCase()}</h2>
              <p className="disc-paper-radicado">Radicado {radicado}</p>
              <div className="disc-paper-meta">
                <div>
                  <span className="disc-paper-meta-label">Fecha de emisión</span>
                  <strong>{formatearFechaMostrar(r.fecha_emision)}</strong>
                </div>
                <div className="disc-paper-meta-lugar">Bogotá D.C., Colombia</div>
              </div>

              <div className="disc-paper-bloque">
                <h4>Dirigido a</h4>
                <p className="disc-paper-dirigido">
                  <strong>{nombreEmpleadoDesdeRegistro(r)}</strong>
                  <span>
                    {cargoEmpleadoDesdeRegistro(r)} — C.C. {docEmpleadoDesdeRegistro(r)}
                  </span>
                </p>
              </div>

              <div className="disc-paper-bloque disc-paper-bloque--motivo">
                <h4>Motivo</h4>
                <p>{r.motivo_comunicacion ?? '—'}</p>
              </div>

              <div className="disc-paper-bloque">
                <h4>Descripción del caso</h4>
                <p className="disc-paper-desc">{r.descripcion?.trim() ? r.descripcion : '—'}</p>
              </div>

              {r.dias_suspension != null && Number(r.dias_suspension) > 0 ? (
                <div className="disc-paper-susp">
                  <strong>{r.dias_suspension}</strong> días de suspensión
                  {r.fecha_inicio_suspension ? (
                    <span>
                      {' '}
                      ({formatearFechaMostrar(r.fecha_inicio_suspension)} —{' '}
                      {formatearFechaMostrar(r.fecha_fin_suspension)})
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="disc-paper-nota">
                <strong>Nota importante</strong>
                <p>
                  El trabajador tiene derecho a presentar descargos o defensas dentro de los cinco (5) días hábiles
                  siguientes a la notificación, conforme al Código Sustantivo del Trabajo.
                </p>
              </div>

              <div className="disc-paper-firmas">
                <div>
                  <div className="disc-paper-firma-linea" />
                  <p className="disc-paper-firma-nombre">{nombreEmisorDesdeRegistro(r)}</p>
                  <span className="disc-paper-firma-rol">Quien emite · Firma y sello</span>
                </div>
                <div>
                  <div className="disc-paper-firma-linea" />
                  <p className="disc-paper-firma-nombre">{nombreEmpleadoDesdeRegistro(r)}</p>
                  <span className="disc-paper-firma-rol">Empleado · Firma de recibido</span>
                </div>
              </div>

              <footer className="disc-paper-footer">
                <span>Documento generado por Talent Sphere</span>
                <span>{radicado}</span>
              </footer>
            </div>

            <div className="disc-detalle-acciones">
              <span className="disc-detalle-estado-texto">
                Estado actual: <strong>{etiquetaEstado(r.estado_comunicacion)}</strong>
              </span>
              <div className="disc-detalle-botones">
                <button type="button" className="btn-cancelar" onClick={cerrar}>
                  Cerrar
                </button>
                {onEditar ? (
                  <button
                    type="button"
                    className="btn-guardar"
                    onClick={() => {
                      cerrar();
                      onEditar(r);
                    }}
                  >
                    Editar
                  </button>
                ) : null}
                <button type="button" className="disc-btn-peligro" onClick={manejarEliminar}>
                  Eliminar
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}

export default ModalDetalleComunicacion;
