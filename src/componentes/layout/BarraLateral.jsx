import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente de barra lateral de navegación
 */
function BarraLateral({ menuAbierto = false, cerrarMenu }) {
  const ubicacion = useLocation();
  const navegar = useNavigate();

  const enlacesMenu = [
    { ruta: '/dashboard', etiqueta: 'Dashboard', icono: '' },
    { ruta: '/empleados', etiqueta: 'Empleados', icono: '' },
    { ruta: '/usuarios', etiqueta: 'Usuarios', icono: '' },
    { ruta: '/incapacidades', etiqueta: 'Incapacidades', icono: '' },
    { ruta: '/prestaciones', etiqueta: 'Prestaciones Sociales', icono: '' },
    { ruta: '/afiliaciones', etiqueta: 'Afiliaciones', icono: '' },
    { ruta: '/contratos', etiqueta: 'Contratos', icono: '' },
    { ruta: '/certificacion', etiqueta: 'Certificación', icono: '' },
    { ruta: '/memorandos', etiqueta: 'Memorandos', icono: '' },
    { ruta: '/inasistencias', etiqueta: 'Inasistencias', icono: '' },
    { ruta: '/actividades', etiqueta: 'Actividades', icono: '' },
    { ruta: '/reportes', etiqueta: 'Reportes', icono: '' },
  ];

  const estaActivo = (ruta) => ubicacion.pathname === ruta;

  const manejarClick = () => {
    if (cerrarMenu) {
      cerrarMenu();
    }
  };

  return (
    <aside className={`barra-lateral ${menuAbierto ? 'abierta' : ''}`}>
      <div className="barra-lateral-encabezado">
        <div className="barra-lateral-marca">
          <div className="barra-lateral-icono"></div>
          <div className="barra-lateral-texto">
            <span className="barra-lateral-titulo">Talent Sphere</span>
            <span className="barra-lateral-subtitulo">Gestión de RRHH</span>
          </div>
        </div>
      </div>

      <nav className="barra-lateral-menu">
        {enlacesMenu.map((item) => (
          <Link
            key={item.ruta}
            to={item.ruta}
            className={`barra-lateral-opcion ${estaActivo(item.ruta) ? 'activo' : ''}`}
            onClick={manejarClick}
          >
            <span className="barra-lateral-opcion-icono">{item.icono}</span>
            <span>{item.etiqueta}</span>
          </Link>
        ))}
      </nav>

      <div className="barra-lateral-pie">
        <Link to="#" className="barra-lateral-opcion">
          <span className="barra-lateral-opcion-icono"></span>
          <span>Ayuda</span>
        </Link>

        <div className="barra-lateral-usuario">
          <div className="barra-lateral-avatar">A</div>
          <div className="barra-lateral-datos">
            <span className="barra-lateral-nombre">Admin</span>
            <span className="barra-lateral-correo">admin@talentsphere.com</span>
          </div>
          <button 
            className="barra-lateral-cerrar-sesion" 
            onClick={() => {
              if (cerrarMenu) {
                cerrarMenu();
              }
              navegar('/');
            }}
            title="Cerrar sesión"
          >
            <span className="barra-lateral-cerrar-sesion-icono">→</span>
          </button>
        </div>

        <button 
          className="barra-lateral-cerrar-sesion-mobile" 
          onClick={() => {
            if (cerrarMenu) {
              cerrarMenu();
            }
            navegar('/');
          }}
        >
          <span className="barra-lateral-opcion-icono"></span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default BarraLateral;
