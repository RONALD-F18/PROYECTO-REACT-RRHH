import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { haySesionLocalActiva } from '../services/autenticacion';
import { invalidarCacheCatalogos, obtenerCatalogos } from '../services/catalogos';

const CatalogosContext = createContext(null);

export function CatalogosProvider({ children }) {
  const [catalogos, setCatalogos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async ({ forzar = false } = {}) => {
    if (!haySesionLocalActiva()) {
      setCatalogos(null);
      setError('');
      return null;
    }
    setCargando(true);
    setError('');
    try {
      const data = await obtenerCatalogos({ forzar });
      setCatalogos(data && typeof data === 'object' ? data : {});
      return data;
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar los catálogos.');
      setCatalogos({});
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  const recargar = useCallback(() => {
    invalidarCacheCatalogos();
    return cargar({ forzar: true });
  }, [cargar]);

  useEffect(() => {
    if (haySesionLocalActiva()) {
      void cargar();
    } else {
      setCatalogos(null);
    }
  }, [cargar]);

  const valor = useMemo(
    () => ({
      catalogos,
      cargando,
      error,
      cargar,
      recargar,
    }),
    [catalogos, cargando, error, cargar, recargar],
  );

  return <CatalogosContext.Provider value={valor}>{children}</CatalogosContext.Provider>;
}

export function useCatalogos() {
  const ctx = useContext(CatalogosContext);
  if (!ctx) {
    throw new Error('useCatalogos debe usarse dentro de CatalogosProvider');
  }
  return ctx;
}

/** Versión segura fuera del provider (devuelve catálogos vacíos). */
export function useCatalogosOpcional() {
  return useContext(CatalogosContext);
}
