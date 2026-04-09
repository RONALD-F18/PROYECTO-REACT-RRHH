import api from '../api';

/**
 * POST /ayuda-chat/consulta
 * Cuerpo: { mensaje: string, rol: 'admin' | 'funcionario' }
 * Respuesta esperada: { respuesta: string, enlaces?: {etiqueta,ruta}[], coincidencia?: string }
 */
export async function consultarAyudaChatApi({ mensaje, rol }) {
  const { data } = await api.post('/ayuda-chat/consulta', {
    mensaje: String(mensaje || '').slice(0, 500),
    rol: rol === 'admin' ? 'admin' : 'funcionario',
  });
  return data;
}
