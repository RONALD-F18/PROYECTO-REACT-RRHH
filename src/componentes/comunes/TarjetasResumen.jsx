import '../../estilos/componentes/tarjetas-resumen.css';

/**
 * Componente reutilizable para tarjetas de resumen con iconos
 * @param {Array} tarjetas - Array de objetos {etiqueta, valor, color, icono}
 */
function TarjetasResumen({ tarjetas = [] }) {
  return (
    <div className="tarjetas-resumen-contenedor">
      {tarjetas.map((tarjeta, indice) => (
        <div key={indice} className="tarjeta-resumen-con-icono">
          <div className={`tarjeta-resumen-icono tarjeta-resumen-icono-${tarjeta.color}`}>
            {tarjeta.icono}
          </div>
          <div className="tarjeta-resumen-contenido">
            <span className="tarjeta-resumen-etiqueta">{tarjeta.etiqueta}</span>
            <span className={`tarjeta-resumen-valor tarjeta-resumen-valor-${tarjeta.color}`}>
              {tarjeta.valor}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TarjetasResumen;

