/**
 * POST /chat/conversaciones/:id/mensajes — campo opcional `presentacion_chat`.
 * @see normalizarChipsDesdePresentacion
 */

import { esChipAyudaRuidoso } from './filtrarRuidoAyuda';

function claveChip(c, i) {
  const env = String(c?.enviar ?? '').trim();
  const lab = String(c?.etiqueta ?? env).trim();
  return `chip-${i}-${lab.slice(0, 12)}-${env.slice(0, 16)}`;
}

/** Normaliza filas { etiqueta, enviar } desde distintas formas del backend. */
export function normalizarChipsLista(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row, i) => {
      if (!row || typeof row !== 'object') return null;
      const enviar = String(row.enviar ?? row.texto_enviar ?? row.query ?? row.contenido ?? '').trim();
      const etiqueta = String(row.etiqueta ?? row.label ?? row.titulo ?? enviar).trim();
      if (!enviar) return null;
      if (esChipAyudaRuidoso(etiqueta, enviar)) return null;
      return { key: claveChip(row, i), etiqueta: etiqueta || enviar, enviar };
    })
    .filter(Boolean);
}

/**
 * @param {object} data cuerpo `data` del POST mensajes
 * @returns {{ registroEstilo: string, sugerenciasMeta: object|null, chips: Array<{key, etiqueta, enviar}> }}
 */
export function normalizarPresentacionChatPost(data) {
  const pc = data?.presentacion_chat;
  if (!pc || typeof pc !== 'object') {
    return { registroEstilo: 'mensajeria', sugerenciasMeta: null, chips: [] };
  }

  const registroEstilo = String(pc.registro_estilo || 'mensajeria').toLowerCase();
  const sr = pc.sugerencias_relacionadas;

  let chips = [];
  let sugerenciasMeta = null;

  if (Array.isArray(sr)) {
    chips = normalizarChipsLista(sr);
  } else if (sr && typeof sr === 'object') {
    sugerenciasMeta = {
      ubicacion: sr.ubicacion,
      alineacion: sr.alineacion,
      columna: sr.columna,
      nota: sr.nota,
    };
    const rawLista = sr.items ?? sr.opciones ?? sr.chips ?? sr.sugerencias ?? sr.data ?? [];
    chips = normalizarChipsLista(Array.isArray(rawLista) ? rawLista : []);
  }

  return { registroEstilo, sugerenciasMeta, chips };
}
