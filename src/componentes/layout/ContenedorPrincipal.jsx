import BarraLateral from './BarraLateral';

/**
 * Componente contenedor principal con sidebar
 */
function ContenedorPrincipal({ children }) {
  return (
    <div className="contenedor-app">
      <BarraLateral />
      <main className="contenido-principal">
        {children}
      </main>
    </div>
  );
}

export default ContenedorPrincipal;
