import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cerrarSesion, esAdminSesionLocal, usuarioSesionLocal } from '../../services/autenticacion';
import ModalMiPerfil from './ModalMiPerfil';

/**
 * Componente de barra lateral de navegación
 */
function inicialesNombre(nombre) {
  const s = String(nombre || '').trim();
  if (!s) return '?';
  return s.charAt(0).toUpperCase();
}

function BarraLateral({ menuAbierto = false, cerrarMenu }) {
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [tickSesion, setTickSesion] = useState(0);
  const sesion = useMemo(() => usuarioSesionLocal(), [tickSesion]);
  const nombreMostrar = sesion?.nombre?.trim() || 'Usuario';
  const correoMostrar = sesion?.email?.trim() || '—';
  const avatarLetra = inicialesNombre(nombreMostrar);

  const enlacesMenu = [
    { ruta: '/dashboard', etiqueta: 'Dashboard', icono: '' },
    { ruta: '/empleados', etiqueta: 'Empleados', icono: '' },
    { ruta: '/usuarios', etiqueta: 'Usuarios', icono: '' },
    { ruta: '/incapacidades', etiqueta: 'Incapacidades', icono: '' },
    { ruta: '/prestaciones', etiqueta: 'Prestaciones Sociales', icono: '' },
    { ruta: '/afiliaciones', etiqueta: 'Afiliaciones', icono: '' },
    { ruta: '/contratos', etiqueta: 'Contratos', icono: '' },
    { ruta: '/certificaciones', etiqueta: 'Certificaciones', icono: '' },
    { ruta: '/comunicaciones-disciplinarias', etiqueta: 'Comunicaciones Disciplinarias', icono: '' },
    { ruta: '/inasistencias', etiqueta: 'Inasistencias', icono: '' },
    { ruta: '/actividades', etiqueta: 'Calendario de Actividades', icono: '' },
    { ruta: '/reportes', etiqueta: 'Reportes', icono: '' },
  ];
  const esAdmin = esAdminSesionLocal();
  const enlacesVisibles = enlacesMenu.filter((item) => item.ruta !== '/usuarios' || esAdmin);

  const estaActivo = (ruta) => {
    if (ruta === '/actividades') {
      return ubicacion.pathname === '/actividades' || ubicacion.pathname === '/calendario';
    }
    return ubicacion.pathname === ruta;
  };

  const manejarClick = () => {
    if (cerrarMenu) {
      cerrarMenu();
    }
  };

  const manejarCerrarSesion = () => {
    cerrarMenu?.();
    void cerrarSesion();
    navegar('/login');
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
        {enlacesVisibles.map((item) => (
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
        <div className="barra-lateral-usuario">
          <button
            type="button"
            className="barra-lateral-perfil-principal"
            onClick={() => setPerfilAbierto(true)}
            aria-label="Abrir mi perfil"
          >
            <span className="barra-lateral-avatar">{avatarLetra}</span>
            <span className="barra-lateral-datos">
              <span className="barra-lateral-nombre">{nombreMostrar}</span>
              <span className="barra-lateral-correo">{correoMostrar}</span>
            </span>
          </button>
          <button
            type="button"
            className="barra-lateral-boton-perfil barra-lateral-boton-cerrar-sesion"
            onClick={manejarCerrarSesion}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <span className="barra-lateral-boton-perfil-icono">→</span>
          </button>
        </div>

        <button
          type="button"
          className="barra-lateral-cerrar-sesion-mobile"
          onClick={manejarCerrarSesion}
        >
          <span className="barra-lateral-opcion-icono"></span>
          <span>Cerrar sesión</span>
        </button>
      </div>

      <ModalMiPerfil
        mostrar={perfilAbierto}
        cerrar={() => setPerfilAbierto(false)}
        alGuardar={() => setTickSesion((t) => t + 1)}
      />
    </aside>
  );
}

export default BarraLateral;