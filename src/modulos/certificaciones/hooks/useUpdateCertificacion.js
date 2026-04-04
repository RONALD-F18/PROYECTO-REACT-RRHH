import { useState } from 'react';
import { updateCertificacion } from '../../../services/certificaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';

export function useUpdateCertificacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mutate = async (id, payload) => {
    setLoading(true);
    setError('');
    try {
      return await updateCertificacion(id, payload);
    } catch (e) {
      const msg = mensajeErrorApi(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
