import '../../estilos/componentes/sin-datos.css';

/**
 * Componente reutilizable para mostrar mensajes cuando no hay datos
 * @param {string} mensaje - Mensaje a mostrar (opcional, por defecto "No se encontraron datos")
 */
function SinDatos({ mensaje = 'No se encontraron datos' }) {
  return (
    <div className="sin-datos">
      <p>{mensaje}</p>
    </div>
  );
}

export default SinDatos;

