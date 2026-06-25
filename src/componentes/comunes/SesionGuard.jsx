import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVENTO_SESION_EXPIRADA } from '../../services/sesionEventos';

/**
 * Ante 401 del API, el interceptor dispara un evento para sacar al usuario del módulo
 * sin depender solo de window.location (evita formularios abiertos con sesión muerta).
 */
export default function SesionGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const irLogin = () => {
      navigate('/login', { replace: true, state: { sesionExpirada: true } });
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, irLogin);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, irLogin);
  }, [navigate]);

  return children;
}
