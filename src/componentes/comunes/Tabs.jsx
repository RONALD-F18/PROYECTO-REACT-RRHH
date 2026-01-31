import '../../estilos/componentes/tabs.css';

/**
 * Componente reutilizable de tabs/pestañas
 * @param {Array} tabs - Array de objetos {id, etiqueta}
 * @param {string} activa - ID del tab activo
 * @param {function} onChange - Función callback cuando se cambia de tab
 */
function Tabs({ tabs = [], activa, onChange }) {
  return (
    <div className="tabs-contenedor">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activa === tab.id ? 'tab-activo' : ''}`}
          onClick={() => onChange && onChange(tab.id)}
        >
          {tab.etiqueta}
        </button>
      ))}
    </div>
  );
}

export default Tabs;

