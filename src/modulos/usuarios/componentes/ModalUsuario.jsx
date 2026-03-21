import { useState, useEffect, useMemo } from 'react';
import Modal from '../../../componentes/comunes/Modal';
import { createUsuario, updateUsuario } from '../../../services/usuario';
import { mensajeErrorApi } from '../../../utils/mensajeErrorApi';
import { validarContrasenaUsuarioApi, REGEX_CONTRASENA_USUARIO_API } from '../../../utils/validaciones';

const formularioVacio = () => ({
  nombre_usuario: '',
  email_usuario: '',
  contrasena_usuario: '',
  cod_rol: '',
  estado_usuario: true,
});

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

function ModalUsuario({
  mostrar,
  cerrar,
  datosUsuario = null,
  alExito,
  rolesCatalogo = [],
  rolesPendientes = false,
  rolesFallo = false,
}) {
  const esEdicion = !!(datosUsuario && datosUsuario.cod_usuario != null);
  const [formulario, setFormulario] = useState(formularioVacio);
  const rolesLista = useMemo(
    () =>
      (Array.isArray(rolesCatalogo) ? rolesCatalogo : []).filter(
        (r) => r != null && typeof r === 'object' && r.cod_rol != null && r.cod_rol !== '',
      ),
    [rolesCatalogo],
  );
  const rolesCargando = mostrar && rolesPendientes;
  const rolesError = rolesFallo;
  const [guardando, setGuardando] = useState(false);
  const [errorApi, setErrorApi] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  useEffect(() => {
    if (!mostrar) return;
    setErrorApi('');
    setErrorContrasena('');
  }, [mostrar]);

  useEffect(() => {
    if (!mostrar) return;
    if (datosUsuario) {
      setFormulario({
        nombre_usuario: datosUsuario.nombre_usuario ?? datosUsuario.nombre ?? '',
        email_usuario: datosUsuario.email_usuario ?? '',
        contrasena_usuario: '',
        cod_rol: datosUsuario.cod_rol != null ? String(datosUsuario.cod_rol) : '',
        estado_usuario:
          datosUsuario.estado_usuario !== undefined ? Boolean(datosUsuario.estado_usuario) : true,
      });
    } else {
      setFormulario(formularioVacio());
    }
  }, [datosUsuario, mostrar]);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'contrasena_usuario') setErrorContrasena('');
    if (type === 'checkbox') {
      setFormulario((p) => ({ ...p, [name]: checked }));
    } else {
      setFormulario((p) => ({ ...p, [name]: value }));
    }
  };

  const manejarBlurContrasena = () => {
    const msg = validarContrasenaUsuarioApi(formulario.contrasena_usuario, { permitirVacio: esEdicion });
    setErrorContrasena(msg || '');
  };

  const manejarEnviar = async (e) => {
    e.preventDefault();
    setErrorApi('');
    setErrorContrasena('');
    const codRol = Number(formulario.cod_rol);
    if (!formulario.nombre_usuario.trim()) {
      setErrorApi('El nombre es obligatorio.');
      return;
    }
    if (!formulario.email_usuario.trim()) {
      setErrorApi('El correo es obligatorio.');
      return;
    }
    if (!Number.isFinite(codRol)) {
      setErrorApi('Elige un rol.');
      return;
    }
    const errorPass = validarContrasenaUsuarioApi(formulario.contrasena_usuario, { permitirVacio: esEdicion });
    if (errorPass) {
      setErrorContrasena(errorPass);
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        const cuerpo = {
          nombre_usuario: formulario.nombre_usuario.trim(),
          email_usuario: formulario.email_usuario.trim(),
          cod_rol: codRol,
          estado_usuario: formulario.estado_usuario,
        };
        if (formulario.contrasena_usuario.trim()) {
          cuerpo.contrasena_usuario = formulario.contrasena_usuario;
        }
        await updateUsuario(datosUsuario.cod_usuario, cuerpo);
      } else {
        await createUsuario({
          nombre_usuario: formulario.nombre_usuario.trim(),
          email_usuario: formulario.email_usuario.trim(),
          contrasena_usuario: formulario.contrasena_usuario,
          cod_rol: codRol,
          estado_usuario: formulario.estado_usuario,
        });
      }
      cerrar();
      alExito?.();
    } catch (err) {
      setErrorApi(mensajeErrorApi(err));
    } finally {
      setGuardando(false);
    }
  };

  const textoRol = (r) =>
    r && r.descripcion && String(r.descripcion).trim() ? String(r.descripcion).trim() : 'Sin descripción.';

  if (!mostrar) return null;

  return (
    <Modal
      mostrar
      cerrar={cerrar}
      titulo={esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
      classNameContenedor="modal-contenido--usuario-form"
    >
      <form onSubmit={manejarEnviar} className="formulario-usuario-api">
        {errorApi ? (
          <div className="usuario-modal-alerta usuario-modal-alerta--error" role="alert">
            <strong>No se pudo guardar</strong>
            <p>{errorApi}</p>
          </div>
        ) : null}

        {rolesError ? (
          <div className="usuario-modal-alerta usuario-modal-alerta--advertencia" role="status">
            <strong>No se cargaron los roles</strong>
            <p>Revisa sesión y el endpoint de roles en el servidor.</p>
          </div>
        ) : null}

        {rolesCargando ? (
          <p className="usuario-modal-texto-carga">Cargando roles…</p>
        ) : null}

        {!rolesCargando && !rolesError && rolesLista.length === 0 ? (
          <div className="usuario-modal-alerta usuario-modal-alerta--info" role="status">
            <strong>No hay roles</strong>
            <p>Crea roles activos en el backend.</p>
          </div>
        ) : null}

        <section className="usuario-modal-seccion">
          <h3 className="usuario-modal-seccion-titulo">
            <IconoUsuario />
            Información personal
          </h3>
          <div className="usuario-modal-grid">
            <div className="usuario-modal-campo">
              <label htmlFor="nombre_usuario">
                Nombre completo <span className="usuario-modal-requerido">*</span>
              </label>
              <input
                id="nombre_usuario"
                name="nombre_usuario"
                value={formulario.nombre_usuario}
                onChange={manejarCambio}
                placeholder="Nombre y apellido"
                autoComplete="name"
              />
            </div>
            <div className="usuario-modal-campo">
              <label htmlFor="email_usuario">
                Correo <span className="usuario-modal-requerido">*</span>
              </label>
              <input
                id="email_usuario"
                name="email_usuario"
                type="email"
                value={formulario.email_usuario}
                onChange={manejarCambio}
                placeholder="correo@empresa.com"
                autoComplete="email"
              />
            </div>
            <div
              className={`usuario-modal-campo usuario-modal-campo--ancho-completo${errorContrasena ? ' usuario-modal-campo--invalido' : ''}`}
            >
              <label htmlFor="contrasena_usuario">
                Contraseña
                {!esEdicion ? <span className="usuario-modal-requerido"> *</span> : null}
              </label>
              {esEdicion ? (
                <p className="usuario-modal-reglas-contrasena">
                  <strong>Sin cambios:</strong> no escribas nada y se mantiene la contraseña que ya tiene el usuario en el sistema.
                  <br />
                  <strong>Nueva clave:</strong> entonces sí aplica {REGEX_CONTRASENA_USUARIO_API.longitudMin}–
                  {REGEX_CONTRASENA_USUARIO_API.longitudMax} caracteres, una mayúscula y un número.
                </p>
              ) : (
                <p className="usuario-modal-reglas-contrasena">
                  Obligatoria al crear: {REGEX_CONTRASENA_USUARIO_API.longitudMin}–
                  {REGEX_CONTRASENA_USUARIO_API.longitudMax} caracteres, una mayúscula y un número.
                </p>
              )}
              <input
                id="contrasena_usuario"
                name="contrasena_usuario"
                type="password"
                value={formulario.contrasena_usuario}
                onChange={manejarCambio}
                onBlur={manejarBlurContrasena}
                placeholder={esEdicion ? 'Vacío = conservar contraseña actual' : 'Ej: MiClave2025'}
                autoComplete="new-password"
                aria-invalid={errorContrasena ? 'true' : 'false'}
                aria-describedby={errorContrasena ? 'contrasena_usuario-error' : 'contrasena_usuario-ayuda'}
              />
              {errorContrasena ? (
                <span id="contrasena_usuario-error" className="usuario-modal-error-campo" role="alert">
                  {errorContrasena}
                </span>
              ) : (
                <span id="contrasena_usuario-ayuda" className="usuario-modal-sr-only">
                  Validación de contraseña
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="usuario-modal-seccion">
          <h3 className="usuario-modal-seccion-titulo usuario-modal-seccion-titulo--sin-icono">
            Rol
          </h3>
          <p className="usuario-modal-seccion-subtitulo">
            Elige uno <span className="usuario-modal-requerido">*</span>
          </p>
          <div className="roles-opciones usuario-modal-roles">
            {rolesLista.map((r) => {
              const valor = String(r.cod_rol);
              const seleccionado = formulario.cod_rol === valor;
              const tituloRol =
                r.nombre_rol != null && String(r.nombre_rol).trim() ? String(r.nombre_rol) : `Rol ${valor}`;
              return (
                <label
                  key={valor}
                  className={`rol-opcion usuario-modal-rol-tarjeta${seleccionado ? ' activo' : ''}`}
                >
                  <input
                    type="radio"
                    name="cod_rol"
                    value={valor}
                    checked={seleccionado}
                    onChange={manejarCambio}
                  />
                  <div className="rol-contenido">
                    <span className="rol-titulo">{tituloRol}</span>
                    <span className="rol-descripcion">{textoRol(r)}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <section className="usuario-modal-seccion usuario-modal-seccion--estado">
          <h3 className="usuario-modal-seccion-titulo usuario-modal-seccion-titulo--sin-icono">
            Estado
          </h3>
          <label className="usuario-modal-toggle">
            <input
              type="checkbox"
              name="estado_usuario"
              checked={formulario.estado_usuario}
              onChange={manejarCambio}
            />
            <span className="usuario-modal-toggle-texto">
              <strong>Usuario activo</strong>
            </span>
          </label>
        </section>

        <div className="modal-acciones usuario-modal-acciones">
          <button type="submit" className="btn-guardar usuario-modal-btn-principal" disabled={guardando}>
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar' : 'Crear'}
          </button>
          <button type="button" className="btn-cancelar" onClick={cerrar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ModalUsuario;
