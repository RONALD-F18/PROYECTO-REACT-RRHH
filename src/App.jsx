import { HashRouter } from 'react-router-dom';
import { MenuProvider } from './contextos/MenuContext';
import { CatalogosProvider } from './contextos/CatalogosContext';
import { EnrutadorPrincipal } from './rutas';
import LimiteError from './componentes/comunes/LimiteError.jsx';
import './estilos/index.css';

function App() {
  return (
    <HashRouter>
      <MenuProvider>
        <CatalogosProvider>
          <LimiteError>
            <EnrutadorPrincipal />
          </LimiteError>
        </CatalogosProvider>
      </MenuProvider>
    </HashRouter>
  );
}

export default App;
