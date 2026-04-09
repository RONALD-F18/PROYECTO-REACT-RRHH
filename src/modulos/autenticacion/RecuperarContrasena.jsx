import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expresionesRegulares } from '../../utils/validaciones';
import { solicitarEnlaceRecuperacion } from '../../services/contrasena';
import { mensajeErrorApi } from '../../utils/mensajeErrorApi';

function RecuperarContrasena() {
  const [correo, setCorreo] = useState('');
  const [tocado, setTocado] = useState(false);
  const [errorCampo, setErrorCampo] = useState('');
  const [errorServidor, setErrorServidor] = useState('');
  const [exito, setExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [correoEnviadoA, setCorreoEnviadoA] = useState('');
  const [enviando, setEnviando] = useState(false);
  const refExito = useRef(null);
  const refError = useRef(null);
  const bloqueoDobleEnvio = useRef(false);

  useEffect(() => {
    if (exito && refExito.current) {
      refExito.current.focus();
    }
  }, [exito]);

  useEffect(() => {
    if (errorServidor && refError.current) {
      refError.current.focus();
    }
  }, [errorServidor]);

  const validarCorreo = (valor) => {
    if (!valor.trim()) return 'El correo es requerido';
    if (expresionesRegulares.correo.test(valor)) return null;
    return 'Ingresa un correo electrónico válido';
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (bloqueoDobleEnvio.current) return;

    setTocado(true);
    setErrorServidor('');
    const err = validarCorreo(correo);
    setErrorCampo(err || '');
    if (err) return;

    bloqueoDobleEnvio.current = true;
    setEnviando(true);
    try {
      const resultado = await solicitarEnlaceRecuperacion(correo);
      const texto =
        resultado.mensajeServidor ||
        'Si ese correo está registrado en el sistema, recibirás un mensaje con el enlace para restablecer la contraseña.';
      setMensajeExito(texto);
      setCorreoEnviadoA(correo.trim());
      setExito(true);
    } catch (errApi) {
      setErrorServidor(mensajeErrorApi(errApi));
      setExito(false);
    } finally {
      setEnviando(false);
      bloqueoDobleEnvio.current = false;
    }
  };

  const reiniciarParaOtroCorreo = () => {
    setExito(false);
    setMensajeExito('');
    setCorreoEnviadoA('');
    setErrorServidor('');
  };

  return (
    <div className="login-contenedor">
      <div className="login-caja">
        <div className="login-encabezado">
          <div className="login-avatar"></div>
          <h2>Recuperar contraseña</h2>
        </div>

        <div className="login-cuerpo">
          <p
            className="recuperar-contrasena-estado"
            aria-live="polite"
            style={{ margin: '0 0 16px', fontSize: 'var(--texto-sm)', color: 'var(--color-texto-claro)' }}
          >
            {enviando ? (
              <strong style={{ color: 'var(--color-primario)' }}>Enviando solicitud…</strong>
            ) : exito ? (
              <strong style={{ color: '#047857' }}>Solicitud enviada correctamente.</strong>
            ) : (
              <span>Completa el correo y pulsa el botón. Verás aquí si la petición terminó bien o con error.</span>
            )}
          </p>

          {exito ? (
            <div className="recuperar-contrasena-exito" ref={refExito} tabIndex={-1}>
              <div className="login-alerta login-alerta--exito" role="status">
                <div className="login-alerta-cuerpo">
                  <strong className="login-alerta-titulo login-alerta-titulo--exito">Listo</strong>
                  <p className="login-alerta-mensaje login-alerta-mensaje--exito">{mensajeExito}</p>
                  {correoEnviadoA ? (
                    <p className="login-alerta-mensaje login-alerta-mensaje--exito" style={{ marginTop: 10 }}>
                      <strong>Correo usado:</strong> {correoEnviadoA}
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                className="recuperar-contrasena-ayuda"
                style={{
                  marginTop: 16,
                  padding: 14,
                  background: 'var(--gris-50)',
                  borderRadius: 12,
                  fontSize: 'var(--texto-sm)',
                  color: 'var(--color-texto)',
                  lineHeight: 1.55,
                }}
              >
                <strong>¿No recibe el correo?</strong>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  <li>Revise la carpeta de <strong>correo no deseado</strong> o promociones.</li>
                  <li>Espere unos minutos y vuelva a comprobar la bandeja de entrada.</li>
                  <li>
                    Si sigue sin llegar, compruebe que escribió bien el correo o pida ayuda al administrador del
                    sistema (correo del usuario y envío de mensajes deben estar bien configurados).
                  </li>
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                <button type="button" className="login-btn" onClick={reiniciarParaOtroCorreo}>
                  Enviar a otro correo
                </button>
                <Link
                  to="/login"
                  className="login-btn"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    textDecoration: 'none',
                    background: 'var(--gris-200)',
                    color: 'var(--color-texto-oscuro)',
                  }}
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={manejarEnvio} aria-busy={enviando}>
              {errorServidor ? (
                <div
                  className="login-alerta login-alerta--error"
                  role="alert"
                  ref={refError}
                  tabIndex={-1}
                >
                  <div className="login-alerta-cuerpo">
                    <strong className="login-alerta-titulo">No se pudo enviar la solicitud</strong>
                    <p className="login-alerta-mensaje">{errorServidor}</p>
                    <p className="login-alerta-mensaje" style={{ marginTop: 10, fontSize: 'var(--texto-xs)' }}>
                      Intente de nuevo más tarde. Si el problema continúa, consulte al administrador del sistema.
                    </p>
                  </div>
                </div>
              ) : null}

              <p style={{ margin: '0 0 18px', fontSize: 'var(--texto-sm)', color: 'var(--color-texto-claro)', lineHeight: 1.5 }}>
                Escriba el correo asociado a su cuenta. Si existe en el sistema, recibirá instrucciones para restablecer
                la contraseña.
              </p>

              <div className="login-campo">
                <label htmlFor="recuperar-correo">Correo</label>
                <input
                  id="recuperar-correo"
                  type="email"
                  name="correo"
                  value={correo}
                  disabled={enviando}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setErrorServidor('');
                    if (tocado) setErrorCampo(validarCorreo(e.target.value) || '');
                  }}
                  onBlur={() => {
                    setTocado(true);
                    setErrorCampo(validarCorreo(correo) || '');
                  }}
                  placeholder="ejemplo@correo.com"
                  className={errorCampo ? 'campo-error' : ''}
                  autoComplete="email"
                />
                {tocado && errorCampo ? <span className="mensaje-error">{errorCampo}</span> : null}
              </div>

              <button type="submit" className="login-btn" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar enlace'}
              </button>

              <p className="login-registro" style={{ marginTop: 20, marginBottom: 0 }}>
                <Link to="/login">← Volver al inicio de sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecuperarContrasena;
