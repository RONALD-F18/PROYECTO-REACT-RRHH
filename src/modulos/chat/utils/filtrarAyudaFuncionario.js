/**
 * Oculta chips/entradas orientadas a desarrollo (API, HTTP, Laravel…).
 * La fuente de verdad sigue siendo el backend; esto evita ruido hasta que el seed sea solo RRHH.
 */

function normalizar(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Frases o tokens que no deberían ver los funcionarios en sugerencias. */
const PATRONES = [
  'api',
  '/api/',
  'endpoint',
  'base url',
  'prefijo',
  '422',
  '401',
  '403',
  '404',
  'http://',
  'https://',
  'json',
  'jwt',
  'bearer',
  'authorization:',
  'content-type',
  'laravel',
  'graphql',
  'postman',
  'curl',
  'middleware',
  'openai',
  'sql',
  'query string',
  'status code',
  'codigo de estado',
  'validacion (422)',
  'validación (422)',
  'errores de validacion',
  'errores de validación',
  'objeto errors',
  'swagger',
  'openapi',
];

const TOKEN_CORTO_TECNICO = new Set(['v1', 'jwt', 'sql']);

export function esTextoTecnicoVisible(etiqueta, enviar) {
  const e = String(enviar ?? '').trim();
  const lab = String(etiqueta ?? '').trim();
  const t = normalizar(`${lab} ${e}`);

  if (PATRONES.some((p) => t.includes(normalizar(p)))) return true;

  const solo = normalizar(e).replace(/\s+/g, ' ').trim();
  if (solo.length <= 4 && TOKEN_CORTO_TECNICO.has(solo)) return true;

  if (/^\d{3}$/.test(solo)) return true;

  return false;
}

/** Excluye filas del diccionario cuyo contenido es claramente técnico. */
export function esEntradaAyudaTecnica(entradasItem) {
  if (!entradasItem || typeof entradasItem !== 'object') return true;
  const partes = [
    entradasItem.titulo,
    entradasItem.contenido,
    entradasItem.palabras_clave,
    Array.isArray(entradasItem.palabras_sugeridas) ? entradasItem.palabras_sugeridas.join(' ') : '',
  ];
  const blob = normalizar(partes.join(' '));
  return PATRONES.some((p) => blob.includes(normalizar(p)));
}
