import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { expresionesRegulares, validarContrasena } from '../../utils/validaciones';

function InicioSesion() {
  const navegar = useNavigate();
  const [usuarioCorreo, setUsuarioCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});

  const validarUsuarioCorreo = (valor) => {
    if (!valor.trim()) return "El usuario o correo es requerido";
    // Validar si es correo electrónico
    if (expresionesRegulares.correo.test(valor)) {
      return null; // Es un correo válido
    }
    // Validar si es nombre de usuario (letras, números, guión bajo, mínimo 3 caracteres)
    if (expresionesRegulares.nombreUsuario.test(valor) && valor.trim().length >= 3) {
      return null; // Es un nombre de usuario válido
    }
    return "Debe ser un correo electrónico válido o un nombre de usuario (mínimo 3 caracteres, solo letras, números y guión bajo)";
  };

  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'usuarioCorreo':
        return validarUsuarioCorreo(valor);
      case 'contrasena':
        return validarContrasena(valor);
      default:
        return null;
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    
    if (name === 'usuarioCorreo') {
      setUsuarioCorreo(value);
    } else if (name === 'contrasena') {
      setContrasena(value);
    }

    if (camposTocados[name]) {
      const error = validarCampo(name, value);
      setErrores((prev) => ({ ...prev, [name]: error }));
    }
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    setCamposTocados((prev) => ({ ...prev, [name]: true }));
    const error = validarCampo(name, value);
    setErrores((prev) => ({ ...prev, [name]: error }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const todosTocados = {};

    todosTocados.usuarioCorreo = true;
    todosTocados.contrasena = true;

    const errorUsuario = validarCampo('usuarioCorreo', usuarioCorreo);
    const errorContrasena = validarCampo('contrasena', contrasena);

    if (errorUsuario) nuevosErrores.usuarioCorreo = errorUsuario;
    if (errorContrasena) nuevosErrores.contrasena = errorContrasena;

    setCamposTocados(todosTocados);
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    if (validarFormulario()) {
      navegar('/dashboard');
    }
  };

  const obtenerClaseCampo = (nombreCampo) => {
    if (errores[nombreCampo]) return 'campo-error';
    if (camposTocados[nombreCampo] && !errores[nombreCampo] && (nombreCampo === 'usuarioCorreo' ? usuarioCorreo : contrasena)) {
      return 'campo-valido';
    }
    return '';
  };

  const mostrarMensaje = (nombreCampo) => {
    if (!camposTocados[nombreCampo]) return null;
    if (errores[nombreCampo]) {
      return <span className="mensaje-error">{errores[nombreCampo]}</span>;
    }
    if (nombreCampo === 'usuarioCorreo' ? usuarioCorreo : contrasena) {
      return <span className="mensaje-exito">✓ Correcto</span>;
    }
    return null;
  };

  return (
    <div className="login-contenedor">
      <div className="login-caja">
        <div className="login-encabezado">
          <div className="login-avatar"></div>
          <h2>Inicia Sesión para Continuar</h2>
        </div>

        <div className="login-cuerpo">
          <form onSubmit={manejarEnvio}>
            <div className="login-campo">
              <label>Usuario o Correo</label>
              <input
                type="text"
                name="usuarioCorreo"
                value={usuarioCorreo}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="ejemplo@correo.com"
                className={obtenerClaseCampo('usuarioCorreo')}
              />
              {mostrarMensaje('usuarioCorreo')}
            </div>

            <div className="login-campo">
              <label>Contraseña</label>
              <input
                type="password"
                name="contrasena"
                value={contrasena}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="••••••••••••••••••••"
                className={obtenerClaseCampo('contrasena')}
              />
              {mostrarMensaje('contrasena')}
            </div>

            <div className="login-opciones">
              <a href="#" className="login-olvido">
                ¿Olvidaste tu Contraseña?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Iniciar Sesión
            </button>
          </form>

          <p className="login-registro">
            ¿No tienes cuenta? <Link to="/registro">Crear una cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default InicioSesion;
