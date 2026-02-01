import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Inicio() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esMobile, setEsMobile] = useState(false);

  useEffect(() => {
    const verificarTamaño = () => {
      setEsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) {
        setMenuAbierto(false);
      }
    };

    verificarTamaño();
    window.addEventListener('resize', verificarTamaño);
    return () => window.removeEventListener('resize', verificarTamaño);
  }, []);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };
  const servicios = [
    {
      titulo: "Empleados",
      descripcion:
        "Administra perfiles completos y expedientes digitales de todo tu personal en un solo lugar.",
    },
    {
      titulo: "Prestaciones Sociales",
      descripcion:
        "Calcula y gestiona prestaciones sociales, cesantías, primas e intereses automáticamente.",
      destacado: true,
    },
    {
      titulo: "Afiliaciones",
      descripcion:
        "Controla afiliaciones a entidades de seguridad social y mantén actualizada la información.",
    },
  ];

  const caracteristicas = [
    {
      titulo: "Fácil de usar",
      descripcion: "Interfaz intuitiva que no requiere capacitación extensa",
    },
    {
      titulo: "Seguro",
      descripcion:
        "Protección de datos con los más altos estándares de seguridad",
    },
    {
      titulo: "En la nube",
      descripcion: "Accede desde cualquier lugar y dispositivo",
    },
    {
      titulo: "Soporte 24/7",
      descripcion: "Equipo de soporte siempre disponible para ayudarte",
    },
  ];

  return (
    <div className="inicio-pagina">
      <header className="inicio-header">
        <div className="inicio-header-contenido">
          <div className="inicio-marca">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="url(#grad1)" />
              <ellipse
                cx="16"
                cy="16"
                rx="10"
                ry="4"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="10"
                ry="4"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                transform="rotate(60 16 16)"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="10"
                ry="4"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                transform="rotate(-60 16 16)"
              />
              <circle cx="16" cy="16" r="3" fill="white" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
            <span className="inicio-marca-nombre">Talent Sphere</span>
          </div>
          <nav className={`inicio-nav ${menuAbierto ? 'inicio-nav-abierto' : ''}`}>
            <a href="#inicio" onClick={cerrarMenu}>Inicio</a>
            <a href="#servicios" onClick={cerrarMenu}>Servicios</a>
            <a href="#nosotros" onClick={cerrarMenu}>Nosotros</a>
            <a href="#contacto" onClick={cerrarMenu}>Contacto</a>
            {esMobile && (
              <div className="inicio-nav-acciones-mobile">
                <Link to="/login" className="inicio-btn-contorno" onClick={cerrarMenu}>
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="inicio-btn-relleno" onClick={cerrarMenu}>
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
          <div className="inicio-header-acciones">
            <Link to="/login" className="inicio-btn-contorno">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="inicio-btn-relleno">
              Registrarse
            </Link>
          </div>
          <button 
            className={`inicio-menu-hamburguesa ${menuAbierto ? 'inicio-menu-hamburguesa-abierto' : ''}`}
            onClick={toggleMenu}
            aria-label="Menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          {menuAbierto && esMobile && (
            <div className="inicio-menu-overlay" onClick={cerrarMenu}></div>
          )}
        </div>
      </header>

      <section id="inicio" className="inicio-hero">
        <div className="inicio-hero-contenido">
          <div className="inicio-hero-texto">
            <h1>Bienvenido a Talent Sphere</h1>
            <p>
              Simplifica la administración de tu equipo con nuestra plataforma
              todo en uno. Gestión integral de recursos humanos para empresas
              modernas.
            </p>
          </div>
          <div className="inicio-hero-logo">
            <svg width="60" height="60" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="url(#grad2)" />
              <ellipse
                cx="16"
                cy="16"
                rx="10"
                ry="4"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="10"
                ry="4"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1"
                transform="rotate(60 16 16)"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="10"
                ry="4"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1"
                transform="rotate(-60 16 16)"
              />
              <circle cx="16" cy="16" r="3" fill="white" />
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="inicio-hero-logo-texto">
              <span>Talent</span>
              <span>Sphere</span>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="inicio-servicios">
        <h2>Nuestros Servicios</h2>
        <p className="inicio-subtitulo">
          Soluciones integrales para la gestión de tu talento humano
        </p>
       
       
      </section>

      <section id="nosotros" className="inicio-caracteristicas">
        <h2>¿Por qué elegir Talent Sphere?</h2>
        <p className="inicio-subtitulo">
          Características que nos hacen diferentes
        </p>
        <div className="inicio-caracteristicas-grid">
          {caracteristicas.map((c, i) => (
            <div key={i} className="inicio-caracteristica">
              <h4>{c.titulo}</h4>
              <p>{c.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="inicio-cta">
        <h2>¿Listo para transformar tu gestión de RRHH?</h2>
        <p>Únete a cientos de empresas que ya confían en Talent Sphere</p>
        <button className="inicio-cta-btn">Solicita una demo gratuita</button>
      </section>

      <section id="contacto" className="inicio-contacto">
        <h2>Contáctanos</h2>
        <p className="inicio-subtitulo">Estamos aquí para ayudarte</p>
        <div className="inicio-contacto-contenido">
          <form className="inicio-formulario">
            <div className="inicio-formulario-campo">
              <label>Nombre completo</label>
              <input type="text" placeholder="Tu nombre" />
            </div>
            <div className="inicio-formulario-campo">
              <label>Email</label>
              <input type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div className="inicio-formulario-campo">
              <label>Empresa</label>
              <input type="text" placeholder="Nombre de tu empresa" />
            </div>
            <div className="inicio-formulario-campo">
              <label>Mensaje</label>
              <textarea
                rows="4"
                placeholder="¿En qué podemos ayudarte?"
              ></textarea>
            </div>
            <button type="submit" className="inicio-formulario-btn">
              Enviar Mensaje
            </button>
          </form>
          <div className="inicio-info">
            <div className="inicio-info-bloque">
              <span className="inicio-info-titulo">Email</span>
              <span className="inicio-info-valor">info@talentsphere.com</span>
            </div>
            <div className="inicio-info-bloque">
              <span className="inicio-info-titulo">Teléfono</span>
              <span className="inicio-info-valor">+57 (601) 254-4578</span>
            </div>
            <div className="inicio-info-bloque">
              <span className="inicio-info-titulo">Dirección</span>
              <span className="inicio-info-valor">Bogotá, Colombia</span>
            </div>
            <div className="inicio-info-bloque">
              <span className="inicio-info-titulo">Horario</span>
              <span className="inicio-info-valor">
                Lunes a Viernes: 8:00 AM - 6:00 PM
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="inicio-footer">
        <div className="inicio-footer-contenido">
          <div className="inicio-footer-marca">
            <div className="inicio-marca">
              <span className="inicio-marca-nombre">Talent Sphere</span>
            </div>
            <p>Soluciones inteligentes para la gestión de recursos humanos.</p>
          </div>
          <div className="inicio-footer-columna">
            <h4>Servicios</h4>
            <a href="#">Empleados</a>
            <a href="#">Prestaciones Sociales</a>
            <a href="#">Afiliaciones</a>
          </div>
          <div className="inicio-footer-columna">
            <h4>Empresa</h4>
            <a href="#">Sobre Nosotros</a>
            <a href="#">Blog</a>
            <a href="#">Carreras</a>
            <a href="#">Contacto</a>
          </div>
          <div className="inicio-footer-columna">
            <h4>Legal</h4>
            <a href="#">Términos y Condiciones</a>
            <a href="#">Política de Privacidad</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className="inicio-footer-inferior">
          <p>© 2025 Talent Sphere. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Inicio;
