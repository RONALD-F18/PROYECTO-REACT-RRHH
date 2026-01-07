/**
 * Componente de tarjeta de información
 */
function TarjetaInfo({ titulo, children, className = '' }) {
  return (
    <div className={`tarjeta-info ${className}`}>
      {titulo && <h3 className="tarjeta-info-titulo">{titulo}</h3>}
      <div className="tarjeta-info-contenido">{children}</div>
    </div>
  );
}

/**
 * Componente de fila de información
 */
function FilaInfo({ etiqueta, valor }) {
  return (
    <div className="fila-info">
      <span className="fila-info-etiqueta">{etiqueta}</span>
      <span className="fila-info-valor">{valor}</span>
    </div>
  );
}

export { TarjetaInfo, FilaInfo };
