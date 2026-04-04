function toNullableNumber(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function buildCertificacionPayload(formulario) {
  const incluyeSalario = !!formulario.incluye_salario;
  return {
    id_empresa: Number(formulario.id_empresa),
    cod_empleado: Number(formulario.cod_empleado),
    cod_contrato: toNullableNumber(formulario.cod_contrato),
    tipo_certificacion: String(formulario.tipo_certificacion ?? '').trim().slice(0, 30).toUpperCase(),
    incluye_salario: incluyeSalario,
    salario_certificado: incluyeSalario ? toNullableNumber(formulario.salario_certificado) : null,
    cod_eps: toNullableNumber(formulario.cod_eps),
    cod_arl: toNullableNumber(formulario.cod_arl),
    cod_pension: toNullableNumber(formulario.cod_pension),
    cod_caja: toNullableNumber(formulario.cod_caja),
    cod_cesantias: toNullableNumber(formulario.cod_cesantias),
    fecha_emision: String(formulario.fecha_emision ?? '').trim().slice(0, 10),
    ciudad_emision: String(formulario.ciudad_emision ?? '').trim().slice(0, 100),
    descripcion: String(formulario.descripcion ?? '').trim() || null,
  };
}

export function extraerMensajeErroresBackend(error) {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== 'object') return '';
  return Object.values(errors).flat().filter(Boolean).join(' ');
}
