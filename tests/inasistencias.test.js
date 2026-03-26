import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularKpisInasistencias,
  construirPayloadInasistencia,
  extraerMensajeValidacion,
  filtrarInasistencias,
} from '../src/modulos/inasistencias/utils/inasistencias.mapper.js';

test('render de listado: filtra por empleado y mes', () => {
  const lista = [
    { cod_inasistencias: 1, cod_empleado: 1003, fecha_inasistencia: '2026-03-12', motivo_inasistencia: 'Enfermedad', justificado: 'SI' },
    { cod_inasistencias: 2, cod_empleado: 1003, fecha_inasistencia: '2026-04-01', motivo_inasistencia: 'Llegada tarde', justificado: 'NO' },
    { cod_inasistencias: 3, cod_empleado: 1005, fecha_inasistencia: '2026-03-08', motivo_inasistencia: 'Permiso', justificado: 'SI' },
  ];
  const out = filtrarInasistencias(lista, { codEmpleado: '1003', mes: '3', anio: '2026', tipo: '' });
  assert.equal(out.length, 1);
  assert.equal(out[0].cod_inasistencias, 1);
});

test('submit valido: construye payload para backend Laravel', () => {
  const payload = construirPayloadInasistencia({
    motivo: 'Enfermedad',
    fecha: '2026-03-12',
    cod_empleado: '1003',
    observaciones: 'Reposo medico',
    justificado: true,
  });
  assert.deepEqual(payload, {
    motivo_inasistencia: 'Enfermedad',
    fecha_inasistencia: '2026-03-12',
    cod_empleado: 1003,
    observaciones: 'Reposo medico',
    justificado: 'SI',
  });
});

test('manejo 422: extrae mensaje por campo', () => {
  const err = {
    validation: {
      errors: {
        motivo_inasistencia: ['El motivo es obligatorio.'],
      },
    },
  };
  assert.equal(extraerMensajeValidacion(err, 'motivo_inasistencia'), 'El motivo es obligatorio.');
  assert.equal(extraerMensajeValidacion(err, 'fecha_inasistencia'), '');
});

test('kpis: calcula ausencias, tardanzas y justificadas', () => {
  const lista = [
    { motivo_inasistencia: 'Enfermedad', justificado: 'SI' },
    { motivo_inasistencia: 'Llegada tarde', justificado: 'NO' },
  ];
  const k = calcularKpisInasistencias(lista, [{}, {}]);
  assert.equal(k.total, 2);
  assert.equal(k.ausencias, 1);
  assert.equal(k.retardos, 1);
  assert.equal(k.justificadas, 1);
  assert.equal(k.empleados, 2);
});
