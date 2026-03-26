import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCertificacionPayload, extraerMensajeErroresBackend } from '../src/modulos/certificaciones/utils/certificacionesPayload.js';

test('flujo create prepara payload valido para API', () => {
  const payload = buildCertificacionPayload({
    id_empresa: '1',
    cod_empleado: '7',
    cod_contrato: '22',
    tipo_certificacion: 'LABORAL',
    incluye_salario: true,
    salario_certificado: '2800000',
    cod_eps: '',
    cod_arl: '',
    cod_pension: '',
    cod_caja: '',
    cod_cesantias: '',
    fecha_emision: '2026-03-25',
    ciudad_emision: 'Medellin',
    descripcion: 'Certificacion emitida',
  });
  assert.equal(payload.id_empresa, 1);
  assert.equal(payload.cod_empleado, 7);
  assert.equal(payload.cod_contrato, 22);
  assert.equal(payload.salario_certificado, 2800000);
});

test('flujo error handling concatena errores Laravel', () => {
  const fakeError = {
    response: {
      data: {
        errors: {
          cod_empleado: ['El empleado es obligatorio'],
          fecha_emision: ['La fecha no es valida'],
        },
      },
    },
  };
  const msg = extraerMensajeErroresBackend(fakeError);
  assert.equal(msg, 'El empleado es obligatorio La fecha no es valida');
});
