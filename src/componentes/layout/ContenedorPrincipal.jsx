import { useMenu } from '../../contextos/MenuContext';
import BarraLateral from './BarraLateral';
import PanelNavegacion from './PanelNavegacion';

function ContenedorPrincipal({ children }) {
  const { menuAbierto, cerrarMenu } = useMenu();

  return (
    <div className="contenedor-app">
      <div className={`overlay-menu ${menuAbierto ? 'activo' : ''}`} onClick={cerrarMenu}></div>
      <BarraLateral menuAbierto={menuAbierto} cerrarMenu={cerrarMenu} />
      <PanelNavegacion />
      <main className="contenido-principal">
        {children}
      </main>
    </div>
  );
}

export default ContenedorPrincipal;
