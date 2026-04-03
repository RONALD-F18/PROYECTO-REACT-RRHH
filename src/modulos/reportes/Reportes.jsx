import { useMemo, useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo, Modal, SinDatos } from '../../componentes';
import { generateGeneralReport } from '../../services/api/reportesApi';
import { confirmarAccion } from '../../utils/alertas';
import '../../estilos/modulos/reportes.css';

const MODULOS = [
  { value: 'empleados', label: 'Empleados', descripcion: 'Estados y encargados' },
  { value: 'contratos', label: 'Contratos', descripcion: 'Vigentes y terminados' },
  { value: 'prestaciones', label: 'Prestaciones', descripcion: 'Cesantias, prima, vacaciones' },
  { value: 'incapacidades', label: 'Incapacidades', descripcion: 'Dias, costo y entidad' },
  { value: 'inasistencias', label: 'Inasistencias', descripcion: 'Justificadas, injustificadas' },
  { value: 'afiliaciones', label: 'Afiliaciones', descripcion: 'EPS, ARL, pensiones' },
  { value: 'disciplinario', label: 'Disciplinario', descripcion: 'Comunicaciones y sanciones' },
];

function estadoLabel(status) {
  if (status === 401) return 'Sesion expirada. Inicia sesion de nuevo.';
  if (status === 403) return 'No tienes permisos para generar reportes.';
  if (status === 500) return 'Error del servidor al generar el reporte.';
  return '';
}

const HISTORIAL_KEY = 'reportes_historial_sesion_v2';

function moduloData(value) {
  return MODULOS.find((m) => m.value === value) || MODULOS[0];
}

function historialInicial() {
  try {
    const raw = sessionStorage.getItem(HISTORIAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistirHistorial(items) {
  try {
    sessionStorage.setItem(HISTORIAL_KEY, JSON.stringify(items.slice(0, 30)));
  } catch {
    // ignore
  }
}

function fechaHoraCorta(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function ymdDesdeIso(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Mismos trazos que Certificaciones, escala compacta en registro. */
function IconoDocumentoReporte() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconoBasuraReporte() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconoEsperaReporte() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="6" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="18" cy="12" r="1.75" />
    </svg>
  );
}

function Reportes() {
  const [moduloSeleccionado, setModuloSeleccionado] = useState('empleados');
  const [descripcion, setDescripcion] = useState('');
  const [pasoModal, setPasoModal] = useState(0); // 0 cerrado, 1 seleccion modulo, 2 confirmar
  const [errores, setErrores] = useState({});
  const [errorGlobal, setErrorGlobal] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoRegistroId, setCargandoRegistroId] = useState('');
  const [filtroRegistro, setFiltroRegistro] = useState({ modulo: '', fecha: '' });
  const [historial, setHistorial] = useState(() => historialInicial());

  const moduloOptions = useMemo(() => MODULOS, []);

  const kpis = useMemo(() => {
    const total = historial.length;
    const generados = historial.filter((x) => x.estado === 'Generado').length;
    const fallidos = historial.filter((x) => x.estado !== 'Generado').length;
    const ahora = new Date();
    const esteMes = historial.filter((x) => {
      const d = new Date(x.fecha);
      return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
    }).length;
    return { total, generados, fallidos, esteMes };
  }, [historial]);

  const historialFiltrado = useMemo(() => {
    return historial.filter((item) => {
      if (filtroRegistro.modulo && item.modulo !== filtroRegistro.modulo) return false;
      const ymd = ymdDesdeIso(item.fecha);
      if (!ymd) return true;
      if (filtroRegistro.fechaDesde && ymd < filtroRegistro.fechaDesde) return false;
      if (filtroRegistro.fechaHasta && ymd > filtroRegistro.fechaHasta) return false;
      return true;
    });
  }, [historial, filtroRegistro.fechaDesde, filtroRegistro.fechaHasta, filtroRegistro.modulo]);

  const validar = () => {
    const next = {};
    if (!moduloSeleccionado) next.modulo = 'Selecciona un modulo.';
    if (String(descripcion || '').length > 150) {
      next['params.descripcion'] = 'Maximo 150 caracteres.';
    }
    return next;
  };

  const construirPayload = () => {
    const texto = String(descripcion || '').trim();
    return texto
      ? { modulo: moduloSeleccionado, tipo: 'general', params: { descripcion: texto } }
      : { modulo: moduloSeleccionado, tipo: 'general', params: {} };
  };

  const abrirBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  };

  const descargarBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  };

  const guardarEvento = (estado) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      fecha: new Date().toISOString(),
      modulo: moduloSeleccionado,
      tipo: 'general',
      estado,
      descripcion: String(descripcion || '').trim(),
    };
    setHistorial((prev) => {
      const next = [item, ...prev].slice(0, 30);
      persistirHistorial(next);
      return next;
    });
  };

  const eliminarEventoHistorial = async (id) => {
    const ok = await confirmarAccion({
      titulo: 'Eliminar registro',
      texto: 'Se eliminará este registro del historial local.',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!ok) return;
    setHistorial((prev) => {
      const next = prev.filter((x) => x.id !== id);
      persistirHistorial(next);
      return next;
    });
  };

  const redescargarPdfRegistro = async (item) => {
    setErrorGlobal('');
    setExito('');
    setCargandoRegistroId(item.id);
    try {
      const payload = item.descripcion
        ? { modulo: item.modulo, tipo: 'general', params: { descripcion: item.descripcion } }
        : { modulo: item.modulo, tipo: 'general', params: {} };
      const { blob, filename } = await generateGeneralReport(payload);
      descargarBlob(blob, filename);
      setExito(`PDF descargado de nuevo para ${moduloData(item.modulo).label}.`);
    } catch (error) {
      const status = error?.response?.status;
      setErrorGlobal(
        error?.validation?.message ||
          error?.response?.data?.message ||
          estadoLabel(status) ||
          error?.message ||
          'No se pudo generar el reporte.',
      );
    } finally {
      setCargandoRegistroId('');
    }
  };

  const abrirFlujo = () => {
    setErrores({});
    setErrorGlobal('');
    setExito('');
    setPasoModal(1);
  };

  const cerrarFlujo = () => {
    if (cargando) return;
    setPasoModal(0);
  };

  const onGenerar = async (e) => {
    e.preventDefault();
    const nextErrores = validar();
    setErrores(nextErrores);
    setErrorGlobal('');
    setExito('');
    if (Object.keys(nextErrores).length) return;

    setCargando(true);
    const payload = construirPayload();
    try {
      const { blob, filename } = await generateGeneralReport(payload);
      abrirBlob(blob, filename);
      setExito(`Reporte generado correctamente para ${moduloData(payload.modulo).label}.`);
      guardarEvento('Generado');
      setPasoModal(0);
    } catch (error) {
      const status = error?.response?.status;
      const validacion = error?.validation;
      if (validacion?.errors && typeof validacion.errors === 'object') {
        setErrores(validacion.errors);
      }
      setErrorGlobal(
        validacion?.message ||
          error?.response?.data?.message ||
          estadoLabel(status) ||
          error?.message ||
          'No se pudo generar el reporte.',
      );
      guardarEvento(`Error ${status || ''}`.trim());
    } finally {
      setCargando(false);
    }
  };

  const e = (campo) => errores?.[campo];

  return (
    <ContenedorPrincipal>
      <div className="reportes-modulo">
        <EncabezadoModulo
          titulo="Reportes Generales"
          subtitulo="Resumenes y totales por modulo"
          textoBoton="Generar Reporte"
          alHacerClic={abrirFlujo}
        />

        {errorGlobal ? <div className="reportes-alerta reportes-alerta--error">{errorGlobal}</div> : null}
        {exito ? <div className="reportes-alerta reportes-alerta--ok">{exito}</div> : null}

        <section className="reportes-kpis">
          <article className="reportes-kpi">
            <span>Total</span>
            <strong>{kpis.total}</strong>
          </article>
          <article className="reportes-kpi">
            <span>Generados</span>
            <strong>{kpis.generados}</strong>
          </article>
          <article className="reportes-kpi">
            <span>Fallidos</span>
            <strong>{kpis.fallidos}</strong>
          </article>
          <article className="reportes-kpi">
            <span>Este mes</span>
            <strong>{kpis.esteMes}</strong>
          </article>
        </section>

        <section className="reportes-card reportes-filtros-card">
          <h3>Filtros</h3>
          <div className="reportes-filtros">
            <label>
              <span>Tipo de reporte</span>
              <select
                value={filtroRegistro.modulo}
                onChange={(ev) => setFiltroRegistro((p) => ({ ...p, modulo: ev.target.value }))}
              >
                <option value="">Todos</option>
                {moduloOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Desde</span>
              <input
                type="date"
                value={filtroRegistro.fechaDesde}
                onChange={(ev) => setFiltroRegistro((p) => ({ ...p, fechaDesde: ev.target.value }))}
              />
            </label>
            <label>
              <span>Hasta</span>
              <input
                type="date"
                value={filtroRegistro.fechaHasta}
                onChange={(ev) => setFiltroRegistro((p) => ({ ...p, fechaHasta: ev.target.value }))}
              />
            </label>
          </div>
        </section>

        <section className="reportes-card">
          <h3>Registro</h3>
          {historialFiltrado.length === 0 ? (
            <SinDatos mensaje="Sin reportes generados en esta sesion." />
          ) : (
            <div className="reportes-historial">
              {historialFiltrado.map((item) => (
                <article key={item.id} className="reportes-item">
                  <div className="reportes-item-main">
                    <strong>{moduloData(item.modulo).label}</strong>
                    <small>{fechaHoraCorta(item.fecha)}</small>
                  </div>
                  <div className="reportes-item-meta">
                    <span className={`reportes-pill ${item.estado === 'Generado' ? 'ok' : 'err'}`}>{item.estado}</span>
                    <span className="reportes-pill muted">General</span>
                    <div className="reportes-registro-acciones">
                      <button
                        type="button"
                        className="btn-accion-tabla btn-accion-tabla-cert-pdf"
                        onClick={() => redescargarPdfRegistro(item)}
                        disabled={cargandoRegistroId === item.id}
                        title="Descargar PDF de nuevo"
                        aria-label="Descargar PDF de nuevo"
                      >
                        {cargandoRegistroId === item.id ? <IconoEsperaReporte /> : <IconoDocumentoReporte />}
                      </button>
                      <button
                        type="button"
                        className="btn-accion-tabla btn-accion-eliminar"
                        onClick={() => eliminarEventoHistorial(item.id)}
                        title="Eliminar del registro"
                        aria-label="Eliminar del registro"
                      >
                        <IconoBasuraReporte />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        mostrar={pasoModal === 1}
        cerrar={cerrarFlujo}
        titulo="Generar nuevo reporte"
        classNameContenedor="reportes-modal"
      >
        <div className="reportes-step">
          <p className="reportes-step-label">Seleccionar el modulo:</p>
          <div className="reportes-modulos-grid">
            {moduloOptions.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`reportes-modulo-btn ${moduloSeleccionado === m.value ? 'activo' : ''}`}
                onClick={() => setModuloSeleccionado(m.value)}
              >
                <span>
                  <strong>{m.label}</strong>
                  <small>{m.descripcion}</small>
                </span>
              </button>
            ))}
          </div>
          {e('modulo') ? <small className="campo-seccion-error">{e('modulo')}</small> : null}
          <div className="reportes-modal-actions">
            <button type="button" className="btn btn-secundario" onClick={cerrarFlujo}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primario" onClick={() => setPasoModal(2)}>
              Continuar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        mostrar={pasoModal === 2}
        cerrar={cerrarFlujo}
        titulo="Generar nuevo reporte"
        classNameContenedor="reportes-modal"
      >
        <form className="reportes-step" onSubmit={onGenerar}>
          <p className="reportes-step-label">{moduloData(moduloSeleccionado).label} &gt; tipo de reporte</p>
          <button type="button" className="reportes-tipo-opcion activo">
            <span>
              <strong>Resumen general de {moduloData(moduloSeleccionado).label.toLowerCase()}</strong>
              <small>Totales del modulo en formato PDF.</small>
            </span>
            <span className="reportes-radio-activo" aria-hidden />
          </button>
          <label>
            <span>Descripcion (opcional)</span>
            <textarea
              value={descripcion}
              maxLength={150}
              onChange={(ev) => setDescripcion(ev.target.value)}
              placeholder="Ej: Reporte mensual para revision interna"
            />
            <small className="reportes-counter">{descripcion.length}/150</small>
            {e('params.descripcion') ? <small className="campo-seccion-error">{e('params.descripcion')}</small> : null}
          </label>
          <div className="reportes-modal-actions">
            <button type="button" className="btn btn-secundario" onClick={cerrarFlujo}>
              Cancelar
            </button>
            <button type="button" className="btn btn-secundario" onClick={() => setPasoModal(1)}>
              ← Cambiar modulo
            </button>
            <button type="submit" className="btn btn-primario" disabled={cargando}>
              {cargando ? 'Generando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </Modal>
    </ContenedorPrincipal>
  );
}

export default Reportes;
