import { useState } from 'react';
import '../../estilos/componentes/filtros.css';

/**
 * Componente reutilizable de filtros de búsqueda
 * @param {string} placeholderBusqueda - Placeholder para el campo de búsqueda
 * @param {Array} filtrosSelect - Array de objetos {nombre, opciones, placeholder}
 * @param {function} onFiltrar - Función callback cuando se hace clic en filtrar
 * @param {string} titulo - Título opcional del bloque de filtros
 */
function FiltrosBusqueda({ 
  placeholderBusqueda = "Buscar...",
  filtrosSelect = [],
  onFiltrar,
  titulo = null,
  className = ""
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({});

  const manejarCambioBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const manejarCambioFiltro = (nombre, valor) => {
    setFiltros(prev => ({
      ...prev,
      [nombre]: valor
    }));
  };

  const manejarFiltrar = () => {
    if (onFiltrar) {
      onFiltrar({
        busqueda,
        ...filtros
      });
    }
  };

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter') {
      manejarFiltrar();
    }
  };

  return (
    <div className={`bloque-filtros ${className}`}>
      {titulo && <h2>{titulo}</h2>}
      <div className="fila-filtros-grid">
        <div className="caja-busqueda">
          <span className="icono-busqueda"></span>
          <input
            type="text"
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={manejarCambioBusqueda}
            onKeyPress={manejarKeyPress}
          />
        </div>
        {filtrosSelect.map((filtro, indice) => (
          <select
            key={indice}
            className="filtro-select"
            value={filtros[filtro.nombre] || ''}
            onChange={(e) => manejarCambioFiltro(filtro.nombre, e.target.value)}
          >
            <option value="">{filtro.placeholder || `Todos los ${filtro.nombre}`}</option>
            {filtro.opciones.map((opcion, idx) => (
              <option key={idx} value={typeof opcion === 'string' ? opcion : opcion.valor}>
                {typeof opcion === 'string' ? opcion : opcion.texto}
              </option>
            ))}
          </select>
        ))}
        <button className="btn-filtrar" type="button" onClick={manejarFiltrar}>
          <span className="icono-busqueda"></span>
          Filtrar
        </button>
      </div>
    </div>
  );
}

export default FiltrosBusqueda;

