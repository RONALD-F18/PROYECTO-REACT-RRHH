import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAttendanceCalendar,
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
    estado: 'ausente',
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

test('payload conserva tipo tardanza aunque el motivo sea libre', () => {
  const payload = construirPayloadInasistencia({
    motivo: 'Trancon fuerte',
    estado: 'tardanza',
    fecha: '2026-03-12',
    cod_empleado: '1003',
    observaciones: '',
    justificado: false,
  });
  assert.equal(payload.motivo_inasistencia, 'Tardanza - Trancon fuerte');
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

test('calendario: ingreso en mitad del mes actual sin novedades', () => {
  const { days, totals } = buildAttendanceCalendar({
    year: 2026,
    month: 3,
    fechaIngreso: '2026-03-15',
    inasistencias: [],
    today: '2026-03-20',
  });
  const status = (d) => days.find((x) => x.date === d)?.status;
  assert.equal(status('2026-03-01'), 'no_aplica');
  assert.equal(status('2026-03-14'), 'no_aplica');
  assert.equal(status('2026-03-15'), 'presente');
  assert.equal(status('2026-03-20'), 'presente');
  assert.equal(status('2026-03-21'), 'pendiente');
  assert.deepEqual(totals, { presentes: 6, inasistencias: 0, noAplica: 14, pendientes: 11 });
});

test('calendario: mes siguiente completo queda pendiente', () => {
  const { totals } = buildAttendanceCalendar({
    year: 2026,
    month: 4,
    fechaIngreso: '2026-01-01',
    inasistencias: [],
    today: '2026-03-20',
  });
  assert.deepEqual(totals, { presentes: 0, inasistencias: 0, noAplica: 0, pendientes: 30 });
});

test('calendario: mes anterior al ingreso queda no_aplica', () => {
  const { totals } = buildAttendanceCalendar({
    year: 2026,
    month: 2,
    fechaIngreso: '2026-03-15',
    inasistencias: [],
    today: '2026-03-20',
  });
  assert.deepEqual(totals, { presentes: 0, inasistencias: 0, noAplica: 28, pendientes: 0 });
});

test('calendario: mes vigente con dos inasistencias descuenta presentes', () => {
  const { totals } = buildAttendanceCalendar({
    year: 2026,
    month: 3,
    fechaIngreso: '2026-03-01',
    inasistencias: [
      { fecha_inasistencia: '2026-03-05', motivo_inasistencia: 'Enfermedad' },
      { fecha_inasistencia: '2026-03-12', motivo_inasistencia: 'Tardanza - Trancon' },
    ],
    today: '2026-03-20',
  });
  assert.deepEqual(totals, { presentes: 18, inasistencias: 2, noAplica: 0, pendientes: 11 });
});
