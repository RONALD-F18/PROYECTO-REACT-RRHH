import '../../estilos/componentes/tabs.css';

/**
 * Componente reutilizable de tabs/pestañas
 * @param {Array} tabs - Array de objetos { id, etiqueta, icono? } (icono: texto o nodo opcional)
 * @param {string} activa - ID del tab activo
 * @param {function} onChange - Función callback cuando se cambia de tab
 */
function Tabs({ tabs = [], activa, onChange }) {
  return (
    <div className="tabs-contenedor">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-item ${activa === tab.id ? 'tab-activo' : ''}`}
          onClick={() => onChange && onChange(tab.id)}
        >
          {tab.icono != null && tab.icono !== '' ? (
            <span className="tab-item-icono" aria-hidden>
              {tab.icono}
            </span>
          ) : null}
          <span className="tab-item-etiqueta">{tab.etiqueta}</span>
        </button>
      ))}
    </div>
  );
}

export default Tabs;

