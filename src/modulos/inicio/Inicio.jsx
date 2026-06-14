import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { enviarContactoLanding } from "../../services/api/contactoApi";
import { alertaErrorApi, alertaMensaje } from "../../utils/alertasSwal";

function LogoMarca({ size = 32 }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}mascota-buho.png`}
      alt=""
      width={size}
      height={size}
      className="inicio-marca-icono"
      aria-hidden
    />
  );
}

function Inicio() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esMobile, setEsMobile] = useState(false);
  const [revelado, setRevelado] = useState(() => new Set());
  const paginaRef = useRef(null);
  const [contacto, setContacto] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [enviandoContacto, setEnviandoContacto] = useState(false);
  const [erroresContacto, setErroresContacto] = useState({});

  useEffect(() => {
    const verificarTamaño = () => {
      setEsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) {
        setMenuAbierto(false);
      }
    };

    verificarTamaño();
    window.addEventListener("resize", verificarTamaño);
    return () => window.removeEventListener("resize", verificarTamaño);
  }, []);

  const registrarRevelado = useCallback((id) => {
    setRevelado((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    const root = paginaRef.current;
    if (!root) return undefined;
    const nodos = root.querySelectorAll("[data-inicio-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-inicio-reveal");
            if (id) registrarRevelado(id);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -20px 0px" }
    );
    nodos.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [registrarRevelado]);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const validarContacto = () => {
    const next = {};
    if (String(contacto.nombre).trim().length < 2) next.nombre = "Mínimo 2 caracteres.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contacto.email).trim())) next.email = "Correo inválido.";
    if (String(contacto.asunto).trim().length < 3) next.asunto = "Mínimo 3 caracteres.";
    if (String(contacto.mensaje).trim().length < 10) next.mensaje = "Mínimo 10 caracteres.";
    setErroresContacto(next);
    return Object.keys(next).length === 0;
  };

  const manejarContacto = async (e) => {
    e.preventDefault();
    if (!validarContacto()) return;
    setEnviandoContacto(true);
    try {
      const res = await enviarContactoLanding(contacto);
      await alertaMensaje({
        titulo: "Mensaje enviado",
        texto: res?.message || "Gracias por contactarnos. Te responderemos pronto.",
        icon: "success",
      });
      setContacto({ nombre: "", email: "", asunto: "", mensaje: "" });
      setErroresContacto({});
    } catch (err) {
      const status = err?.response?.status;
      if (status === 422) {
        const errs = err?.response?.data?.errors;
        if (errs && typeof errs === "object") {
          const mapped = {};
          for (const [k, v] of Object.entries(errs)) {
            mapped[k] = Array.isArray(v) ? String(v[0]) : String(v);
          }
          setErroresContacto(mapped);
        }
        void alertaErrorApi("Datos no válidos", err);
      } else {
        void alertaErrorApi("No se pudo enviar el mensaje", err);
      }
    } finally {
      setEnviandoContacto(false);
    }
  };

  const claseRev = (id) =>
    `inicio-reveal ${revelado.has(id) ? "inicio-reveal-vis" : ""}`;

  /** HashRouter usa #/ruta — href="#seccion" rompe el router; scroll programático. */
  const irASeccion = useCallback(
    (idSeccion) => {
      cerrarMenu();
      const scroll = () => {
        const el = document.getElementById(idSeccion);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      if (ubicacion.pathname !== "/") {
        navegar("/");
        window.setTimeout(scroll, 120);
      } else {
        scroll();
      }
    },
    [navegar, ubicacion.pathname],
  );

  const enlacesNav = [
    { id: "inicio", etiqueta: "Inicio" },
    { id: "servicios", etiqueta: "Servicios" },
    { id: "nosotros", etiqueta: "Nosotros" },
    { id: "contacto", etiqueta: "Contacto" },
  ];

  // TODO: Cambiar los servicios por los módulos del sistema
  const servicios = [
    {
      titulo: "Empleados",
      descripcion:
        "Perfiles, expediente laboral y datos bancarios para nómina, todo en un solo lugar.",
    },
    {
      titulo: "Prestaciones sociales",
      descripcion:
        "Calcula y gestiona prestaciones sociales, cesantías, primas e intereses automáticamente.",
      destacado: true,
    },
    {
      titulo: "Afiliaciones",
      descripcion:
        "Controla afiliaciones a entidades de seguridad social y mantén actualizada la información.",
      destacado: true,
    },
    {
      titulo: "Autenticación y usuarios",
      descripcion: "Inicio de sesión y perfil. Usuarios y roles para administradores.",
    },
    {
      titulo: "Contrato y cargo",
      descripcion: "Historial contractual y cargos para saber quién hace qué y desde cuándo.",
    },
    {
      titulo: "Inasistencias",
      descripcion: "Registro de faltas y ausencias alineado con nómina y disciplinario.",
    },
    {
      titulo: "Incapacidades",
      descripcion: "Tipos, clasificación e historial de incapacidades por empleado.",
    },
    {
      titulo: "Calendario de Actividades",
      descripcion: "Eventos y fechas importantes del área de personas.",
    },
    {
      titulo: "Empresa",
      descripcion: "Datos de la organización, sedes y parametrización del sistema.",
    },
    {
      titulo: "Certificaciones",
      descripcion: "Certificados laborales y documentos para empleados o terceros.",
    },
    {
      titulo: "Comunicaciones Disciplinarias",
      descripcion: "Registro de comunicados y actuaciones disciplinarias.",
    },
    {
      titulo: "Reportes",
      descripcion: "Listados y exportación según la información de cada módulo.",
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
    <div className="inicio-pagina" ref={paginaRef}>
      <header className="inicio-header">
        <div className="inicio-header-contenido">
          <div className="inicio-marca">
            <LogoMarca size={32} />
            <span className="inicio-marca-nombre">Talent Sphere</span>
          </div>
          <nav className={`inicio-nav ${menuAbierto ? "inicio-nav-abierto" : ""}`}>
            {enlacesNav.map((item) => (
              <button
                key={item.id}
                type="button"
                className="inicio-nav-link"
                onClick={() => irASeccion(item.id)}
              >
                {item.etiqueta}
              </button>
            ))}
            {esMobile && (
              <div className="inicio-nav-acciones-mobile">
                <Link to="/login" className="inicio-btn-contorno" onClick={cerrarMenu}>
                  Iniciar sesión
                </Link>
              </div>
            )}
          </nav>
          <div className="inicio-header-acciones">
            <Link to="/login" className="inicio-btn-contorno">
              Iniciar sesión
            </Link>
          </div>
          <button
            type="button"
            className={`inicio-menu-hamburguesa ${menuAbierto ? "inicio-menu-hamburguesa-abierto" : ""}`}
            onClick={toggleMenu}
            aria-label="Menú"
          >
            <span />
            <span />
            <span />
          </button>
          {menuAbierto && esMobile && (
            <div className="inicio-menu-overlay" onClick={cerrarMenu} />
          )}
        </div>
      </header>

      <section id="inicio" className="inicio-hero">
        <div className="inicio-hero-contenido">
          <div className="inicio-hero-texto">
            <h1>Bienvenido a Talent Sphere</h1>
            <p>
              Simplifica la administración de tu equipo con nuestra plataforma todo en uno. Gestión integral de
              recursos humanos para empresas modernas.
            </p>
          </div>
          <div className="inicio-hero-logo inicio-hero-logo-in">
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

      <section
        id="servicios"
        className={`inicio-servicios ${claseRev("sec-servicios")}`}
        data-inicio-reveal="sec-servicios"
      >
        <h2>Nuestros Servicios</h2>
        <p className="inicio-subtitulo inicio-servicios-subtitulo">
          Soluciones integrales para la gestión de tu talento humano
        </p>
        <div className="inicio-servicios-scroll-area">
          <div className="inicio-servicios-carril" tabIndex={0} aria-label="Carrusel de módulos del sistema">
          {servicios.map((s, i) => (
            <div
              key={s.titulo}
              className={`inicio-servicio ${s.destacado ? "destacado" : ""} ${claseRev(`srv-${i}`)}`}
              data-inicio-reveal={`srv-${i}`}
              style={{ "--inicio-stagger": `${Math.min(i, 8) * 0.04}s` }}
            >
              <h3>{s.titulo}</h3>
              <p>{s.descripcion}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section id="nosotros" className="inicio-caracteristicas">
        <h2 className={claseRev("car-h2")} data-inicio-reveal="car-h2">
          ¿Por qué elegir Talent Sphere?
        </h2>
        <p className={`inicio-subtitulo ${claseRev("car-sub")}`} data-inicio-reveal="car-sub">
          Características que nos hacen diferentes
        </p>
        <div className="inicio-caracteristicas-grid">
          {caracteristicas.map((c, i) => (
            <div
              key={c.titulo}
              className={`inicio-caracteristica ${claseRev(`car-${i}`)}`}
              data-inicio-reveal={`car-${i}`}
              style={{ "--inicio-stagger": `${i * 0.06}s` }}
            >
              <h4>{c.titulo}</h4>
              <p>{c.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="inicio-cta">
        <h2 className={claseRev("cta-h2")} data-inicio-reveal="cta-h2">
          ¿Listo para transformar tu gestión de RRHH?
        </h2>
        <p className={claseRev("cta-p")} data-inicio-reveal="cta-p">
          Únete a cientos de empresas que ya confían en Talent Sphere
        </p>
        <button type="button" className="inicio-cta-btn">
          Solicita una demo gratuita
        </button>
      </section>

      <section id="contacto" className="inicio-contacto">
        <h2>Contáctanos</h2>
        <p className="inicio-subtitulo">Estamos aquí para ayudarte</p>
        <div className="inicio-contacto-contenido">
          <form className="inicio-formulario" onSubmit={manejarContacto} noValidate>
            <div className="inicio-formulario-campo">
              <label htmlFor="contacto-nombre">Nombre completo</label>
              <input
                id="contacto-nombre"
                type="text"
                placeholder="Tu nombre"
                value={contacto.nombre}
                onChange={(e) => setContacto((p) => ({ ...p, nombre: e.target.value }))}
                disabled={enviandoContacto}
              />
              {erroresContacto.nombre ? <small className="campo-seccion-error">{erroresContacto.nombre}</small> : null}
            </div>
            <div className="inicio-formulario-campo">
              <label htmlFor="contacto-email">Email</label>
              <input
                id="contacto-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={contacto.email}
                onChange={(e) => setContacto((p) => ({ ...p, email: e.target.value }))}
                disabled={enviandoContacto}
              />
              {erroresContacto.email ? <small className="campo-seccion-error">{erroresContacto.email}</small> : null}
            </div>
            <div className="inicio-formulario-campo">
              <label htmlFor="contacto-asunto">Asunto</label>
              <input
                id="contacto-asunto"
                type="text"
                placeholder="¿Sobre qué nos escribes?"
                value={contacto.asunto}
                onChange={(e) => setContacto((p) => ({ ...p, asunto: e.target.value }))}
                disabled={enviandoContacto}
              />
              {erroresContacto.asunto ? <small className="campo-seccion-error">{erroresContacto.asunto}</small> : null}
            </div>
            <div className="inicio-formulario-campo">
              <label htmlFor="contacto-mensaje">Mensaje</label>
              <textarea
                id="contacto-mensaje"
                rows="4"
                placeholder="¿En qué podemos ayudarte?"
                value={contacto.mensaje}
                onChange={(e) => setContacto((p) => ({ ...p, mensaje: e.target.value }))}
                disabled={enviandoContacto}
              />
              {erroresContacto.mensaje ? <small className="campo-seccion-error">{erroresContacto.mensaje}</small> : null}
            </div>
            <button
              type="submit"
              className="inicio-formulario-btn"
              disabled={enviandoContacto}
            >
              {enviandoContacto ? "Enviando…" : "Enviar Mensaje"}
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
              <span className="inicio-info-valor">Lunes a Viernes: 8:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="inicio-footer">
        <div className="inicio-footer-contenido">
          <div className="inicio-footer-marca">
            <div className="inicio-marca">
              <LogoMarca size={28} />
              <span className="inicio-marca-nombre">Talent Sphere</span>
            </div>
            <p>Soluciones inteligentes para la gestión de recursos humanos.</p>
          </div>
          <div className="inicio-footer-columna">
            <h4>Módulos</h4>
            <button type="button" className="inicio-footer-link" onClick={() => irASeccion("servicios")}>
              Ver todos los módulos
            </button>
            <button type="button" className="inicio-footer-link" onClick={() => irASeccion("servicios")}>
              Reportes y certificaciones
            </button>
            <button type="button" className="inicio-footer-link" onClick={() => irASeccion("contacto")}>
              Soporte
            </button>
          </div>
          <div className="inicio-footer-columna">
            <h4>Empresa</h4>
            <button type="button" className="inicio-footer-link" onClick={() => irASeccion("nosotros")}>
              Sobre Nosotros
            </button>
            <button type="button" className="inicio-footer-link" onClick={() => irASeccion("contacto")}>
              Contacto
            </button>
          </div>
          <div className="inicio-footer-columna">
            <h4>Legal</h4>
            <button type="button" className="inicio-footer-link" onClick={() => irASeccion("contacto")}>
              Términos y Condiciones
            </button>
            <button type="button" className="inicio-footer-link" onClick={() => irASeccion("contacto")}>
              Política de Privacidad
            </button>
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
