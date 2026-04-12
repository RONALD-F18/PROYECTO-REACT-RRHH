/**
 * Cuando el usuario ya está en un módulo concreto, oculta chips genéricos
 * (presentación del producto) que no aportan al flujo actual.
 */
function normalizar(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

const PATRONES_GENERICOS = [
  'que es talent',
  'qué es talent',
  'acerca de talent',
  'informacion general',
  'información general',
  'modulos que encontraras',
  'módulos que encontrarás',
  'modulos del sistema',
  'módulos del sistema',
  'bienvenida al sistema',
  'que es el sistema',
  'listado modulos',
  'listado de modulos',
  'listado módulos',
  'menu talent',
  'menú talent',
  'gestion humana sena',
  'gestión humana sena',
];

/**
 * @param {{ etiqueta?: string, enviar?: string }} chip
 * @param {string | null} moduloActivo clave normalizada (p. ej. empleados) o null
 */
export function esSugerenciaFueraDeModulo(chip, moduloActivo) {
  if (!moduloActivo || moduloActivo === 'general') return false;
  const blob = normalizar(`${chip?.etiqueta ?? ''} ${chip?.enviar ?? ''}`);
  return PATRONES_GENERICOS.some((p) => blob.includes(normalizar(p)));
}
