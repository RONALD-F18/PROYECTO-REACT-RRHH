import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-page">
      <header className="main-header">
        <div className="header-content">
          <div className="brand">
            <div className="brand-logo">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="url(#grad1)" />
                <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" transform="rotate(60 16 16)"/>
                <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" transform="rotate(-60 16 16)"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="brand-name">Talent Sphere</span>
          </div>
          <nav className="main-nav">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <div className="header-actions">
            <Link to="/login" className="btn-outline">Iniciar sesión</Link>
            <Link to="/register" className="btn-filled">Registrarse</Link>
          </div>
        </div>
      </header>

      <section id="inicio" className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Bienvenido a Talent Sphere</h1>
            <p className="paragraph">Simplifica la administración de tu equipo con nuestra plataforma todo en uno. Gestión integral de recursos humanos para empresas modernas.</p>
          </div>
          <div className="hero-logo-box">
            <div className="logo-container">
              <svg width="60" height="60" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="url(#grad2)" />
                <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
                <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" transform="rotate(60 16 16)"/>
                <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" transform="rotate(-60 16 16)"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#501cecff" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="logo-text">
                <span>Talent</span>
                <span>Sphere</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="services-section">
        <h2>Nuestros Servicios</h2>
        <p className="section-subtitle">Soluciones integrales para la gestión de tu talento humano</p>
        <div className="services-container">
          <div className="service-card">
            <h3>Empleados</h3>
            <p>Administra perfiles completos y expedientes digitales de todo tu personal en un solo lugar.</p>
          </div>
          <div className="service-card highlighted">
            <h3>Prestaciones Sociales</h3>
            <p>Calcula y gestiona prestaciones sociales, cesantías, primas e intereses automáticamente.</p>
          </div>
          <div className="service-card">
            <h3>Afiliaciones</h3>
            <p>Controla afiliaciones a entidades de seguridad social y mantén actualizada la información.</p>
          </div>
        </div>
      </section>

      <section id="nosotros" className="features-section">
        <h2>¿Por qué elegir Talent Sphere?</h2>
        <p className="section-subtitle">Características que nos hacen diferentes</p>
        <div className="features-grid">
          <div className="feature-item">
            <h4>Fácil de usar</h4>
            <p>Interfaz intuitiva que no requiere capacitación extensa</p>
          </div>
          <div className="feature-item">
            <h4>Seguro</h4>
            <p>Protección de datos con los más altos estándares de seguridad</p>
          </div>
          <div className="feature-item">
            <h4>En la nube</h4>
            <p>Accede desde cualquier lugar y dispositivo</p>
          </div>
          <div className="feature-item">
            <h4>Soporte 24/7</h4>
            <p>Equipo de soporte siempre disponible para ayudarte</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>¿Listo para transformar tu gestión de RRHH?</h2>
        <p>Únete a cientos de empresas que ya confían en Talent Sphere</p>
        <button className="btn-cta">Solicita una demo gratuita</button>
      </section>

      <section id="contacto" className="contact-section">
        <h2>Contáctanos</h2>
        <p className="section-subtitle">Estamos aquí para ayudarte</p>
        <div className="contact-wrapper">
          <form className="contact-form">
            <div className="form-field">
              <label>Nombre completo</label>
              <input type="text" />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" />
            </div>
            <div className="form-field">
              <label>Empresa</label>
              <input type="text" />
            </div>
            <div className="form-field">
              <label>Mensaje</label>
              <textarea rows="4"></textarea>
            </div>
            <button type="submit" className="btn-submit">Enviar Mensaje</button>
          </form>
          <div className="contact-info">
            <div className="info-block">
              <span className="info-title">Email</span>
              <span className="info-value">info@talentsphere.com</span>
            </div>
            <div className="info-block">
              <span className="info-title">Teléfono</span>
              <span className="info-value">+57 (601) 254-4578</span>
            </div>
            <div className="info-block">
              <span className="info-title">Dirección</span>
              <span className="info-value">Bogotá, Colombia</span>
            </div>
            <div className="info-block">
              <span className="info-title">Horario</span>
              <span className="info-value">Lunes a Viernes: 8:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand">
              <div className="brand-logo small">
                <svg width="24" height="24" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="url(#grad3)" />
                  <circle cx="16" cy="16" r="3" fill="white"/>
                  <defs>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="brand-name">Talent Sphere</span>
            </div>
            <p className='p-footer'>Soluciones inteligentes para la gestión de recursos humanos.</p>
          </div>
          <div className="footer-column">
            <h4>Servicios</h4>
            <a href="#">-Empleados.</a>
            <a href="#">-Prestaciones Sociales.</a>
            <a href="#">-Afiliaciones.</a>
          </div>
          <div className="footer-column">
            <h4>Empresa</h4>
            <a href="#">-Sobre Nosotros</a>
            <a href="#">-Blog</a>
            <a href="#">-Carreras</a>
            <a href="#">-Contacto</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="#">-Términos y Condiciones</a>
            <a href="#">-Política de Privacidad</a>
            <a href="#">-Cookies</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Talent Sphere. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home