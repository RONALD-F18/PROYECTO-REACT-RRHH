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

/** Fallbacks mínimos si el GET falla (valores canónicos del backend). */
export const CATALOGOS_FALLBACK = {
  tipos_documento: ['CC', 'CE', 'TI', 'PASAPORTE'],
  sexos_empleado: ['MASCULINO', 'FEMENINO'],
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
  tipos_comunicacion: ['Memorando'],
  motivos_comunicacion: ['Incumplimiento', 'Desacato', 'Reincidencia', 'Conducta', 'Retraso'],
  estados_afiliacion: ['Activa', 'Inactiva', 'Suspendida'],
  tipos_regimen: ['Contributivo'],
  justificado_inasistencia: ['SI', 'NO'],
  estados_prestacion_pago: ['Pendiente', 'Pagado', 'Trasladado'],
};

/** Etiquetas UI para tipos de documento (value = código del catálogo). */
export const ETIQUETAS_TIPO_DOCUMENTO = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  TI: 'Tarjeta de identidad',
  PASAPORTE: 'Pasaporte',
};

export function etiquetaTipoDocumentoCatalogo(codigo) {
  const c = String(codigo ?? '').trim().toUpperCase();
  return ETIQUETAS_TIPO_DOCUMENTO[c] ?? (c || '—');
}

export function opcionesTiposDocumento(catalogos) {
  return listaCatalogo(catalogos, 'tipos_documento').map((v) => {
    const s = String(v).trim();
    return { valor: s, etiqueta: etiquetaTipoDocumentoCatalogo(s) };
  });
}

export function opcionesSexosEmpleado(catalogos) {
  return opcionesDesdeListaStrings(listaCatalogo(catalogos, 'sexos_empleado'));
}

/**
 * Opciones { valor, etiqueta } desde tabla relacional del catálogo.
 * @param {object} catalogos
 * @param {string} clave — ej. 'bancos', 'eps'
 * @param {string} codCampo — ej. 'cod_banco'
 * @param {string} labelCampo — ej. 'nombre_banco'
 */
export function opcionesRelacional(catalogos, clave, codCampo, labelCampo) {
  const arr = catalogos?.[clave];
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((row) => row && row[codCampo] != null && row[codCampo] !== '')
    .map((row) => ({
      valor: String(row[codCampo]),
      etiqueta: String(row[labelCampo] ?? row[codCampo]).trim(),
    }));
}

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

/** Mapea GET /catalogos a la forma usada por afiliaciones (compat. claves legacy). */
export function catalogoAfiliacionDesdeGlobal(catalogos) {
  if (!catalogos || typeof catalogos !== 'object') return null;
  return {
    eps: catalogos.eps ?? [],
    riesgos: catalogos.riesgos ?? [],
    arls: catalogos.arls ?? [],
    pensiones: catalogos.fondos_pensiones ?? catalogos.pensiones ?? [],
    cesantias: catalogos.fondos_cesantias ?? catalogos.cesantias ?? [],
    compensaciones: catalogos.cajas_compensacion ?? catalogos.compensaciones ?? [],
    estados_afiliacion: listaCatalogo(catalogos, 'estados_afiliacion'),
    tipos_regimen: listaCatalogo(catalogos, 'tipos_regimen'),
  };
}
