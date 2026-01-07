import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Registro() {
  const navegar = useNavigate();
  const [datosFormulario, setDatosFormulario] = useState({
    nombres: '',
    apellidos: '',
    nombreUsuario: '',
    tipoDocumento: '',
    numeroDocumento: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: '',
    fechaNacimiento: '',
    aceptaTerminos: false,
  });

  const manejarCambio = (evento) => {
    const { name, value, type, checked } = evento.target;
    setDatosFormulario((anterior) => ({
      ...anterior,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    navegar('/login');
  };

  const tiposDocumento = [
    { valor: 'CC', texto: 'Cédula de Ciudadanía' },
    { valor: 'CE', texto: 'Cédula de Extranjería' },
    { valor: 'TI', texto: 'Tarjeta de Identidad' },
  ];

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
                placeholder="Ingresa tu nombre"
              />
            </div>
            <div className="registro-campo">
              <label>Apellido(s)*</label>
              <input
                type="text"
                name="apellidos"
                value={datosFormulario.apellidos}
                onChange={manejarCambio}
                placeholder="Ingresa tus apellidos"
              />
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
                placeholder="Usuario único"
              />
            </div>
            <div className="registro-campo">
              <label>Tipo de Documento*</label>
              <select
                name="tipoDocumento"
                value={datosFormulario.tipoDocumento}
                onChange={manejarCambio}
              >
                <option value="">Seleccionar...</option>
                {tiposDocumento.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.texto}
                  </option>
                ))}
              </select>
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
                placeholder="Número de identificación"
              />
            </div>
            <div className="registro-campo">
              <label>Correo Electrónico*</label>
              <input
                type="email"
                name="correo"
                value={datosFormulario.correo}
                onChange={manejarCambio}
                placeholder="correo@ejemplo.com"
              />
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
                placeholder="••••••••••••"
              />
            </div>
            <div className="registro-campo">
              <label>Confirmar Contraseña*</label>
              <input
                type="password"
                name="confirmarContrasena"
                value={datosFormulario.confirmarContrasena}
                onChange={manejarCambio}
                placeholder="••••••••••••"
              />
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
                placeholder="300 123 4567"
              />
            </div>
            <div className="registro-campo">
              <label>Fecha de Nacimiento*</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={datosFormulario.fechaNacimiento}
                onChange={manejarCambio}
              />
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

          <label className="registro-terminos">
            <input
              type="checkbox"
              name="aceptaTerminos"
              checked={datosFormulario.aceptaTerminos}
              onChange={manejarCambio}
            />
            <span>
              Acepto los <a href="#">Términos y Condiciones</a> y la{' '}
              <a href="#">Política de Privacidad</a>
            </span>
          </label>

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
