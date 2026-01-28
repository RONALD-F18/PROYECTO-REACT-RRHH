import BotonMenu from './BotonMenu';

/**
 * Componente de encabezado para módulos
 */
function EncabezadoModulo({
  titulo,
  subtitulo,
  textoBoton,
  alHacerClic,
  mostrarBoton = true,
}) {
  return (
    <header className="encabezado-modulo">
      <div className="encabezado-modulo-izquierda">
        <div className="encabezado-modulo-logo">
          <span className="encabezado-modulo-logo-texto">Talent Sphere</span>
        </div>
        <div className="encabezado-modulo-info">
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>
      </div>
      <div className="encabezado-modulo-derecha">
        {mostrarBoton && (
          <button className="encabezado-modulo-btn" onClick={alHacerClic}>
            <span className="encabezado-modulo-btn-icono">+</span>
            {textoBoton}
          </button>
        )}
        <BotonMenu />
      </div>
    </header>
  );
}

export default EncabezadoModulo;
