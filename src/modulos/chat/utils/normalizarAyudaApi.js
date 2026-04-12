import { esTextoTecnicoVisible } from './filtrarAyudaFuncionario';
import { esSugerenciaFueraDeModulo } from './filtrarSugerenciasFueraDeModulo';
import { esChipAyudaRuidoso, esTituloGrupoProductoGeneral } from './filtrarRuidoAyuda';

/**
 * Respuesta GET /chat/ayuda (contrato v2: catálogo, módulo, temas agrupados).
 */
export function normalizarPayloadAyuda(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      catalogoModulos: [],
      moduloContexto: null,
      accionesNavegacion: [],
      temasAgrupados: [],
    };
  }
  return {
    catalogoModulos: Array.isArray(raw.catalogo_modulos) ? raw.catalogo_modulos : [],
    moduloContexto: raw.modulo_contexto && typeof raw.modulo_contexto === 'object' ? raw.modulo_contexto : null,
    accionesNavegacion: Array.isArray(raw.acciones_navegacion) ? raw.acciones_navegacion : [],
    temasAgrupados: Array.isArray(raw.temas_agrupados) ? raw.temas_agrupados : [],
  };
}

/** ¿El backend ya envía la forma nueva (aunque algunos arrays vayan vacíos)? */
export function respuestaAyudaTieneShapeV2(raw) {
  if (!raw || typeof raw !== 'object') return false;
  return (
    'catalogo_modulos' in raw ||
    'modulo_contexto' in raw ||
    'acciones_navegacion' in raw ||
    'temas_agrupados' in raw
  );
}

/**
 * Temas agrupados con preguntas filtradas (sin chips técnicos ni ruido de producto en vista por módulo).
 * @param {object[]} grupos temas_agrupados del API
 * @param {{ moduloAyuda?: string | null }} [opciones] clave GET ?modulo= (empleados, general…)
 */
export function temasAgrupadosParaUi(grupos, opciones = {}) {
  if (!Array.isArray(grupos)) return [];
  const moduloAyuda = opciones.moduloAyuda != null ? String(opciones.moduloAyuda).trim() : null;
  return grupos
    .map((g, gi) => {
      const tituloGrupo = String(g?.titulo ?? '').trim() || 'Tema';
      if (esTituloGrupoProductoGeneral(tituloGrupo, moduloAyuda)) return null;

      const preguntasRaw = Array.isArray(g?.preguntas) ? g.preguntas : [];
      const preguntas = preguntasRaw
        .map((p, pi) => {
          const enviar = String(p?.enviar ?? '').trim();
          const etiqueta = String(p?.etiqueta ?? enviar).trim();
          if (!enviar) return null;
          if (esTextoTecnicoVisible(etiqueta, enviar)) return null;
          if (esChipAyudaRuidoso(etiqueta, enviar)) return null;
          if (esSugerenciaFueraDeModulo({ etiqueta, enviar }, moduloAyuda)) return null;
          return {
            key: `p-${g?.cod_entrada_ayuda ?? gi}-${pi}-${enviar.slice(0, 24)}`,
            etiqueta,
            enviar,
          };
        })
        .filter(Boolean);
      if (preguntas.length === 0) return null;
      return {
        key: `g-${g?.cod_entrada_ayuda ?? gi}-${String(g?.titulo ?? '').slice(0, 20)}`,
        titulo: tituloGrupo,
        modulo: g?.modulo,
        cod_entrada_ayuda: g?.cod_entrada_ayuda,
        preguntas,
      };
    })
    .filter(Boolean);
}
