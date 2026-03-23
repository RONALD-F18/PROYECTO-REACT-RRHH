import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { expresionesRegulares, validarContrasena } from '../../utils/validaciones';
import { haySesionLocalActiva, iniciarSesion } from '../../services/autenticacion';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';
import { getUrlRecuperacionContrasenaWeb } from '../../config/authWeb';

function InicioSesion() {
  const navegar = useNavigate();
  const urlRecuperarWeb = getUrlRecuperacionContrasenaWeb();
  const [usuarioCorreo, setUsuarioCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (haySesionLocalActiva()) {
      navegar('/dashboard', { replace: true });
    }
  }, [navegar]);

  const validarUsuarioCorreo = (valor) => {
    if (!valor.trim()) return 'El correo es requerido';
    if (expresionesRegulares.correo.test(valor)) return null;
    return 'Ingresa un correo electrónico válido';
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
    setErrorServidor('');

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

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setErrorServidor('');
    if (!validarFormulario()) return;
    setEnviando(true);
    try {
      await iniciarSesion({
        email_usuario: usuarioCorreo.trim(),
        contrasena_usuario: contrasena,
      });
      navegar('/dashboard');
    } catch (e) {
      setErrorServidor(mensajeErrorApi(e));
    } finally {
      setEnviando(false);
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
            {errorServidor ? (
              <div className="login-alerta login-alerta--error" role="alert">
                <span className="login-alerta-icono" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="login-alerta-cuerpo">
                  <strong className="login-alerta-titulo">No pudimos iniciar sesión</strong>
                  <p className="login-alerta-mensaje">{errorServidor}</p>
                </div>
              </div>
            ) : null}

            <div className="login-campo">
              <label>Correo</label>
              <input
                type="email"
                name="usuarioCorreo"
                value={usuarioCorreo}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="ejemplo@correo.com"
                className={obtenerClaseCampo('usuarioCorreo')}
                autoComplete="username"
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
                autoComplete="current-password"
              />
              {mostrarMensaje('contrasena')}
            </div>

            <div className="login-opciones">
              {urlRecuperarWeb ? (
                <a href={urlRecuperarWeb} className="login-olvido">
                  ¿Olvidaste tu contraseña?
                </a>
              ) : (
                <Link to="/recuperar-contrasena" className="login-olvido">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>

            <button type="submit" className="login-btn" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Iniciar Sesión'}
            </button>

            <Link to="/" className="login-volver-inicio">
              <span aria-hidden>←</span>
              Volver al inicio
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InicioSesion;
