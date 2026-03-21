import { BrowserRouter } from 'react-router-dom';
import { MenuProvider } from './contextos/MenuContext';
import { EnrutadorPrincipal } from './rutas';
import LimiteError from './componentes/comunes/LimiteError.jsx';
import './estilos/index.css';

function App() {
  return (
    <BrowserRouter>
      <MenuProvider>
        <LimiteError>
          <EnrutadorPrincipal />
        </LimiteError>
      </MenuProvider>
    </BrowserRouter>
  );
}

export default App;
