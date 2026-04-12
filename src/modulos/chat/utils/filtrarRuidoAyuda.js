/**
 * Chips y grupos de GET /chat/ayuda que no aportan (guías vacías, marketing duplicado).
 */

function n(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Preguntas tipo “Abrir esta guía” que suelen no disparar contenido útil. */
export function esChipAyudaRuidoso(etiqueta, enviar) {
  const blob = n(`${etiqueta} ${enviar}`);
  if (/abrir\s+esta\s+gui/.test(blob)) return true;
  if (blob.includes('abrir esta guia')) return true;
  return false;
}

/**
 * Títulos de bloque temas_agrupados[] orientados al producto general (no RRHH del módulo).
 * Solo se ocultan cuando GET va con ?modulo= distinto de general.
 */
const TITULOS_GRUPO_PRODUCTO = [
  'que es talent',
  'qué es talent',
  'modulos que encontraras',
  'módulos que encontrarás',
  'modulos del sistema',
  'módulos del sistema',
  'como usar este asistente',
  'cómo usar este asistente',
  'en tu dia a dia',
  'en tu día a día',
  'bienvenida',
];

export function esTituloGrupoProductoGeneral(titulo, moduloAyuda) {
  if (!moduloAyuda || moduloAyuda === 'general') return false;
  const t = n(titulo);
  return TITULOS_GRUPO_PRODUCTO.some((p) => t.includes(n(p)));
}
