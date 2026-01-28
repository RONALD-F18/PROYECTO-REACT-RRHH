import { Link } from 'react-router-dom';
import { ContenedorPrincipal } from '../../componentes';
import BotonMenu from '../../componentes/comunes/BotonMenu';

function Panel() {
  const tarjetasResumen = [
    { cantidad: 247, etiqueta: 'Empleados activos', color: 'amarillo' },
    { cantidad: 234, etiqueta: 'Contratos vigentes', color: 'rosa' },
    { cantidad: 18, etiqueta: 'Inasistencias del mes', color: 'naranja' },
    { cantidad: 21, etiqueta: 'Incapacidades', color: 'azul' },
    { cantidad: 247, etiqueta: 'Afiliaciones', color: 'verde' },
  ];

  const actividadesRecientes = [
    { texto: 'Ricardo Pérez registrado', etiqueta: 'Empleado', tipoEtiqueta: 'verde', tiempo: 'Hace 2 horas' },
    { texto: 'Contrato aprobado - Ana García', etiqueta: 'Contrato', tipoEtiqueta: 'roja', tiempo: 'Hace 2 horas' },
  ];

  const tareasPendientes = [
    { texto: 'Revisión de contratos', fecha: '08 Dic', prioridad: 'alta' },
    { texto: 'Registrar afiliación al nuevo empleado', fecha: '12 Dic', prioridad: 'media' },
  ];

  const accesosRapidos = [
    { ruta: '/empleados', texto: 'Nuevo empleado', color: 'btn-amarillo' },
    { ruta: '/contratos', texto: 'Crear contrato', color: 'btn-rosa' },
    { ruta: '/prestaciones', texto: 'Registrar prestación', color: 'btn-naranja' },
    { ruta: '/afiliaciones', texto: 'Registrar afiliación', color: 'btn-verde' },
  ];

  const obtenerFecha = () => {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ContenedorPrincipal>
      <header className="dashboard-encabezado">
        <div className="dashboard-encabezado-izquierda">
          <div className="dashboard-encabezado-logo">
            <span className="dashboard-encabezado-logo-texto">Talent Sphere</span>
          </div>
          <div className="dashboard-encabezado-info">
            <h1>Panel General</h1>
            <p>Resumen rápido de la operación</p>
          </div>
        </div>
        <div className="dashboard-encabezado-derecha">
          <span className="dashboard-fecha">{obtenerFecha()}</span>
          <BotonMenu />
        </div>
      </header>

      <div className="dashboard-cuerpo">
        <div className="dashboard-resumen">
          {tarjetasResumen.map((tarjeta, indice) => (
            <div className="tarjeta-dato" key={indice}>
              <div className={`tarjeta-dato-icono ${tarjeta.color}`}>
                <span />
              </div>
              <div className="tarjeta-dato-contenido">
                <span className="tarjeta-dato-numero">{tarjeta.cantidad}</span>
                <span className="tarjeta-dato-texto">{tarjeta.etiqueta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-actividades">
          <div className="dashboard-tarjeta">
            <div className="dashboard-tarjeta-superior">
              <h3>Actividades recientes</h3>
              <Link to="/actividades" className="dashboard-enlace">Ver todas</Link>
            </div>
            <div className="dashboard-lista-actividades">
              {actividadesRecientes.map((actividad, indice) => (
                <div className="dashboard-actividad" key={indice}>
                  <div className="dashboard-actividad-detalle">
                    <span className="dashboard-actividad-texto">{actividad.texto}</span>
                    <span className={`etiqueta etiqueta-${actividad.tipoEtiqueta}`}>
                      {actividad.etiqueta}
                    </span>
                  </div>
                  <span className="dashboard-actividad-tiempo">{actividad.tiempo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-tarjeta">
            <div className="dashboard-tarjeta-superior">
              <h3>Tareas pendientes</h3>
              <span className="dashboard-contador">{tareasPendientes.length} Tareas</span>
            </div>
            <div className="dashboard-lista-tareas">
              {tareasPendientes.map((tarea, indice) => (
                <div className="dashboard-tarea" key={indice}>
                  <div className="dashboard-tarea-contenido">
                    <span className="dashboard-tarea-texto">{tarea.texto}</span>
                    <div className="dashboard-tarea-meta">
                      <span className="dashboard-tarea-fecha">{tarea.fecha}</span>
                      <span className={`prioridad prioridad-${tarea.prioridad}`}>
                        {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-acciones">
            <h3>Accesos rápidos</h3>
            <div className="dashboard-acciones-grid">
              {accesosRapidos.map((acceso, indice) => (
                <Link key={indice} to={acceso.ruta} className={`btn-accion-rapida ${acceso.color}`}>
                  {acceso.texto}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ContenedorPrincipal>
  );
}

export default Panel;
