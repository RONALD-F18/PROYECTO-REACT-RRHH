import { useState } from 'react';
import {
  codigoCertificacionDesde,
  descargarBlobComoArchivo,
  downloadPdfAfiliaciones,
  downloadPdfLaboral,
} from '../../../services/certificaciones';
import { esCertificacionAfiliacionesTipo, esCertificacionLaboralTipo } from '../utils/certificacionTipo';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';

/**
 * Descarga el PDF adecuado según tipo_certificacion (LABORAL → pdf-laboral, AFILIACIONES → pdf-afiliaciones).
 */
export function useDownloadCertificacionPdf() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const download = async (filaCertificacion) => {
    const id = codigoCertificacionDesde(filaCertificacion);
    if (id == null) return;
    const tipo = filaCertificacion?.tipo_certificacion;
    const esLab = esCertificacionLaboralTipo(tipo);
    const esAfil = esCertificacionAfiliacionesTipo(tipo);
    if (!esLab && !esAfil) {
      setError('Este tipo de certificación no tiene PDF disponible.');
      throw new Error('Este tipo de certificación no tiene PDF disponible.');
    }
    setLoading(true);
    setError('');
    try {
      const blob = esLab ? await downloadPdfLaboral(id) : await downloadPdfAfiliaciones(id);
      const nombre = esLab ? `certificacion_laboral_${id}.pdf` : `certificacion_afiliaciones_${id}.pdf`;
      descargarBlobComoArchivo(blob, nombre);
    } catch (e) {
      const msg = e?.message && !e.response ? String(e.message) : mensajeErrorApi(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { download, loading, error };
}
