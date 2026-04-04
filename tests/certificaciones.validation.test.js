import test from 'node:test';
import assert from 'node:assert/strict';
import {
  estadoInicialCertificacion,
  validarCampoCertificacion,
  validarFormularioCertificacion,
} from '../src/modulos/certificaciones/utils/certificacionesValidation.js';

test('validar formulario base requiere campos criticos', () => {
  const form = estadoInicialCertificacion();
  const errores = validarFormularioCertificacion(form);
  assert.ok(errores.id_empresa);
  assert.ok(errores.documento_consulta);
  assert.ok(errores.cod_empleado);
  assert.ok(errores.fecha_emision);
  assert.ok(errores.ciudad_emision);
});

test('valida salario cuando incluye salario', () => {
  const form = estadoInicialCertificacion();
  form.incluye_salario = true;
  assert.ok(validarCampoCertificacion('salario_certificado', '', form));
  assert.equal(validarCampoCertificacion('salario_certificado', '0', form), null);
});
