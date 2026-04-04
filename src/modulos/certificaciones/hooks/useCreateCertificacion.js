import { useState } from 'react';
import { createCertificacion } from '../../../services/certificaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';

export function useCreateCertificacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mutate = async (payload) => {
    setLoading(true);
    setError('');
    try {
      return await createCertificacion(payload);
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
