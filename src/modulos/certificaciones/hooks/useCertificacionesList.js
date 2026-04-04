import { useCallback, useEffect, useState } from 'react';
import { extraerFilasCertificaciones, getCertificaciones } from '../../../services/certificaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';

export function useCertificacionesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await getCertificaciones();
      setData(extraerFilasCertificaciones(json));
    } catch (e) {
      setData([]);
      setError(mensajeErrorApi(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
