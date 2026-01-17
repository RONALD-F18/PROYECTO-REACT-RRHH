import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as validaciones from "../../utils/validaciones";

function Registro() {
  const navegar = useNavigate();
  const [datosFormulario, setDatosFormulario] = useState({
    nombres: "",
    apellidos: "",
    nombreUsuario: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    telefono: "",
    fechaNacimiento: "",
    aceptaTerminos: false,
  });

  const [errores, setErrores] = useState({});
  const [camposTocados, setCamposTocados] = useState({});

  const validadores = {
    nombres: validaciones.validarNombres,
    apellidos: validaciones.validarApellidos,
    nombreUsuario: validaciones.validarNombreUsuario,
    tipoDocumento: validaciones.validarTipoDocumento,
    numeroDocumento: validaciones.validarNumeroDocumento,
    correo: validaciones.validarCorreo,
    contrasena: validaciones.validarContrasena,
    confirmarContrasena: (valor) => validaciones.validarConfirmarContrasena(valor, datosFormulario.contrasena),
    telefono: validaciones.validarTelefono,
    fechaNacimiento: validaciones.validarFechaNacimiento,
    aceptaTerminos: validaciones.validarTerminos,
  };

  const validarCampo = (nombre, valor) => {
    const validador = validadores[nombre];
    return validador ? validador(valor) : null;
  };

  const manejarCambio = (evento) => {
    const { name, value, type, checked } = evento.target;
    const valorFinal = type === "checkbox" ? checked : value;

    setDatosFormulario((anterior) => ({
      ...anterior,
      [name]: valorFinal,
    }));

    if (camposTocados[name]) {
      const error = validarCampo(name, valorFinal);
      setErrores((anteriores) => ({ ...anteriores, [name]: error }));
    }

    if (name === "contrasena" && camposTocados.confirmarContrasena) {
      const errorConfirmar = validarCampo("confirmarContrasena", datosFormulario.confirmarContrasena);
      setErrores((anteriores) => ({ ...anteriores, confirmarContrasena: errorConfirmar }));
    }
  };

  const manejarBlur = (evento) => {
    const { name, value, type, checked } = evento.target;
    const valorFinal = type === "checkbox" ? checked : value;

    setCamposTocados((anteriores) => ({ ...anteriores, [name]: true }));
    const error = validarCampo(name, valorFinal);
    setErrores((anteriores) => ({ ...anteriores, [name]: error }));
  };

  const validarFormularioCompleto = () => {
    const nuevosErrores = {};
    const todosTocados = {};

    Object.keys(datosFormulario).forEach((campo) => {
      todosTocados[campo] = true;
      const error = validarCampo(campo, datosFormulario[campo]);
      if (error) nuevosErrores[campo] = error;
    });

    setCamposTocados(todosTocados);
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    if (validarFormularioCompleto()) {
      navegar("/login");
    }
  };

  const tiposDocumento = [
    { valor: "CC", texto: "Cédula de Ciudadanía" },
    { valor: "CE", texto: "Cédula de Extranjería" },
    { valor: "TI", texto: "Tarjeta de Identidad" },
  ];

  const obtenerClaseCampo = (nombreCampo) => {
    if (errores[nombreCampo]) return "campo-error";
    if (camposTocados[nombreCampo] && !errores[nombreCampo] && datosFormulario[nombreCampo]) {
      return "campo-valido";
    }
    return "";
  };

  const mostrarMensaje = (nombreCampo) => {
    if (!camposTocados[nombreCampo]) return null;
    if (errores[nombreCampo]) {
      return <span className="mensaje-error">{errores[nombreCampo]}</span>;
    }
    if (datosFormulario[nombreCampo]) {
      return <span className="mensaje-exito">✓ Correcto</span>;
    }
    return null;
  };

  return (
    <div className="registro-contenedor">
      <div className="registro-caja">
        <div className="registro-encabezado">
          <div className="registro-icono"></div>
          <h2>Registro de Usuario</h2>
          <p>Sistema de Recursos Humanos</p>
        </div>

        <div className="registro-cuerpo">
          <div className="registro-grid">
            <div className="registro-campo">
              <label>Nombre(s)*</label>
              <input
                type="text"
                name="nombres"
                value={datosFormulario.nombres}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Ingresa tu nombre"
                className={obtenerClaseCampo("nombres")}
              />
              {mostrarMensaje("nombres")}
            </div>
            <div className="registro-campo">
              <label>Apellido(s)*</label>
              <input
                type="text"
                name="apellidos"
                value={datosFormulario.apellidos}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Ingresa tus apellidos"
                className={obtenerClaseCampo("apellidos")}
              />
              {mostrarMensaje("apellidos")}
            </div>
          </div>

          <div className="registro-grid">
            <div className="registro-campo">
              <label>Nombre de Usuario*</label>
              <input
                type="text"
                name="nombreUsuario"
                value={datosFormulario.nombreUsuario}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Usuario único"
                className={obtenerClaseCampo("nombreUsuario")}
              />
              {mostrarMensaje("nombreUsuario")}
            </div>
            <div className="registro-campo">
              <label>Tipo de Documento*</label>
              <select
                name="tipoDocumento"
                value={datosFormulario.tipoDocumento}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                className={obtenerClaseCampo("tipoDocumento")}
              >
                <option value="">Seleccionar...</option>
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.texto}
                  </option>
                ))}
              </select>
              {mostrarMensaje("tipoDocumento")}
            </div>
          </div>

          <div className="registro-grid">
            <div className="registro-campo">
              <label>Número de Documento*</label>
              <input
                type="text"
                name="numeroDocumento"
                value={datosFormulario.numeroDocumento}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="Número de identificación"
                className={obtenerClaseCampo("numeroDocumento")}
              />
              {mostrarMensaje("numeroDocumento")}
            </div>
            <div className="registro-campo">
              <label>Correo Electrónico*</label>
              <input
                type="email"
                name="correo"
                value={datosFormulario.correo}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="correo@ejemplo.com"
                className={obtenerClaseCampo("correo")}
              />
              {mostrarMensaje("correo")}
            </div>
          </div>

          <div className="registro-grid">
            <div className="registro-campo">
              <label>Contraseña*</label>
              <input
                type="password"
                name="contrasena"
                value={datosFormulario.contrasena}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="••••••••••••"
                className={obtenerClaseCampo("contrasena")}
              />
              {mostrarMensaje("contrasena")}
            </div>
            <div className="registro-campo">
              <label>Confirmar Contraseña*</label>
              <input
                type="password"
                name="confirmarContrasena"
                value={datosFormulario.confirmarContrasena}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="••••••••••••"
                className={obtenerClaseCampo("confirmarContrasena")}
              />
              {mostrarMensaje("confirmarContrasena")}
            </div>
          </div>

          <div className="registro-grid">
            <div className="registro-campo">
              <label>Teléfono (Opcional)</label>
              <input
                type="tel"
                name="telefono"
                value={datosFormulario.telefono}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                placeholder="3001234567"
                className={obtenerClaseCampo("telefono")}
              />
              {mostrarMensaje("telefono")}
            </div>
            <div className="registro-campo">
              <label>Fecha de Nacimiento*</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={datosFormulario.fechaNacimiento}
                onChange={manejarCambio}
                onBlur={manejarBlur}
                className={obtenerClaseCampo("fechaNacimiento")}
              />
              {mostrarMensaje("fechaNacimiento")}
            </div>
          </div>

          <div className="registro-requisitos">
            <p>Requisitos de la Contraseña:</p>
            <ul>
              <li>Mínimo 8 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos un número</li>
            </ul>
          </div>

          <div className="registro-campo-terminos">
            <label className="registro-terminos">
              <input
                type="checkbox"
                name="aceptaTerminos"
                checked={datosFormulario.aceptaTerminos}
                onChange={manejarCambio}
                onBlur={manejarBlur}
              />
              <span>
                Acepto los <a href="#">Términos y Condiciones</a> y la{" "}
                <a href="#">Política de Privacidad</a>
              </span>
            </label>
            {mostrarMensaje("aceptaTerminos")}
          </div>

          <div className="registro-botones">
            <Link to="/" className="registro-btn-cancelar">
              Cancelar
            </Link>
            <button className="registro-btn-crear" onClick={manejarEnvio}>
              Crear Cuenta
            </button>
          </div>

          <p className="registro-login">
            ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión Aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
