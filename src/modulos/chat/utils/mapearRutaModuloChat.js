import { esEntradaAyudaTecnica, esTextoTecnicoVisible } from './filtrarAyudaFuncionario';

/**
 * Clave `modulo` para GET /chat/ayuda?modulo= (mismo vocabulario que el seed/backend).
 */
export function mapearPathnameAModulo(pathname) {
  const p = String(pathname || '').toLowerCase();

  if (p.startsWith('/login')) return 'autenticacion';
  if (p.startsWith('/usuarios')) return 'administracion_usuarios';
  if (p.startsWith('/empleados')) return 'empleados';
  if (p.startsWith('/contratos')) return 'contratos';
  if (p.startsWith('/incapacidades')) return 'incapacidades';
  if (p.startsWith('/prestaciones')) return 'prestaciones_sociales';
  if (p.startsWith('/afiliaciones')) return 'afiliaciones';
  if (p.startsWith('/certificaciones')) return 'certificaciones';
  if (p.startsWith('/inasistencias')) return 'inasistencias';
  if (p.startsWith('/actividades') || p.startsWith('/calendario')) return 'calendario';
  if (p.startsWith('/reportes')) return 'reportes';
  if (p.startsWith('/comunicaciones-disciplinarias')) return 'disciplinarias';

  return 'general';
}

/**
 * Para GET /chat/ayuda: `null` = sin query (catálogo de módulos). Si hay pantalla concreta, su clave.
 */
export function moduloInicialQueryDesdePathname(pathname) {
  const m = mapearPathnameAModulo(pathname);
  return m === 'general' ? null : m;
}

function entradasAyudaActivas(data) {
  const raw = data?.data;
  if (!Array.isArray(raw)) return [];
  return raw.filter((x) => x && (x.activo === undefined || x.activo === true || x.activo === 1));
}

/** Normaliza sugerencias_rapidas del backend → chips con texto a enviar en POST mensajes. */
export function normalizarSugerenciasRapidas(respuestaAyuda) {
  const raw = respuestaAyuda?.sugerencias_rapidas;
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (let i = 0; i < raw.length; i += 1) {
    const x = raw[i];
    if (!x || typeof x !== 'object') continue;
    const enviar = String(x.enviar ?? x.contenido ?? '').trim();
    if (!enviar) continue;
    const etiqueta = String(x.etiqueta ?? x.label ?? x.titulo ?? enviar).trim() || enviar;
    out.push({
      key: `sr-${x.cod_entrada_ayuda ?? i}-${enviar.slice(0, 40)}`,
      etiqueta,
      enviar,
      cod_entrada_ayuda: x.cod_entrada_ayuda,
      modulo: x.modulo,
    });
  }
  return out;
}

/**
 * Chips opcionales desde data[].palabras_sugeridas (mismo contenido que escribiría el usuario).
 */
export function chipsPalabrasDesdeEntradas(entradasData, limite = 28) {
  if (!Array.isArray(entradasData) || entradasData.length === 0) return [];
  const seen = new Set();
  const out = [];
  for (const e of entradasData) {
    const arr = e?.palabras_sugeridas;
    if (!Array.isArray(arr)) continue;
    for (const w of arr) {
      const t = String(w ?? '').trim();
      if (!t) continue;
      const k = t.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({
        key: `pw-${k}-${out.length}`,
        etiqueta: t,
        enviar: t,
      });
      if (out.length >= limite) return out;
    }
  }
  return out;
}

export function procesarRespuestaAyuda(respuestaAyuda) {
  const entradas = entradasAyudaActivas(respuestaAyuda).filter((e) => !esEntradaAyudaTecnica(e));
  const sugerenciasRapidas = normalizarSugerenciasRapidas(respuestaAyuda).filter(
    (s) => !esTextoTecnicoVisible(s.etiqueta, s.enviar),
  );
  const yaEnRapidas = new Set(sugerenciasRapidas.map((s) => s.enviar.toLowerCase()));
  const chipsPalabras = chipsPalabrasDesdeEntradas(entradas, 32)
    .filter((c) => !yaEnRapidas.has(String(c.enviar).toLowerCase()))
    .filter((c) => !esTextoTecnicoVisible(c.etiqueta, c.enviar));
  return {
    entradas,
    sugerenciasRapidas,
    chipsPalabras,
  };
}
