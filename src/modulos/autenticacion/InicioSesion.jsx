import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function InicioSesion() {
  const navegar = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recordarme, setRecordarme] = useState(false);

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    navegar('/dashboard');
  };

  return (
    <div className="login-contenedor">
      <div className="login-caja">
        <div className="login-encabezado">
          <div className="login-avatar"></div>
          <h2>Inicia Sesión para Continuar</h2>
        </div>

        <div className="login-cuerpo">
          <div className="login-campo">
            <label>Usuario o Correo</label>
            <input
              type="text"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="login-campo">
            <label>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••••••••••••••"
            />
          </div>

          <div className="login-opciones">
            <label className="login-recordar">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
              />
              <span>Recuérdame</span>
            </label>
            <a href="#" className="login-olvido">
              ¿Olvidaste tu Contraseña?
            </a>
          </div>

          <button className="login-btn" onClick={manejarEnvio}>
            Iniciar Sesión
          </button>

          <div className="login-separador">
            <span>O Continúa Con</span>
          </div>

          <div className="login-social">
            <button className="login-social-btn">Google</button>
            <button className="login-social-btn">Facebook</button>
          </div>

          <p className="login-registro">
            ¿No tienes cuenta? <Link to="/registro">Crear una cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default InicioSesion;
