import axios from 'axios';
import { obtenerTokenBearerDesdeSesion, limpiarAlmacenSesionCliente } from './sesionLocal';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const baseNormalizada = baseURL.replace(/\/$/, '');

const cabecerasJson = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Sesión: cookies (Sanctum) y/o Bearer si el login guardó token en localStorage.
 * Timeout global evita peticiones colgadas que bloquean logout u otras acciones.
 */
const tiempoEsperaMs = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 60000;

const api = axios.create({
  baseURL: baseNormalizada,
  withCredentials: true,
  headers: cabecerasJson,
  timeout: tiempoEsperaMs,
});

api.interceptors.request.use((config) => {
  const token = obtenerTokenBearerDesdeSesion();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const urlPedido = String(error.config?.url ?? '');
    const esRutaLogin = urlPedido.includes('/login');

    if (status === 401 && !esRutaLogin) {
      limpiarAlmacenSesionCliente();
      const path = window.location.pathname || '';
      const enLogin = path === '/login' || path.endsWith('/login');
      if (!enLogin) {
        window.location.assign(`${window.location.origin}/login`);
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Rutas públicas sin cookie (forgot/reset password). Evita fallos silenciosos cuando CORS
 * no expone Access-Control-Allow-Credentials para POST anónimos.
 */
export const apiPublica = axios.create({
  baseURL: baseNormalizada,
  withCredentials: false,
  headers: cabecerasJson,
  timeout: tiempoEsperaMs,
});

export default api;
