import '../../estilos/componentes/tarjeta-informacion.css';

/**
 * Componente reutilizable para tarjetas de información con header de color
 * @param {string} titulo - Título de la sección
 * @param {string} color - Color del header (azul, verde, morado, rojo, amarillo)
 * @param {Array} campos - Array de objetos {etiqueta, valor}
 * @param {ReactNode} children - Contenido adicional opcional
 */
function TarjetaInformacion({ titulo, color = 'azul', campos = [], children }) {
  return (
    <div className={`tarjeta-informacion tarjeta-informacion-${color}`}>
      <div className={`tarjeta-informacion-header tarjeta-informacion-header-${color}`}>
        <h3 className="tarjeta-informacion-titulo">{titulo}</h3>
      </div>
      <div className="tarjeta-informacion-contenido">
        {campos.map((campo, indice) => (
          <div key={indice} className="tarjeta-informacion-campo">
            <span className="tarjeta-informacion-etiqueta">{campo.etiqueta}</span>
            <span className="tarjeta-informacion-valor">{campo.valor}</span>
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}

export default TarjetaInformacion;

