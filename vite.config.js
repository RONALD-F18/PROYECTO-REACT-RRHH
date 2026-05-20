import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000';

  return {
    base: '/PROYECTO-REACT-RRHH/',
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      },
      /** Si usas `VITE_API_URL=/api/v1`, el front llama al mismo origen y Vite reenvía `/api` a Laravel (menos problemas de CORS/credenciales en desarrollo). */
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: 4173,
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
  };
});
