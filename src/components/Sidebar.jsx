import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const enlacesMenu = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/afiliaciones", label: "Afiliaciones" },
    { path: "/empleados", label: "Empleados" },
    { path: "/certificacion", label: "Certificación" },
    { path: "/contratos", label: "Contratos" },
    { path: "/memorandos", label: "Memorandos" },
    { path: "/prestaciones", label: "Prestaciones Sociales" },
    { path: "/inasistencias", label: "Inasistencias" },
    { path: "/incapacidades", label: "Incapacidades" },
    { path: "/actividades", label: "Actividades" },
    { path: "/reportes", label: "Reportes" },
    { path: "/usuarios", label: "Usuarios" },
  ];

  return (
    <aside className="barra-lateral">
      <div className="encabezado-lateral">
        <div className="marca-lateral">
          <div className="marca-icono"></div>
          <div className="marca-texto">
            <span className="marca-titulo">Talent Sphere</span>
            <span className="marca-subtitulo">Gestión de RRHH</span>
          </div>
        </div>
      </div>

      <nav className="menu-lateral">
        {enlacesMenu.map((item) => (
          <Link key={item.path} to={item.path} className="opcion-menu">
            <span className="opcion-etiqueta">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pie-lateral">
        <Link to="#" className="opcion-menu opcion-ayuda">
          <span className="opcion-etiqueta">Ayuda</span>
        </Link>

        <div className="tarjeta-usuario">
          <div className="avatar-usuario">A</div>
          <div className="datos-usuario">
            <span className="nombre-usuario">Admin</span>
            <span className="correo-usuario">gatafuriosa@gmail.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
