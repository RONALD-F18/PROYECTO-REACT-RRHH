import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCertificacionPayload } from '../src/modulos/certificaciones/utils/certificacionesPayload.js';

test('mapea payload y transforma opcionales a null', () => {
  const payload = buildCertificacionPayload({
    id_empresa: '1',
    cod_empleado: '10',
    cod_contrato: '',
    tipo_certificacion: 'afiliaciones',
    incluye_salario: false,
    salario_certificado: '',
    cod_eps: '',
    cod_arl: '2',
    cod_pension: '',
    cod_caja: '',
    cod_cesantias: '',
    fecha_emision: '2026-03-25',
    ciudad_emision: 'Medellin',
    descripcion: '',
  });
  assert.equal(payload.id_empresa, 1);
  assert.equal(payload.cod_empleado, 10);
  assert.equal(payload.cod_contrato, null);
  assert.equal(payload.tipo_certificacion, 'AFILIACIONES');
  assert.equal(payload.incluye_salario, false);
  assert.equal(payload.salario_certificado, null);
  assert.equal(payload.cod_arl, 2);
  assert.equal(payload.cod_eps, null);
  assert.equal(payload.descripcion, null);
});
