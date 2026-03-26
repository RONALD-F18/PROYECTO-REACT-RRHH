import { useCallback, useEffect, useState } from 'react';
import { getCertificacionById, normalizarRegistroCertificacion } from '../../../services/certificaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';

export function useCertificacionDetail(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const json = await getCertificacionById(id);
      setData(normalizarRegistroCertificacion(json));
    } catch (e) {
      setData(null);
      setError(mensajeErrorApi(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    void refetch();
  }, [id, refetch]);

  return { data, loading, error, refetch };
}
