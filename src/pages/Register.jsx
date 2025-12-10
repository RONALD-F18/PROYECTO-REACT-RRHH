import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    username: '',
    tipoDoc: '',
    numDoc: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    fechaNac: '',
    aceptaTerminos: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/login')
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <div className="header-circle"></div>
          <h2>Registro de Usuario</h2>
          <p>Sistema de Recursos Humanos</p>
        </div>

        <div className="register-body">
          <div className="form-grid">
            <div className="field-group">
              <label>Nombre(s)*</label>
              <input 
                type="text" 
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Briyid Tatiana"
              />
            </div>
            <div className="field-group">
              <label>Apellido(s)*</label>
              <input 
                type="text" 
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Cruz Molina"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Nombre de Usuario*</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Fiera Fiu Fiu"
              />
            </div>
            <div className="field-group">
              <label>Tipo de Documento*</label>
              <select 
                name="tipoDoc"
                value={formData.tipoDoc}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Número de Documento*</label>
              <input 
                type="text" 
                name="numDoc"
                value={formData.numDoc}
                onChange={handleChange}
                placeholder="12323545649"
              />
            </div>
            <div className="field-group">
              <label>Correo Electrónico*</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="gatafuriosa@gmail.com"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Contraseña*</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••••••••••••••"
              />
            </div>
            <div className="field-group">
              <label>Confirmar Contraseña*</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••••••••••••••"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Número de Teléfono (Opcional)</label>
              <input 
                type="tel" 
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="3113149685"
              />
            </div>
            <div className="field-group">
              <label>Fecha de Nacimiento*</label>
              <input 
                type="text" 
                name="fechaNac"
                value={formData.fechaNac}
                onChange={handleChange}
                placeholder="03/09/2004"
              />
            </div>
          </div>

          <div className="requirements-box">
            <p><strong>Requisitos de la Contraseña:</strong></p>
            <ul>
              <li>Mínimo 8 caracteres</li>
              <li>Al menos una letra mayúscula</li>
              <li>Al menos un número</li>
            </ul>
          </div>

          <label className="terms-check">
            <input 
              type="checkbox" 
              name="aceptaTerminos"
              checked={formData.aceptaTerminos}
              onChange={handleChange}
            />
            <span>Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a></span>
          </label>

          <div className="buttons-row">
            <Link to="/" className="btn-cancel">Cancelar</Link>
            <button type="button" className="btn-create" onClick={handleSubmit}>Crear Cuenta</button>
          </div>

          <p className="login-text">
            ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión Aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register