import { BrowserRouter } from 'react-router-dom';
import { MenuProvider } from './contextos/MenuContext';
import { EnrutadorPrincipal } from './rutas';
import './estilos/index.css';

function App() {
  return (
    <BrowserRouter>
      <MenuProvider>
        <EnrutadorPrincipal />
      </MenuProvider>
    </BrowserRouter>
  );
}

export default App;
