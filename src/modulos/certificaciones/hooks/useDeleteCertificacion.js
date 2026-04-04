import { useState } from 'react';
import { deleteCertificacion } from '../../../services/certificaciones';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';

export function useDeleteCertificacion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mutate = async (id) => {
    setLoading(true);
    setError('');
    try {
      return await deleteCertificacion(id);
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
