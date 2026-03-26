import { esCertificacionAfiliacionesTipo, esCertificacionLaboralTipo } from '../utils/certificacionTipo';

function IconoOjo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconoLapiz() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconoBasura() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/** Documento con líneas (mismo estilo que íconos outline del proyecto). */
function IconoDocumento() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconoEspera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="6" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="18" cy="12" r="1.75" />
    </svg>
  );
}

function CertificationActions({ fila, onVer, onEditar, onEliminar, onDescargar, pdfCargando }) {
  const tipo = fila?.tipo_certificacion;
  const laboral = esCertificacionLaboralTipo(tipo);
  const afiliaciones = esCertificacionAfiliacionesTipo(tipo);
  const puedePdf = laboral || afiliaciones;
  const tituloPdf = laboral
    ? 'Descargar PDF de certificación laboral'
    : afiliaciones
      ? 'Descargar PDF de afiliaciones'
      : 'Descargar PDF';

  return (
    <>
      <button type="button" className="btn-accion-tabla btn-accion-editar" onClick={() => onEditar(fila)} title="Editar">
        <IconoLapiz />
      </button>
      <button type="button" className="btn-accion-tabla btn-accion-ver" onClick={() => onVer(fila)} title="Ver detalle">
        <IconoOjo />
      </button>
      {puedePdf ? (
        <button
          type="button"
          className="btn-accion-tabla btn-accion-tabla-cert-pdf"
          disabled={pdfCargando}
          title={tituloPdf}
          aria-label={tituloPdf}
          onClick={() => onDescargar(fila)}
        >
          {pdfCargando ? <IconoEspera /> : <IconoDocumento />}
        </button>
      ) : null}
      <button type="button" className="btn-accion-tabla btn-accion-eliminar" onClick={() => onEliminar(fila)} title="Eliminar">
        <IconoBasura />
      </button>
    </>
  );
}

export { esCertificacionLaboralTipo, esCertificacionAfiliacionesTipo } from '../utils/certificacionTipo';
export default CertificationActions;
