import { HashRouter } from 'react-router-dom';
import { MenuProvider } from './contextos/MenuContext';
import { EnrutadorPrincipal } from './rutas';
import LimiteError from './componentes/comunes/LimiteError.jsx';
import './estilos/index.css';

function App() {
  return (
    <HashRouter>
      <MenuProvider>
        <LimiteError>
          <EnrutadorPrincipal />
        </LimiteError>
      </MenuProvider>
    </HashRouter>
  );
}

export default App;
