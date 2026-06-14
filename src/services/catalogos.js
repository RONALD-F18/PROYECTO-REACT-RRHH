import api from './api';
import { crearPeticionCompartida, invalidarEjecutorCompartido } from '../utils/peticionCompartida';

const ejecutarGetCatalogos = crearPeticionCompartida(async () => {
  const { data } = await api.get('/catalogos');
  if (data && typeof data === 'object' && data.data && typeof data.data === 'object') {
    return data.data;
  }
  return data && typeof data === 'object' ? data : {};
});

/** GET /catalogos — listas de dominio RRHH (contratos, afiliaciones, disciplinario, etc.). */
export async function obtenerCatalogos({ forzar = false } = {}) {
  return ejecutarGetCatalogos({ forzar });
}

export function invalidarCacheCatalogos() {
  invalidarEjecutorCompartido(ejecutarGetCatalogos);
}

/** Convierte array de strings del API en opciones { valor, etiqueta }. */
export function opcionesDesdeListaStrings(lista) {
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((v) => v != null && String(v).trim() !== '')
    .map((v) => {
      const s = String(v).trim();
      return { valor: s, etiqueta: s };
    });
}

/** Fallbacks alineados al seeder Laravel (si el GET falla o un campo viene vacío). */
export const CATALOGOS_FALLBACK = {
  tipos_contrato: [
    'Termino indefinido',
    'Termino fijo',
    'Obra o labor',
    'Aprendizaje',
    'Prestacion de servicios',
  ],
  tipos_contrato_con_fecha_fin: ['Termino fijo', 'Obra o labor', 'Aprendizaje'],
  formas_pago: ['Mensual', 'Quincenal', 'Por hora'],
  modalidades_trabajo: ['Presencial', 'Remoto', 'Hibrido'],
  horarios_trabajo: ['Tiempo completo', 'Medio tiempo', 'Por turnos'],
  estados_incapacidad: ['Activa', 'Finalizada', 'Cancelada'],
  estados_comunicacion: ['Emitida', 'En seguimiento', 'Cerrada'],
  tipos_comunicacion: [
    'Memorando',
    'Apercibimiento formal',
    'Suspension disciplinaria',
    'Compromiso de mejora',
  ],
  motivos_comunicacion: ['Incumplimiento', 'Desacato', 'Reincidencia', 'Conducta', 'Retraso'],
  estados_afiliacion: ['Activa', 'Inactiva', 'Suspendida'],
  tipos_regimen: ['Contributivo', 'Subsidiado'],
  justificado_inasistencia: ['SI', 'NO'],
  estados_prestacion_pago: ['Pendiente', 'Pagado', 'Trasladado'],
};

export function listaCatalogo(catalogos, clave) {
  const arr = catalogos?.[clave];
  if (Array.isArray(arr) && arr.length > 0) return arr;
  return CATALOGOS_FALLBACK[clave] ?? [];
}

export function opcionesCatalogo(catalogos, clave) {
  return opcionesDesdeListaStrings(listaCatalogo(catalogos, clave));
}

export function requiereFechaFinContrato(tipoContrato, catalogos) {
  const tipo = String(tipoContrato ?? '').trim();
  if (!tipo) return false;
  const lista = listaCatalogo(catalogos, 'tipos_contrato_con_fecha_fin');
  return lista.some((t) => String(t).trim().toLowerCase() === tipo.toLowerCase());
}
