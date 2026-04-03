import { useCallback, useEffect, useState } from 'react';
import Modal from '../comunes/Modal';
import { codUsuarioSesionLocal, usuarioSesionLocal } from '../../services/autenticacion';
import { fusionarUsuarioEnSesion } from '../../services/sesionLocal';
import {
  cuerpoRegistroUsuario,
  getMiPerfilApi,
  updateMiPerfilApi,
} from '../../services/api/perfilApi';
import { mapaErroresValidacionPerfilUsuario, mensajeErrorApi } from '../../utils/mensajeErrorApi';
import {
  validarContrasenaUsuarioRequestActualizacion,
  validarConfirmarContrasena,
  validarNombreUsuarioRequest,
  validarEmailUsuarioRequest,
  LONGITUD_NOMBRE_USUARIO_MAX,
  LONGITUD_EMAIL_USUARIO_MAX,
} from '../../utils/validaciones';

function nombreRolDesdeRegistro(u) {
  if (!u || typeof u !== 'object') return '';
  if (typeof u.rol === 'string' && u.rol.trim()) return u.rol.trim();
  if (u.rol && typeof u.rol === 'object' && typeof u.rol.nombre_rol === 'string') return u.rol.nombre_rol;
  if (u.roles && typeof u.roles === 'object' && typeof u.roles.nombre_rol === 'string') {
    return u.roles.nombre_rol;
  }
  return '';
}

function validarConfirmacionPerfil(confirmVal, passVal) {
  const c = typeof confirmVal === 'string' ? confirmVal : '';
  const p = typeof passVal === 'string' ? passVal : '';
  if (!p.trim()) {
    if (c.trim()) return 'Si escribes la confirmación, debes indicar también la nueva contraseña.';
    return null;
  }
  return validarConfirmarContrasena(c, p);
}

function IconoUsuario() {
  return (
    <span className="usuario-modal-icono-seccion" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M3.5 22C3.5 17.3056 7.30558 13.5 12 13.5C16.6944 13.5 20.5 17.3056 20.5 22"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * Validación en vivo (onChange + onKeyUp) alineada a `App\Http\Requests\UsuarioRequest` (actualización).
 */
function ModalMiPerfil({ mostrar, cerrar, alGuardar }) {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [codUsuario, setCodUsuario] = useState(null);
  const [codRol, setCodRol] = useState(null);
  const [estadoUsuario, setEstadoUsuario] = useState(true);
  const [rolNombre, setRolNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorApi, setErrorApi] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');
  const [errorConfirmacion, setErrorConfirmacion] = useState('');

  const limpiarErroresFormulario = useCallback(() => {
    setErrorApi('');
    setErrorNombre('');
    setErrorEmail('');
    setErrorContrasena('');
    setErrorConfirmacion('');
  }, []);

  const reiniciarCampos = useCallback(() => {
    const snap = usuarioSesionLocal();
    setNombreUsuario(snap?.nombre ?? '');
    setEmailUsuario(snap?.email ?? '');
    setContrasena('');
    setConfirmarContrasena('');
    setCodUsuario(snap?.cod ?? null);
    setCodRol(snap?.codRol ?? null);
    setEstadoUsuario(snap?.estado_usuario !== false);
    setRolNombre('');
  }, []);

  const aplicarValidacionNombre = useCallback((valor) => {
    setErrorNombre(validarNombreUsuarioRequest(valor) || '');
  }, []);

  const aplicarValidacionEmail = useCallback((valor) => {
    setErrorEmail(validarEmailUsuarioRequest(valor) || '');
  }, []);

  const aplicarValidacionContrasena = useCallback((valor) => {
    setErrorContrasena(validarContrasenaUsuarioRequestActualizacion(valor) || '');
  }, []);

  const aplicarValidacionConfirmacion = useCallback((confirmVal, passVal) => {
    setErrorConfirmacion(validarConfirmacionPerfil(confirmVal, passVal) || '');
  }, []);

  /** onChange + onKeyUp: misma lógica (teclado y pegado). */
  const manejarNombre = useCallback(
    (valor) => {
      setNombreUsuario(valor);
      setErrorApi('');
      aplicarValidacionNombre(valor);
    },
    [aplicarValidacionNombre],
  );

  const manejarEmail = useCallback(
    (valor) => {
      setEmailUsuario(valor);
      setErrorApi('');
      aplicarValidacionEmail(valor);
    },
    [aplicarValidacionEmail],
  );

  const manejarContrasena = useCallback(
    (valor) => {
      setContrasena(valor);
      setErrorApi('');
      aplicarValidacionContrasena(valor);
      aplicarValidacionConfirmacion(confirmarContrasena, valor);
    },
    [aplicarValidacionContrasena, aplicarValidacionConfirmacion, confirmarContrasena],
  );

  const manejarConfirmacion = useCallback(
    (valor) => {
      setConfirmarContrasena(valor);
      setErrorApi('');
      aplicarValidacionConfirmacion(valor, contrasena);
    },
    [aplicarValidacionConfirmacion, contrasena],
  );

  useEffect(() => {
    if (!mostrar) return;
    limpiarErroresFormulario();
    reiniciarCampos();

    const cod = codUsuarioSesionLocal();
    if (cod == null || cod === '') {
      setCargando(false);
      return;
    }

    let cancelado = false;
    (async () => {
      setCargando(true);
      try {
        const raw = await getMiPerfilApi();
        const u = cuerpoRegistroUsuario(raw);
        if (cancelado) return;
        if (!u) {
          const snap = usuarioSesionLocal();
          if (snap) {
            setCodUsuario(snap.cod ?? null);
            setNombreUsuario(snap.nombre);
            setEmailUsuario(snap.email);
            setCodRol(snap.codRol);
            setEstadoUsuario(snap.estado_usuario);
          }
          return;
        }
        setCodUsuario(u.cod_usuario ?? u.id ?? cod);
        setNombreUsuario(String(u.nombre_usuario ?? u.nombre ?? '').trim() || usuarioSesionLocal()?.nombre || '');
        setEmailUsuario(String(u.email_usuario ?? '').trim() || usuarioSesionLocal()?.email || '');
        const cr = u.cod_rol != null ? Number(u.cod_rol) : null;
        setCodRol(Number.isFinite(cr) ? cr : usuarioSesionLocal()?.codRol ?? null);
        setEstadoUsuario(u.estado_usuario !== false && u.estado_usuario !== 0 && u.estado_usuario !== '0');
        setRolNombre(nombreRolDesdeRegistro(u));
      } catch {
        if (!cancelado) {
          const snap = usuarioSesionLocal();
          if (snap) {
            setCodUsuario(snap.cod ?? null);
            setNombreUsuario(snap.nombre);
            setEmailUsuario(snap.email);
            setCodRol(snap.codRol);
            setEstadoUsuario(snap.estado_usuario);
          }
          setRolNombre('');
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [mostrar, reiniciarCampos, limpiarErroresFormulario]);

  const manejarEnviar = async (e) => {
    e.preventDefault();
    setErrorApi('');

    const errNom = validarNombreUsuarioRequest(nombreUsuario);
    if (errNom) {
      setErrorNombre(errNom);
      return;
    }
    const errMail = validarEmailUsuarioRequest(emailUsuario);
    if (errMail) {
      setErrorEmail(errMail);
      return;
    }

    const cod = codUsuario ?? codUsuarioSesionLocal();
    if (cod == null || cod === '') {
      setErrorApi('No se identificó tu usuario. Vuelve a iniciar sesión.');
      return;
    }

    const errConfIni = validarConfirmacionPerfil(confirmarContrasena, contrasena);
    if (errConfIni) {
      setErrorConfirmacion(errConfIni);
      return;
    }

    const errPass = validarContrasenaUsuarioRequestActualizacion(contrasena);
    if (errPass) {
      setErrorContrasena(errPass);
      return;
    }
    if (contrasena.trim().length > 0) {
      const errConf = validarConfirmarContrasena(confirmarContrasena, contrasena);
      if (errConf) {
        setErrorConfirmacion(errConf);
        return;
      }
    }

    setGuardando(true);
    try {
      await updateMiPerfilApi({
        nombre_usuario: nombreUsuario.trim(),
        email_usuario: emailUsuario.trim(),
        contrasena_usuario: contrasena.trim().length > 0 ? contrasena : undefined,
        contrasena_usuario_confirmation:
          contrasena.trim().length > 0 ? confirmarContrasena : undefined,
        cod_rol: codRol ?? undefined,
        estado_usuario: estadoUsuario,
      });
      fusionarUsuarioEnSesion({
        nombre_usuario: nombreUsuario.trim(),
        email_usuario: emailUsuario.trim(),
        nombre: nombreUsuario.trim(),
        email: emailUsuario.trim(),
      });
      alGuardar?.();
      cerrar();
    } catch (err) {
      if (err?.isPerfilLegacySinRol) {
        setErrorApi(err.message);
        return;
      }
      const mapa = mapaErroresValidacionPerfilUsuario(err);
      if (mapa) {
        if (mapa.nombre) setErrorNombre(mapa.nombre);
        if (mapa.email) setErrorEmail(mapa.email);
        if (mapa.contrasena) setErrorContrasena(mapa.contrasena);
        if (mapa.confirmacion) setErrorConfirmacion(mapa.confirmacion);
        if (!mapa.nombre && !mapa.email && !mapa.contrasena && !mapa.confirmacion) {
          setErrorApi(mensajeErrorApi(err));
        }
      } else {
        setErrorApi(mensajeErrorApi(err));
      }
    } finally {
      setGuardando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <Modal
      mostrar
      cerrar={cerrar}
      titulo="Mi perfil"
      classNameContenedor="modal-contenido--usuario-form modal-contenido--mi-perfil"
    >
      <form onSubmit={manejarEnviar} className="formulario-usuario-api" noValidate>
        {errorApi ? (
          <div className="usuario-modal-alerta usuario-modal-alerta--error" role="alert">
            <strong>No se pudo guardar</strong>
            <p>{errorApi}</p>
          </div>
        ) : null}

        {cargando ? <p className="usuario-modal-texto-carga">Cargando tus datos…</p> : null}

        <section className="usuario-modal-seccion">
          <h3 className="usuario-modal-seccion-titulo">
            <IconoUsuario />
            Información personal
          </h3>
          {rolNombre ? <p className="usuario-modal-rol-lectura">Rol asignado: {rolNombre}</p> : null}
          <p className="usuario-modal-mi-perfil-ayuda">
            Reglas alineadas al form request de usuarios en Laravel. Los mensajes se actualizan al escribir (cada tecla o al pegar texto).
          </p>
          <div className="usuario-modal-grid">
            <div className={`usuario-modal-campo${errorNombre ? ' usuario-modal-campo--invalido' : ''}`}>
              <label htmlFor="mi-perfil-nombre">
                Nombre de usuario <span className="usuario-modal-requerido">*</span>
              </label>
              <input
                id="mi-perfil-nombre"
                name="nombre_usuario"
                value={nombreUsuario}
                onChange={(ev) => manejarNombre(ev.target.value)}
                onKeyUp={(ev) => manejarNombre(ev.currentTarget.value)}
                onBlur={(ev) => aplicarValidacionNombre(ev.target.value)}
                placeholder="Ej: adminRonald"
                autoComplete="username"
                disabled={cargando}
                maxLength={LONGITUD_NOMBRE_USUARIO_MAX}
                aria-invalid={errorNombre ? 'true' : 'false'}
              />
              {errorNombre ? (
                <span className="usuario-modal-error-campo" role="alert">
                  {errorNombre}
                </span>
              ) : null}
            </div>
            <div className={`usuario-modal-campo${errorEmail ? ' usuario-modal-campo--invalido' : ''}`}>
              <label htmlFor="mi-perfil-email">
                Correo electrónico <span className="usuario-modal-requerido">*</span>
              </label>
              <input
                id="mi-perfil-email"
                name="email_usuario"
                type="email"
                value={emailUsuario}
                onChange={(ev) => manejarEmail(ev.target.value)}
                onKeyUp={(ev) => manejarEmail(ev.currentTarget.value)}
                onBlur={(ev) => aplicarValidacionEmail(ev.target.value)}
                placeholder="correo@empresa.com"
                autoComplete="email"
                disabled={cargando}
                maxLength={LONGITUD_EMAIL_USUARIO_MAX}
                aria-invalid={errorEmail ? 'true' : 'false'}
              />
              {errorEmail ? (
                <span className="usuario-modal-error-campo" role="alert">
                  {errorEmail}
                </span>
              ) : null}
            </div>
            <div
              className={`usuario-modal-campo usuario-modal-campo--ancho-completo${errorContrasena ? ' usuario-modal-campo--invalido' : ''}`}
            >
              <label htmlFor="mi-perfil-pass">Nueva contraseña</label>
              <p className="usuario-modal-reglas-contrasena">
                <strong>Deja en blanco</strong> para conservar la actual. Si cambias: entre 8 y 64 caracteres, como en la
                validación del servidor al actualizar.
              </p>
              <input
                id="mi-perfil-pass"
                name="contrasena_usuario"
                type="password"
                value={contrasena}
                onChange={(ev) => manejarContrasena(ev.target.value)}
                onKeyUp={(ev) => manejarContrasena(ev.currentTarget.value)}
                onBlur={(ev) => {
                  aplicarValidacionContrasena(ev.target.value);
                  aplicarValidacionConfirmacion(confirmarContrasena, ev.target.value);
                }}
                placeholder="Vacío = sin cambios"
                autoComplete="new-password"
                disabled={cargando}
                maxLength={64}
                aria-invalid={errorContrasena ? 'true' : 'false'}
              />
              {errorContrasena ? (
                <span className="usuario-modal-error-campo" role="alert">
                  {errorContrasena}
                </span>
              ) : null}
            </div>
            <div
              className={`usuario-modal-campo usuario-modal-campo--ancho-completo${errorConfirmacion ? ' usuario-modal-campo--invalido' : ''}`}
            >
              <label htmlFor="mi-perfil-pass2">
                Confirmar nueva contraseña
                {contrasena.trim().length > 0 ? <span className="usuario-modal-requerido"> *</span> : null}
              </label>
              <input
                id="mi-perfil-pass2"
                name="confirmar_contrasena_usuario"
                type="password"
                value={confirmarContrasena}
                onChange={(ev) => manejarConfirmacion(ev.target.value)}
                onKeyUp={(ev) => manejarConfirmacion(ev.currentTarget.value)}
                onBlur={(ev) => aplicarValidacionConfirmacion(ev.target.value, contrasena)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                disabled={cargando}
                maxLength={64}
                aria-invalid={errorConfirmacion ? 'true' : 'false'}
              />
              {errorConfirmacion ? (
                <span className="usuario-modal-error-campo" role="alert">
                  {errorConfirmacion}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="modal-acciones usuario-modal-acciones">
          <button type="submit" className="btn-guardar usuario-modal-btn-principal" disabled={guardando || cargando}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-cancelar" onClick={cerrar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalMiPerfil;
