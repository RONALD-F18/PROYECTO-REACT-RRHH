import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="avatar-placeholder"></div>
          <h2>Inicia Sesión para Continuar</h2>
        </div>
        
        <div className="login-body">
          <div className="field-group">
            <label id="label-item">Usuario o Correo</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ronald@gmail.com" className='input-form'
            />
          </div>
          
          <div className="field-group">
            <label id="label-item2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••••••" className='input-form'
            />
          </div>
          
          <div className="form-row">
            <label className="remember-check">
              <input 
                type="checkbox" 
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)} id="check"
              />
              <span>Recuerdame</span>
            </label>
            <a href="#" className="forgot-pass">¿Olvidaste tu Contraseña?</a>
          </div>
          
          <button className="btn-login" onClick={handleSubmit}>
            Inicia Sesión
          </button>
          
          <div className="separator">
            <span>O Continúa Con</span>
          </div>
          
          <div className="social-row">
            <button className="btn-social">Google</button>
            <button className="btn-social">Facebook</button>
          </div>
          
          <p className="signup-text">
            ¿No tienes cuenta? <Link to="/register">Crear una cuenta</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login