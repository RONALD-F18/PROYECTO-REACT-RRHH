const PREFIJO = 'rrhh_lista:';

export const CLAVES_LISTAS = {
  EMPLEADOS: 'empleados',
  CONTRATOS: 'contratos',
  INCAPACIDADES: 'incapacidades',
  INASISTENCIAS: 'inasistencias',
  AFILIACIONES: 'afiliaciones',
  CERTIFICACIONES: 'certificaciones',
  ACTIVIDADES: 'calendario-actividades',
  BANCOS: 'bancos',
  CARGOS: 'cargos',
  USUARIOS: 'usuarios',
  COMUNICACIONES: 'comunicaciones-disciplinarias',
  DASHBOARD_RESUMEN: 'dashboard-resumen',
};

function claveCompleta(id) {
  return `${PREFIJO}${id}`;
}

export function leerCacheListaSesion(id, ttlMs) {
  if (typeof window === 'undefined' || !id || !ttlMs) return null;
  try {
    const raw = sessionStorage.getItem(claveCompleta(id));
    if (!raw) return null;
    const envoltorio = JSON.parse(raw);
    if (!envoltorio || typeof envoltorio !== 'object') return null;
    if (Date.now() - Number(envoltorio.t) > ttlMs) {
      sessionStorage.removeItem(claveCompleta(id));
      return null;
    }
    return envoltorio.d ?? null;
  } catch {
    return null;
  }
}

export function escribirCacheListaSesion(id, datos) {
  if (typeof window === 'undefined' || !id) return;
  try {
    sessionStorage.setItem(
      claveCompleta(id),
      JSON.stringify({ t: Date.now(), d: datos }),
    );
  } catch {
    /* quota o modo privado */
  }
}

export function invalidarCacheListaSesion(id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    sessionStorage.removeItem(claveCompleta(id));
  } catch {
    /* noop */
  }
}

export function limpiarTodasLasListasSesion() {
  if (typeof window === 'undefined') return;
  try {
    const quitar = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(PREFIJO)) quitar.push(k);
    }
    quitar.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* noop */
  }
}
