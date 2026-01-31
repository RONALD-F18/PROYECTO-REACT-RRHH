import { useMenu } from '../../contextos/MenuContext';
import { useState, useEffect } from 'react';

function BotonMenu({ className = '' }) {
  const { menuAbierto, toggleMenu } = useMenu();
  const [esMobile, setEsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const manejarResize = () => {
      setEsMobile(window.innerWidth <= 900);
    };

    window.addEventListener('resize', manejarResize);
    return () => window.removeEventListener('resize', manejarResize);
  }, []);

  if (!esMobile) return null;

  return (
    <button 
      className={`btn-menu-hamburguesa ${className}`}
      onClick={toggleMenu}
      aria-label="Abrir menú"
    >
      <span className={`icono-menu ${menuAbierto ? 'activo' : ''}`}></span>
    </button>
  );
}

export default BotonMenu;


