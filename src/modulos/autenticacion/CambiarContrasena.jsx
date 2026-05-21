import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { restablecerContrasenaConToken } from '../../services/contrasena';
import { validarContrasena, validarConfirmarContrasena } from '../../utils/validaciones';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';

function leerParametrosEnlace(searchParams) {
  const token = String(searchParams.get('token') ?? '').trim();
  const email = String(
    searchParams.get('email') ?? searchParams.get('email_usuario') ?? '',
  ).trim();
  return { token, email };
}

function CambiarContrasena() {
  const [searchParams] = useSearchParams();
  const { token, email } = useMemo(() => leerParametrosEnlace(searchParams), [searchParams]);
  const enlaceValido = Boolean(token && email);

  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [tocados, setTocados] = useState({});
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [exito, setExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const refExito = useRef(null);
  const bloqueoEnvio = useRef(false);

  const validarCampo = (nombre, valor) => {
    if (nombre === 'contrasena') return validarContrasena(valor);
    if (nombre === 'confirmar') return validarConfirmarContrasena(valor, contrasena);
    return null;
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setErrorServidor('');
    setTokenInvalido(false);
    if (name === 'contrasena') {
      setContrasena(value);
      if (tocados.contrasena) {
        setErrores((prev) => ({ ...prev, contrasena: validarContrasena(value) }));
      }
      if (tocados.confirmar) {
        setErrores((prev) => ({
          ...prev,
          confirmar: validarConfirmarContrasena(confirmar, value),
        }));
      }
    }
    if (name === 'confirmar') {
      setConfirmar(value);
      if (tocados.confirmar) {
        setErrores((prev) => ({
          ...prev,
          confirmar: validarConfirmarContrasena(value, contrasena),
        }));
      }
    }
  };

  const manejarBlur = (e) => {
    const { name, value } = e.target;
    setTocados((prev) => ({ ...prev, [name]: true }));
    const err =
      name === 'confirmar'
        ? validarConfirmarContrasena(value, contrasena)
        : validarCampo(name, value);
    setErrores((prev) => ({ ...prev, [name]: err }));
  };

  const validarFormulario = () => {
    const errPass = validarContrasena(contrasena);
    const errConf = validarConfirmarContrasena(confirmar, contrasena);
    setTocados({ contrasena: true, confirmar: true });
    setErrores({
      contrasena: errPass,
      confirmar: errConf,
    });
    return !errPass && !errConf;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!enlaceValido || bloqueoEnvio.current) return;
    if (!validarFormulario()) return;

    bloqueoEnvio.current = true;
    setEnviando(true);
    setErrorServidor('');
    setTokenInvalido(false);

    try {
      const resultado = await restablecerContrasenaConToken({
        email_usuario: email,
        token,
        contrasena_usuario: contrasena,
        contrasena_usuario_confirmation: confirmar,
      });
      const texto =
        resultado.mensajeServidor ||
        'Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.';
      setMensajeExito(texto);
      setExito(true);
      window.setTimeout(() => refExito.current?.focus(), 0);
    } catch (errApi) {
      const status = errApi?.response?.status;
      if (status === 422) {
        setTokenInvalido(true);
        setErrorServidor(
          mensajeErrorApi(errApi) ||
            'El enlace no es válido o ya expiró. Solicita un nuevo correo de recuperación.',
        );
      } else {
        setErrorServidor(mensajeErrorApi(errApi));
      }
    } finally {
      setEnviando(false);
      bloqueoEnvio.current = false;
    }
  };

  const claseCampo = (nombre) => (errores[nombre] ? 'campo-error' : '');

  return (
    <div className="login-contenedor">
      <div className="login-caja">
        <div className="login-encabezado">
          <div className="login-avatar" />
          <h2>Nueva contraseña</h2>
        </div>

        <div className="login-cuerpo">
          {!enlaceValido ? (
            <div className="login-alerta login-alerta--error" role="alert">
              <div className="login-alerta-cuerpo">
                <strong className="login-alerta-titulo">Enlace inválido o incompleto</strong>
                <p className="login-alerta-mensaje">
                  Solicita un nuevo correo desde la pantalla de recuperación de contraseña.
                </p>
              </div>
            </div>
          ) : null}

          {!enlaceValido ? (
            <Link
              to="/recuperar-contrasena"
              className="login-btn"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}
            >
              Ir a recuperar contraseña
            </Link>
          ) : null}

          {enlaceValido && exito ? (
            <div ref={refExito} tabIndex={-1}>
              <div className="login-alerta login-alerta--exito" role="status">
                <div className="login-alerta-cuerpo">
                  <strong className="login-alerta-titulo login-alerta-titulo--exito">Listo</strong>
                  <p className="login-alerta-mensaje login-alerta-mensaje--exito">{mensajeExito}</p>
                </div>
              </div>
              <Link
                to="/login"
                className="login-btn"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 20 }}
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : null}

          {enlaceValido && !exito ? (
            <form onSubmit={manejarEnvio} aria-busy={enviando} noValidate>
              <p
                className="recuperar-contrasena-estado"
                aria-live="polite"
                style={{
                  margin: '0 0 16px',
                  fontSize: 'var(--texto-sm)',
                  color: 'var(--color-texto-claro)',
                  lineHeight: 1.5,
                }}
              >
                {enviando ? (
                  <strong style={{ color: 'var(--color-primario)' }}>Guardando nueva contraseña…</strong>
                ) : (
                  <>
                    Cuenta: <strong>{email}</strong>. Mínimo 8 caracteres, una mayúscula y un número.
                  </>
                )}
              </p>

              {errorServidor ? (
                <div className="login-alerta login-alerta--error" role="alert">
                  <div className="login-alerta-cuerpo">
                    <strong className="login-alerta-titulo">
                      {tokenInvalido ? 'No se pudo restablecer' : 'Error'}
                    </strong>
                    <p className="login-alerta-mensaje">{errorServidor}</p>
                    {tokenInvalido ? (
                      <p className="login-alerta-mensaje" style={{ marginTop: 10 }}>
                        <Link to="/recuperar-contrasena">Solicitar un nuevo enlace</Link>
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="login-campo">
                <label htmlFor="nueva-contrasena">Nueva contraseña</label>
                <input
                  id="nueva-contrasena"
                  type={mostrarClave ? 'text' : 'password'}
                  name="contrasena"
                  value={contrasena}
                  disabled={enviando}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  placeholder="Mín. 8 caracteres, mayúscula y número"
                  className={claseCampo('contrasena')}
                  autoComplete="new-password"
                />
                {tocados.contrasena && errores.contrasena ? (
                  <span className="mensaje-error">{errores.contrasena}</span>
                ) : null}
              </div>

              <div className="login-campo">
                <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
                <input
                  id="confirmar-contrasena"
                  type={mostrarClave ? 'text' : 'password'}
                  name="confirmar"
                  value={confirmar}
                  disabled={enviando}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  placeholder="Repita la contraseña"
                  className={claseCampo('confirmar')}
                  autoComplete="new-password"
                />
                {tocados.confirmar && errores.confirmar ? (
                  <span className="mensaje-error">{errores.confirmar}</span>
                ) : null}
              </div>

              <label className="login-check-mostrar-clave">
                <input
                  type="checkbox"
                  checked={mostrarClave}
                  disabled={enviando}
                  onChange={(e) => setMostrarClave(e.target.checked)}
                />
                Mostrar contraseñas
              </label>

              <button type="submit" className="login-btn" disabled={enviando}>
                {enviando ? 'Guardando…' : 'Restablecer contraseña'}
              </button>

              <p className="login-registro" style={{ marginTop: 20, marginBottom: 0 }}>
                <Link to="/login">← Volver al inicio de sesión</Link>
              </p>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CambiarContrasena;
