import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const baseNormalizada = baseURL.replace(/\/$/, '');

const cabecerasJson = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Sesión / cookies (Sanctum, logout, etc.). Requiere CORS con credenciales bien configurado.
 */
const api = axios.create({
  baseURL: baseNormalizada,
  withCredentials: true,
  headers: cabecerasJson,
});

/**
 * Rutas públicas sin cookie (forgot/reset password). Evita fallos silenciosos cuando CORS
 * no expone Access-Control-Allow-Credentials para POST anónimos.
 */
export const apiPublica = axios.create({
  baseURL: baseNormalizada,
  withCredentials: false,
  headers: cabecerasJson,
});

export default api;