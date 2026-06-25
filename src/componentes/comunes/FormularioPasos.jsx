import { useEffect, useMemo, useState } from 'react';
import { useSolicitarCierreModal } from './Modal';

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
  prevenirSubmitConEnter = true,
  children,
}) {
  const [pasoActualState, setPasoActualState] = useState(pasoInicial);
  const [navegandoPaso, setNavegandoPaso] = useState(false);
  const [bloqueoSubmitTransicion, setBloqueoSubmitTransicion] = useState(false);
  const pasoActual = pasoActualProp ?? pasoActualState;
  const setPasoActual = setPasoActualProp ?? setPasoActualState;

  const total = pasos.length;
  const esPrimero = pasoActual === 0;
  const esUltimo = pasoActual === total - 1;

  const paso = useMemo(() => pasos[pasoActual] ?? null, [pasos, pasoActual]);

  useEffect(() => {
    if (!esUltimo) {
      setBloqueoSubmitTransicion(false);
      return;
    }
    // Evita que clics muy rapidos en "Siguiente" disparen submit al entrar al ultimo paso.
    setBloqueoSubmitTransicion(true);
    const timer = setTimeout(() => setBloqueoSubmitTransicion(false), 450);
    return () => clearTimeout(timer);
  }, [esUltimo, pasoActual]);

  const manejarKeyDownCapture = (e) => {
    if (!prevenirSubmitConEnter) return;
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
    const target = e.target;
    const tag = target?.tagName?.toLowerCase?.();
    if (tag === 'textarea') return;
    if (target?.isContentEditable) return;
    e.preventDefault();
  };

  const irSiguiente = async () => {
    if (enviando || navegandoPaso) return;
    if (!paso) return;
    setNavegandoPaso(true);
    try {
      if (validarAntesDeSiguiente) {
        const ok = await validarAntesDeSiguiente(pasoActual);
        if (!ok) return;
      }
      if (!esUltimo) setPasoActual((p) => p + 1);
    } finally {
      setTimeout(() => setNavegandoPaso(false), 120);
    }
  };

  const irAnterior = () => {
    if (enviando || navegandoPaso) return;
    if (!esPrimero) setPasoActual((p) => p - 1);
  };

  const solicitarCierreModal = useSolicitarCierreModal();

  const manejarCancelar = () => {
    if (solicitarCierreModal) {
      void solicitarCierreModal();
      return;
    }
    onCancelar?.();
  };

  if (!paso) return null;

  return (
    <div className="formulario-pasos" onKeyDownCapture={manejarKeyDownCapture}>
      <div className="seccion-formulario-header" style={{ marginTop: 0 }}>
        <div className={`seccion-formulario-numero ${paso.color || 'morado'}`}>{paso.numero}</div>
        <h3 className="seccion-formulario-titulo">{paso.titulo}</h3>
      </div>

      <div className="formulario-pasos-contenido">{children ?? paso.contenido}</div>

      <div className="modal-acciones modal-acciones--formulario-pasos">
        <button type="button" className="btn-cancelar" onClick={manejarCancelar} disabled={enviando}>
          {textoCancelar}
        </button>

        <div className="formulario-pasos-navegacion" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!esPrimero ? (
            <button type="button" className="btn-cancelar" onClick={irAnterior} disabled={enviando || navegandoPaso}>
              {textoAnterior}
            </button>
          ) : null}
          {esUltimo ? (
            <button type="submit" className="btn-guardar" disabled={enviando || navegandoPaso || bloqueoSubmitTransicion}>
              {enviando ? 'Guardando…' : textoGuardar}
            </button>
          ) : (
            <button type="button" className="btn-guardar" onClick={irSiguiente} disabled={enviando || navegandoPaso}>
              {textoSiguiente}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormularioPasos;

