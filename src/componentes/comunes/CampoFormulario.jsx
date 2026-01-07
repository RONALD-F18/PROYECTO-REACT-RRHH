/**
 * Componente de campo de formulario reutilizable
 */
function CampoFormulario({
  etiqueta,
  tipo = 'text',
  nombre,
  valor,
  placeholder,
  opciones = [],
  onChange,
  requerido = false,
  error = '',
  className = '',
}) {
  const manejarCambio = (evento) => {
    if (onChange) {
      onChange(evento);
    }
  };

  const renderizarCampo = () => {
    switch (tipo) {
      case 'select':
        return (
          <select name={nombre} value={valor} onChange={manejarCambio}>
            <option value="">Seleccione...</option>
            {opciones.map((opcion, indice) => (
              <option key={indice} value={opcion.valor || opcion}>
                {opcion.texto || opcion}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            name={nombre}
            value={valor}
            placeholder={placeholder}
            onChange={manejarCambio}
            rows={4}
          />
        );
      default:
        return (
          <input
            type={tipo}
            name={nombre}
            value={valor}
            placeholder={placeholder}
            onChange={manejarCambio}
          />
        );
    }
  };

  return (
    <div className={`campo-formulario ${error ? 'campo-error' : ''} ${className}`}>
      <label>
        {etiqueta}
        {requerido && <span className="requerido">*</span>}
      </label>
      {renderizarCampo()}
      {error && <span className="mensaje-error">{error}</span>}
    </div>
  );
}

export default CampoFormulario;
