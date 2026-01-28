import { Link, useLocation } from 'react-router-dom';
import { useMenu } from '../../contextos/MenuContext';
import { useState, useEffect } from 'react';

function PanelNavegacion() {
  const ubicacion = useLocation();
  const { menuAbierto, cerrarMenu } = useMenu();
  const [esMobile, setEsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const manejarResize = () => {
      setEsMobile(window.innerWidth <= 900);
    };

    window.addEventListener('resize', manejarResize);
    return () => window.removeEventListener('resize', manejarResize);
  }, []);

  const modulos = [
    { ruta: '/dashboard', etiqueta: 'Dashboard', descripcion: 'Panel principal' },
    { ruta: '/empleados', etiqueta: 'Empleados', descripcion: 'Gestión de empleados' },
    { ruta: '/usuarios', etiqueta: 'Usuarios', descripcion: 'Administración de usuarios' },
    { ruta: '/incapacidades', etiqueta: 'Incapacidades', descripcion: 'Control de incapacidades' },
    { ruta: '/prestaciones', etiqueta: 'Prestaciones Sociales', descripcion: 'Prestaciones y beneficios' },
    { ruta: '/afiliaciones', etiqueta: 'Afiliaciones', descripcion: 'Seguridad social' },
    { ruta: '/contratos', etiqueta: 'Contratos', descripcion: 'Gestión de contratos' },
    { ruta: '/certificacion', etiqueta: 'Certificación', descripcion: 'Certificados laborales' },
    { ruta: '/memorandos', etiqueta: 'Memorandos', descripcion: 'Comunicaciones internas' },
    { ruta: '/inasistencias', etiqueta: 'Inasistencias', descripcion: 'Control de asistencia' },
    { ruta: '/actividades', etiqueta: 'Actividades', descripcion: 'Actividades y eventos' },
    { ruta: '/reportes', etiqueta: 'Reportes', descripcion: 'Reportes y estadísticas' },
  ];

  const estaActivo = (ruta) => ubicacion.pathname === ruta;

  const manejarClick = () => {
    cerrarMenu();
  };

  if (!menuAbierto || !esMobile) return null;

  return (
    <>
      <div className="panel-navegacion-overlay" onClick={cerrarMenu}></div>
      <aside className="panel-navegacion">
        <div className="panel-navegacion-header">
          <div className="panel-navegacion-marca">
            <div className="panel-navegacion-icono"></div>
            <div className="panel-navegacion-texto">
              <span className="panel-navegacion-titulo">Talent Sphere</span>
              <span className="panel-navegacion-subtitulo">Gestión de RRHH</span>
            </div>
          </div>
          <button className="panel-navegacion-cerrar" onClick={cerrarMenu} aria-label="Cerrar menú">
            ×
          </button>
        </div>

        <nav className="panel-navegacion-menu">
          {modulos.map((modulo) => (
            <Link
              key={modulo.ruta}
              to={modulo.ruta}
              className={`panel-navegacion-item ${estaActivo(modulo.ruta) ? 'activo' : ''}`}
              onClick={manejarClick}
            >
              <div className="panel-navegacion-item-contenido">
                <span className="panel-navegacion-item-titulo">{modulo.etiqueta}</span>
                <span className="panel-navegacion-item-descripcion">{modulo.descripcion}</span>
              </div>
              {estaActivo(modulo.ruta) && (
                <span className="panel-navegacion-item-indicador">→</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="panel-navegacion-footer">
          <div className="panel-navegacion-usuario">
            <div className="panel-navegacion-avatar">A</div>
            <div className="panel-navegacion-datos">
              <span className="panel-navegacion-nombre">Admin</span>
              <span className="panel-navegacion-correo">admin@talentsphere.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default PanelNavegacion;

