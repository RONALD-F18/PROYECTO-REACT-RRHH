/** Valores exactos del API Laravel (empleados) */

export const TIPO_DOCUMENTO = [
  { valor: 'CC', etiqueta: 'Cédula de ciudadanía' },
  { valor: 'CE', etiqueta: 'Cédula de extranjería' },
  { valor: 'TI', etiqueta: 'Tarjeta de identidad' },
  { valor: 'PASAPORTE', etiqueta: 'Pasaporte' },
];

export const TIPO_CUENTA = [
  { valor: 'AHORROS', etiqueta: 'Ahorros' },
  { valor: 'CORRIENTE', etiqueta: 'Corriente' },
];

export const ESTADO_EMP = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'RETIRADO', etiqueta: 'Retirado' },
];

export const DISCAPACIDAD = [
  { valor: 'NINGUNA', etiqueta: 'Ninguna' },
  { valor: 'VISUAL', etiqueta: 'Visual' },
  { valor: 'AUDITIVA', etiqueta: 'Auditiva' },
  { valor: 'MOTORA', etiqueta: 'Motora' },
  { valor: 'COGNITIVA', etiqueta: 'Cognitiva' },
];

export const ESTADO_CIVIL = [
  { valor: 'SOLTERO', etiqueta: 'Soltero(a)' },
  { valor: 'CASADO', etiqueta: 'Casado(a)' },
  { valor: 'VIUDO', etiqueta: 'Viudo(a)' },
  { valor: 'DIVORCIADO', etiqueta: 'Divorciado(a)' },
  { valor: 'UNION_LIBRE', etiqueta: 'Unión libre' },
];

export const GRUPO_SANGUINEO = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

const mapa = (lista, clave = 'valor', texto = 'etiqueta') => {
  const m = new Map();
  for (const item of lista) {
    if (item && typeof item === 'object') m.set(item[clave], item[texto]);
  }
  return m;
};

const mapaGrupo = new Map(GRUPO_SANGUINEO.map((g) => [g, g]));

export function etiquetaTipoDocumento(v) {
  if (v == null || v === '') return '—';
  return mapa(TIPO_DOCUMENTO).get(String(v).toUpperCase()) ?? String(v);
}

export function etiquetaTipoCuenta(v) {
  if (v == null || v === '') return '—';
  const s = String(v).toUpperCase();
  return mapa(TIPO_CUENTA).get(s) ?? String(v);
}

export function etiquetaEstadoEmp(v) {
  if (v == null || v === '') return '—';
  const s = String(v).toUpperCase();
  if (s === 'INACTIVO') return 'Retirado';
  return mapa(ESTADO_EMP).get(s) ?? String(v);
}

export function etiquetaDiscapacidad(v) {
  if (v == null || v === '') return '—';
  const s = String(v).toUpperCase();
  return mapa(DISCAPACIDAD).get(s) ?? String(v);
}

export function etiquetaEstadoCivil(v) {
  if (v == null || v === '') return '—';
  const s = String(v).toUpperCase();
  return mapa(ESTADO_CIVIL).get(s) ?? String(v);
}

export function etiquetaGrupoSanguineo(v) {
  if (v == null || v === '') return '—';
  return mapaGrupo.get(String(v).toUpperCase()) ?? String(v);
}
