import { Link, useLocation } from 'react-router-dom';

/**
 * Componente de barra lateral de navegación
 */
function BarraLateral() {
  const ubicacion = useLocation();

  const enlacesMenu = [
    { ruta: '/dashboard', etiqueta: 'Dashboard', icono: '' },
    { ruta: '/afiliaciones', etiqueta: 'Afiliaciones', icono: '' },
    { ruta: '/empleados', etiqueta: 'Empleados', icono: '' },
    { ruta: '/certificacion', etiqueta: 'Certificación', icono: '' },
    { ruta: '/contratos', etiqueta: 'Contratos', icono: '' },
    { ruta: '/memorandos', etiqueta: 'Memorandos', icono: '' },
    { ruta: '/prestaciones', etiqueta: 'Prestaciones Sociales', icono: '' },
    { ruta: '/inasistencias', etiqueta: 'Inasistencias', icono: '' },
    { ruta: '/incapacidades', etiqueta: 'Incapacidades', icono: '' },
    { ruta: '/actividades', etiqueta: 'Actividades', icono: '' },
    { ruta: '/reportes', etiqueta: 'Reportes', icono: '' },
    { ruta: '/usuarios', etiqueta: 'Usuarios', icono: '' },
  ];

  const estaActivo = (ruta) => ubicacion.pathname === ruta;

  return (
    <aside className="barra-lateral">
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
        </div>
      </div>
    </aside>
  );
}

export default BarraLateral;
