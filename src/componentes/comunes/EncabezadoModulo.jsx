import BotonMenu from './BotonMenu';
import IconoBuho from './IconoBuho';

/**
 * Componente de encabezado para módulos
 * @param {'mas' | 'volver'} varianteIconoBoton - Icono del botón principal (por defecto + para acciones nuevas, ← para volver)
 * @param {React.ReactNode} contenidoDerechaAdicional - Botones extra antes del menú (p. ej. Editar / Eliminar en vistas detalle)
 */
function EncabezadoModulo({
  titulo,
  subtitulo,
  textoBoton,
  alHacerClic,
  mostrarBoton = true,
  varianteIconoBoton = 'mas',
  contenidoDerechaAdicional = null,
  className = '',
}) {
  return (
    <header className={`encabezado-modulo ${className}`.trim()}>
      <div className="encabezado-modulo-izquierda">
        <div className="encabezado-modulo-logo">
          <IconoBuho className="encabezado-modulo-logo-icono" title="Talent Sphere" />
          <span className="encabezado-modulo-logo-texto">Talent Sphere</span>
        </div>
        <div className="encabezado-modulo-info">
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>
      </div>
      <div className="encabezado-modulo-derecha">
        {mostrarBoton && (
          <button type="button" className="encabezado-modulo-btn" onClick={alHacerClic}>
            {varianteIconoBoton === 'volver' ? (
              <span className="encabezado-modulo-btn-icono encabezado-modulo-btn-icono--volver" aria-hidden>
                ←
              </span>
            ) : (
              <span className="encabezado-modulo-btn-icono" aria-hidden>
                +
              </span>
            )}
            <span className="encabezado-modulo-btn-texto">{textoBoton}</span>
          </button>
        )}
        {contenidoDerechaAdicional}
        <BotonMenu />
      </div>
    </header>
  );
}

export default EncabezadoModulo;
