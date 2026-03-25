import { useMemo, useState } from 'react';

/**
 * Componente reutilizable para formularios por pasos.
 * - Renderiza SOLO el paso actual (no todo el formulario).
 * - El botón "Guardar" es `type="submit"` para que el form padre dispare su `onSubmit`.
 */
function FormularioPasos({
  pasos = [],
  pasoInicial = 0,
  pasoActual: pasoActualProp,
  setPasoActual: setPasoActualProp,
  onCancelar,
  textoCancelar = 'Cancelar',
  textoSiguiente = 'Siguiente',
  textoAnterior = 'Anterior',
  textoGuardar = 'Guardar',
  enviando = false,
  validarAntesDeSiguiente,
  children,
}) {
  const [pasoActualState, setPasoActualState] = useState(pasoInicial);
  const pasoActual = pasoActualProp ?? pasoActualState;
  const setPasoActual = setPasoActualProp ?? setPasoActualState;

  const total = pasos.length;
  const esPrimero = pasoActual === 0;
  const esUltimo = pasoActual === total - 1;

  const paso = useMemo(() => pasos[pasoActual] ?? null, [pasos, pasoActual]);

  const irSiguiente = async () => {
    if (enviando) return;
    if (!paso) return;
    if (validarAntesDeSiguiente) {
      const ok = await validarAntesDeSiguiente(pasoActual);
      if (!ok) return;
    }
    if (!esUltimo) setPasoActual((p) => p + 1);
  };

  const irAnterior = () => {
    if (enviando) return;
    if (!esPrimero) setPasoActual((p) => p - 1);
  };

  if (!paso) return null;

  return (
    <div className="formulario-pasos">
      <div className="seccion-formulario-header" style={{ marginTop: 0 }}>
        <div className={`seccion-formulario-numero ${paso.color || 'morado'}`}>{paso.numero}</div>
        <h3 className="seccion-formulario-titulo">{paso.titulo}</h3>
      </div>

      <div className="formulario-pasos-contenido">{children ?? paso.contenido}</div>

      <div className="modal-acciones modal-acciones--formulario-pasos">
        <button type="button" className="btn-cancelar" onClick={onCancelar} disabled={enviando}>
          {textoCancelar}
        </button>

        <div className="formulario-pasos-navegacion" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!esPrimero ? (
            <button type="button" className="btn-cancelar" onClick={irAnterior} disabled={enviando}>
              {textoAnterior}
            </button>
          ) : null}
          {esUltimo ? (
            <button type="submit" className="btn-guardar" disabled={enviando}>
              {enviando ? 'Guardando…' : textoGuardar}
            </button>
          ) : (
            <button type="button" className="btn-guardar" onClick={irSiguiente} disabled={enviando}>
              {textoSiguiente}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormularioPasos;

