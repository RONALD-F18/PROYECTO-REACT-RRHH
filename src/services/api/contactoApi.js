import { apiPublica } from '../api';

/**
 * POST /contacto (público, sin token)
 * body: { nombre, email, asunto, mensaje }
 */
export async function enviarContactoLanding(payload) {
  const { data } = await apiPublica.post('/contacto', {
    nombre: String(payload.nombre ?? '').trim(),
    email: String(payload.email ?? '').trim(),
    asunto: String(payload.asunto ?? '').trim(),
    mensaje: String(payload.mensaje ?? '').trim(),
  });
  return data;
}
