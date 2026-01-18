import { useMenu } from '../../contextos/MenuContext';
import BarraLateral from './BarraLateral';

/**
 * Componente contenedor principal con sidebar
 */
function ContenedorPrincipal({ children }) {
  const { menuAbierto, cerrarMenu } = useMenu();

  return (
    <div className="contenedor-app">
      <div className={`overlay-menu ${menuAbierto ? 'activo' : ''}`} onClick={cerrarMenu}></div>
      <BarraLateral menuAbierto={menuAbierto} cerrarMenu={cerrarMenu} />
      <main className="contenido-principal">
        {children}
      </main>
    </div>
  );
}

export default ContenedorPrincipal;
