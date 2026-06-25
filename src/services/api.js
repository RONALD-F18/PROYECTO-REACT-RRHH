import axios from 'axios';
import { alertaError } from '../utils/alertasSwal';
import { obtenerTokenBearerDesdeSesion, limpiarAlmacenSesionCliente } from './sesionLocal';
import { notificarSesionExpirada } from './sesionEventos';

const baseURL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '');
const baseNormalizada = baseURL.replace(/\/$/, '');

/**
 * Cookies Sanctum solo en desarrollo si front y API comparten origen.
 * En producción la sesión va por Bearer en localStorage (mismo dominio o no).
 */
function usarCredencialesCors() {
  if (import.meta.env.PROD) return false;
  if (typeof window === 'undefined') return true;
  try {
    return new URL(baseNormalizada).origin === window.location.origin;
  } catch {
    return true;
  }
}

const cabecerasJson = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/** Por defecto 2 min: Laravel en Docker / primer arranque / listados pesados suelen superar 60s. */
const TIMEOUT_MIN_MS = 10_000;
const TIMEOUT_DEFAULT_MS = 120_000;
const TIMEOUT_MAX_MS = 600_000;

/**
 * Tiempo máximo de espera por petición (todas las rutas que usan `api` / `apiPublica`).
 * Configura `VITE_API_TIMEOUT_MS` en `.env` (p. ej. 180000). Valores inválidos usan el default.
 */
export function leerTimeoutApiMs() {
  const raw = import.meta.env.VITE_API_TIMEOUT_MS;
  if (raw === '' || raw === undefined || raw === null) return TIMEOUT_DEFAULT_MS;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n)) return TIMEOUT_DEFAULT_MS;
  if (n < TIMEOUT_MIN_MS) return TIMEOUT_DEFAULT_MS;
  return Math.min(n, TIMEOUT_MAX_MS);
}

export const API_REQUEST_TIMEOUT_MS = leerTimeoutApiMs();

/**
 * Sesión: cookies (Sanctum) y/o Bearer si el login guardó token en localStorage.
 * Timeout global evita peticiones colgadas que bloquean logout u otras acciones.
 */
const api = axios.create({
  baseURL: baseNormalizada,
  withCredentials: usarCredencialesCors(),
  headers: cabecerasJson,
  timeout: API_REQUEST_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  if (import.meta.env.PROD) {
    config.withCredentials = false;
  }
  const token = obtenerTokenBearerDesdeSesion();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let ultimoToast429 = 0;
let manejando401 = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const urlPedido = String(error.config?.url ?? '');
    const esRutaLogin = urlPedido.includes('/login');

    if (status === 429) {
      const ahora = Date.now();
      if (ahora - ultimoToast429 > 4000) {
        ultimoToast429 = ahora;
        void alertaError(
          'Demasiadas solicitudes',
          'Espere unos segundos e intente de nuevo.',
        );
      }
    }

    if (status === 401 && !esRutaLogin) {
      if (!manejando401) {
        manejando401 = true;
        limpiarAlmacenSesionCliente();
        void alertaError(
          'Sesión expirada',
          'Vuelva a iniciar sesión para continuar.',
        ).finally(() => {
          manejando401 = false;
        });
        notificarSesionExpirada();
        const pathname = String(window.location.pathname || '');
        const enLogin = pathname === '/login' || pathname.endsWith('/login');
        if (!enLogin) {
          const base = import.meta.env.BASE_URL || '/';
          const loginPath = `${base.replace(/\/$/, '')}/login`.replace(/\/+/g, '/');
          window.setTimeout(() => {
            window.location.replace(`${window.location.origin}${loginPath}`);
          }, 400);
        }
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
  timeout: API_REQUEST_TIMEOUT_MS,
});

export default api;
