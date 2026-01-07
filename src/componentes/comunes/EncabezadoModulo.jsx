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
          <svg width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="17" fill="url(#gradienteModulo)" />
            <ellipse cx="19" cy="19" rx="12" ry="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <ellipse cx="19" cy="19" rx="12" ry="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" transform="rotate(60 19 19)" />
            <ellipse cx="19" cy="19" rx="12" ry="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" transform="rotate(-60 19 19)" />
            <circle cx="19" cy="19" r="3" fill="#fbbf24" />
            <circle cx="12" cy="14" r="2" fill="#60a5fa" />
            <circle cx="26" cy="14" r="2" fill="#f472b6" />
            <circle cx="19" cy="27" r="2" fill="#a78bfa" />
            <defs>
              <linearGradient id="gradienteModulo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="encabezado-modulo-info">
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>
      </div>
      {mostrarBoton && (
        <button className="encabezado-modulo-btn" onClick={alHacerClic}>
          <span className="encabezado-modulo-btn-icono">+</span>
          {textoBoton}
        </button>
      )}
    </header>
  );
}

export default EncabezadoModulo;
