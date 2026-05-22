import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  crearPeticionCompartida,
  invalidarMapaEjecutoresCompartidos,
} from '../src/utils/peticionCompartida.js';

describe('crearPeticionCompartida', () => {
  it('expone invalidar() para vaciar la petición en vuelo', () => {
    const ejecutar = crearPeticionCompartida(async () => 'ok');
    assert.equal(typeof ejecutar.invalidar, 'function');
    ejecutar.invalidar();
    assert.doesNotThrow(() => ejecutar.invalidar());
  });

  it('invalidarMapaEjecutoresCompartidos no lanza si falta .invalidar (bundle viejo)', () => {
    const mapa = new Map([['1|25', () => Promise.resolve('x')]]);
    assert.doesNotThrow(() => invalidarMapaEjecutoresCompartidos(mapa));
    assert.equal(mapa.size, 0);
  });
});
