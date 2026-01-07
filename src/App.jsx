import { BrowserRouter } from 'react-router-dom';
import { EnrutadorPrincipal } from './rutas';
import './estilos/index.css';

function App() {
  return (
    <BrowserRouter>
      <EnrutadorPrincipal />
    </BrowserRouter>
  );
}

export default App;
