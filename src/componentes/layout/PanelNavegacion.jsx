import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMenu } from '../../contextos/MenuContext';
import { useChatAsistente } from '../../contextos/ChatAsistenteContext';
import IconoBuho from '../comunes/IconoBuho';
import { useState, useEffect, useMemo } from 'react';
import { cerrarSesion, esAdminSesionLocal, usuarioSesionLocal } from '../../services/autenticacion';
import ModalMiPerfil from './ModalMiPerfil';

function inicialesNombre(nombre) {
  const s = String(nombre || '').trim();
  if (!s) return '?';
  return s.charAt(0).toUpperCase();
}

function PanelNavegacion() {
  const chatAsistente = useChatAsistente();
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const { menuAbierto, cerrarMenu } = useMenu();
  const [esMobile, setEsMobile] = useState(window.innerWidth <= 900);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [tickSesion, setTickSesion] = useState(0);
  const sesion = useMemo(() => usuarioSesionLocal(), [tickSesion]);
  const nombreMostrar = sesion?.nombre?.trim() || 'Usuario';
  const correoMostrar = sesion?.email?.trim() || '—';
  const avatarLetra = inicialesNombre(nombreMostrar);

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
    { ruta: '/certificaciones', etiqueta: 'Certificaciones', descripcion: 'Certificados laborales y afiliaciones' },
    {
      ruta: '/comunicaciones-disciplinarias',
      etiqueta: 'Comunicaciones Disciplinarias',
      descripcion: 'Memorandos y reconocimientos',
    },
    { ruta: '/inasistencias', etiqueta: 'Inasistencias', descripcion: 'Control de asistencia' },
    {
      ruta: '/actividades',
      etiqueta: 'Calendario de Actividades',
      descripcion: 'Tareas, reuniones y recordatorios',
    },
    { ruta: '/reportes', etiqueta: 'Reportes', descripcion: 'Reportes y estadísticas' },
  ];
  const esAdmin = esAdminSesionLocal();
  const modulosVisibles = modulos.filter((item) => item.ruta !== '/usuarios' || esAdmin);

  const estaActivo = (ruta) => {
    if (ruta === '/actividades') {
      return ubicacion.pathname === '/actividades' || ubicacion.pathname === '/calendario';
    }
    return ubicacion.pathname === ruta;
  };

  const manejarClick = () => {
    cerrarMenu();
  };

  const manejarCerrarSesion = () => {
    cerrarMenu();
    void cerrarSesion();
    navegar('/login');
  };

  if (!menuAbierto || !esMobile) return null;

  return (
    <>
      <div className="panel-navegacion-overlay" onClick={cerrarMenu}></div>
      <aside className="panel-navegacion">
        <div className="panel-navegacion-header">
          <div className="panel-navegacion-marca">
            {chatAsistente ? (
              <button
                type="button"
                className="panel-navegacion-buho-btn"
                onClick={() => {
                  chatAsistente.abrir();
                  cerrarMenu();
                }}
                aria-label="Abrir asistente de RRHH"
                title="Asistente Talent Sphere"
              >
                <IconoBuho className="chat-asistente-buho--sidebar" title="" />
              </button>
            ) : (
              <div className="panel-navegacion-icono" aria-hidden />
            )}
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
          {modulosVisibles.map((modulo) => (
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
            <button
              type="button"
              className="panel-navegacion-perfil-principal"
              onClick={() => setPerfilAbierto(true)}
              aria-label="Abrir mi perfil"
            >
              <span className="panel-navegacion-avatar">{avatarLetra}</span>
              <span className="panel-navegacion-datos">
                <span className="panel-navegacion-nombre">{nombreMostrar}</span>
                <span className="panel-navegacion-correo">{correoMostrar}</span>
                <button
                  type="button"
                  className="barra-lateral-cerrar-sesion-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    manejarCerrarSesion();
                  }}
                >
                  Cerrar sesión
                </button>
              </span>
            </button>
          </div>
        </div>
      </aside>

      <ModalMiPerfil
        mostrar={perfilAbierto}
        cerrar={() => setPerfilAbierto(false)}
        alGuardar={() => setTickSesion((t) => t + 1)}
      />
    </>
  );
}

export default PanelNavegacion;

