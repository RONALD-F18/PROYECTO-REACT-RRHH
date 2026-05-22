import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLAVE_ACCESS_TOKEN,
  CLAVE_SESION_LOCAL,
  extraerTokenDeRespuestaLogin,
  limpiarAlmacenSesionCliente,
  obtenerTokenBearerDesdeSesion,
  persistirSesionTrasLogin,
} from '../src/services/sesionLocal.js';

const storage = new Map();

beforeEach(() => {
  storage.clear();
  globalThis.localStorage = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  };
});

afterEach(() => {
  limpiarAlmacenSesionCliente();
});

describe('extraerTokenDeRespuestaLogin', () => {
  it('lee access_token en raíz y dentro de data', () => {
    assert.equal(extraerTokenDeRespuestaLogin({ access_token: 'abc' }), 'abc');
    assert.equal(extraerTokenDeRespuestaLogin({ data: { access_token: 'xyz' } }), 'xyz');
    assert.equal(extraerTokenDeRespuestaLogin({ accessToken: 'camel' }), 'camel');
  });
});

describe('persistirSesionTrasLogin', () => {
  it('guarda access_token y rrhh_sesion_usuario', () => {
    persistirSesionTrasLogin({
      access_token: 'tok-123',
      token_type: 'Bearer',
      user: { cod_usuario: 1, nombre_usuario: 'Test' },
    });
    assert.equal(storage.get(CLAVE_ACCESS_TOKEN), 'tok-123');
    assert.equal(obtenerTokenBearerDesdeSesion(), 'tok-123');
    const sesion = JSON.parse(storage.get(CLAVE_SESION_LOCAL));
    assert.equal(sesion.access_token, 'tok-123');
    assert.equal(sesion.user.nombre_usuario, 'Test');
  });
});
