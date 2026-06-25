import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarPresentacionChatPost } from '../src/modulos/chat/utils/normalizarPresentacionChat.js';

describe('normalizarPresentacionChatPost', () => {
  it('lee chips de data.sugerencias_relacionadas del POST', () => {
    const data = {
      sugerencias_relacionadas: [
        { etiqueta: 'Memorando', enviar: 'Cómo crear un memorando' },
        { etiqueta: 'Estados', enviar: 'Emitido y notificado' },
      ],
      presentacion_chat: {
        registro_estilo: 'mensajeria',
        sugerencias_relacionadas: {
          ubicacion: 'debajo_ultimo_mensaje_usuario',
          alineacion: 'inicio',
          columna: 'asistente_izquierda',
          nota: 'meta layout',
        },
      },
    };

    const prep = normalizarPresentacionChatPost(data);
    assert.equal(prep.registroEstilo, 'mensajeria');
    assert.equal(prep.chips.length, 2);
    assert.equal(prep.chips[0].enviar, 'Cómo crear un memorando');
    assert.equal(prep.sugerenciasMeta?.ubicacion, 'debajo_ultimo_mensaje_usuario');
  });

  it('funciona sin presentacion_chat si hay sugerencias top-level', () => {
    const prep = normalizarPresentacionChatPost({
      sugerencias_relacionadas: [{ etiqueta: 'Faltas', enviar: 'Registrar una falta' }],
    });
    assert.equal(prep.chips.length, 1);
    assert.equal(prep.registroEstilo, 'mensajeria');
  });
});
