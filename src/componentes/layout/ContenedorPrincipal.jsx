import { useMenu } from '../../contextos/MenuContext';
import BarraLateral from './BarraLateral';
import PanelNavegacion from './PanelNavegacion';
import { useState, useEffect } from 'react';

function ContenedorPrincipal({ children }) {
  const { menuAbierto, cerrarMenu } = useMenu();
  const [esMobile, setEsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const manejarResize = () => {
      setEsMobile(window.innerWidth <= 900);
    };

    window.addEventListener('resize', manejarResize);
    return () => window.removeEventListener('resize', manejarResize);
  }, []);

  return (
    <div className="contenedor-app">
      <div className={`overlay-menu ${menuAbierto ? 'activo' : ''}`} onClick={cerrarMenu}></div>
      {!esMobile && <BarraLateral />}
      {esMobile && <PanelNavegacion />}
      <main className="contenido-principal">
        {children}
      </main>
    </div>
  );
}

export default ContenedorPrincipal;