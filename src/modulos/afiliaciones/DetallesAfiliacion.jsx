import { useNavigate, useParams } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TarjetaInformacion } from '../../componentes';
import '../../estilos/modulos/afiliaciones.css';

function DetallesAfiliacion() {
  const { id } = useParams();
  const navegar = useNavigate();

  const afiliacion = {
    id,
    empleado: 'Willi G',
    iniciales: 'WG',
    documento: '321321123',
    codigo: 'AF-2025-002',
    estado: 'Activo',
    eps: {
      entidad: 'Salud Total',
      tipo: 'Contributivo',
      fechaAfiliacion: '30/11/2025'
    },
    pensiones: {
      entidad: 'Protección',
      fechaAfiliacion: '30/11/2025'
    },
    cesantias: {
      entidad: 'Colfondos',
      fechaAfiliacion: '30/11/2025'
    },
    arl: {
      entidad: 'Positiva',
      claseRiesgo: 'I',
      fechaAfiliacion: '30/11/2025'
    },
    cajaCompensacion: {
      entidad: 'Cafam',
      fechaAfiliacion: '30/11/2025'
    }
  };

  const manejarEditar = () => {
    navegar(`/afiliaciones/${id}/editar`);
  };

  const manejarInactivar = () => {
    if (window.confirm('¿Está seguro de inactivar esta afiliación?')) {
      console.log('Inactivar afiliación:', id);
    }
  };

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Afiliaciones"
        subtitulo="Detalle completo de la afiliación seleccionada"
        mostrarBoton={false}
      />

      <div className="detalle-afiliacion">
        <div className="detalles-acciones">
          <button
            type="button"
            className="btn-volver"
            onClick={() => navegar('/afiliaciones')}
          >
            ← Volver
          </button>
          <div className="detalles-botones-accion">
            <button
              type="button"
              className="btn-accion btn-accion-editar"
              onClick={manejarEditar}
              title="Editar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              type="button"
              className="btn-accion btn-accion-eliminar"
              onClick={() => console.log('Eliminar afiliación:', id)}
              title="Eliminar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Encabezado morado */}
        <section className="detalle-afiliacion-encabezado">
          <div className="detalle-afiliacion-info">
            <div className="detalle-afiliacion-avatar">
              <span>{afiliacion.iniciales}</span>
            </div>
            <div className="detalle-afiliacion-datos">
              <h1>Detalle de Afiliación</h1>
              <p>Información completa de seguridad social</p>
              <div className="detalle-afiliacion-empleado">
                <span className="detalle-afiliacion-nombre">{afiliacion.empleado}</span>
                <span className="detalle-afiliacion-documento">{afiliacion.documento}</span>
                <span className="detalle-afiliacion-codigo">Código {afiliacion.codigo}</span>
              </div>
            </div>
          </div>
          <div className="detalle-afiliacion-estado">
            <span className="etiqueta etiqueta-verde">{afiliacion.estado}</span>
          </div>
        </section>

        {/* Grid 2x2 de información */}
        <div className="detalle-afiliacion-grid">
          <TarjetaInformacion
            titulo="Entidad Promotora de Salud (EPS)"
            color="azul"
            campos={[
              { etiqueta: 'Entidad', valor: afiliacion.eps.entidad },
              { etiqueta: 'Tipo', valor: afiliacion.eps.tipo },
              { etiqueta: 'Fecha de Afiliación', valor: afiliacion.eps.fechaAfiliacion }
            ]}
          />
          <TarjetaInformacion
            titulo="Fondo de Pensiones"
            color="verde"
            campos={[
              { etiqueta: 'Entidad', valor: afiliacion.pensiones.entidad },
              { etiqueta: 'Fecha de Afiliación', valor: afiliacion.pensiones.fechaAfiliacion }
            ]}
          />
          <TarjetaInformacion
            titulo="Fondo de Cesantías"
            color="morado"
            campos={[
              { etiqueta: 'Entidad', valor: afiliacion.cesantias.entidad },
              { etiqueta: 'Fecha de Afiliación', valor: afiliacion.cesantias.fechaAfiliacion }
            ]}
          />
          <TarjetaInformacion
            titulo="Aseguradora de riesgos Laborales (ARL)"
            color="rojo"
            campos={[
              { etiqueta: 'Entidad', valor: afiliacion.arl.entidad },
              { etiqueta: 'Clase de Riesgo', valor: afiliacion.arl.claseRiesgo },
              { etiqueta: 'Fecha de Afiliación', valor: afiliacion.arl.fechaAfiliacion }
            ]}
          />
        </div>

        {/* Caja de Compensación Familiar */}
        <TarjetaInformacion
          titulo="Caja de Compensación Familiar"
          color="amarillo"
          campos={[
            { etiqueta: 'Entidad', valor: afiliacion.cajaCompensacion.entidad },
            { etiqueta: 'Fecha de Afiliación', valor: afiliacion.cajaCompensacion.fechaAfiliacion }
          ]}
        />

        {/* Sección de Acciones */}
        <section className="detalle-afiliacion-seccion-acciones">
          <h2 className="detalle-seccion-titulo">Acciones</h2>
          <div className="detalle-afiliacion-acciones">
            <button
              type="button"
              className="btn-detalle btn-detalle-primario"
              onClick={manejarEditar}
            >
              Editar Afiliación
            </button>
            <button
              type="button"
              className="btn-detalle btn-detalle-eliminar"
              onClick={manejarInactivar}
            >
              Inactivar
            </button>
            <button
              type="button"
              className="btn-detalle btn-detalle-secundario"
              onClick={() => navegar('/afiliaciones')}
            >
              Volver
            </button>
          </div>
        </section>
      </div>
    </ContenedorPrincipal>
  );
}

export default DetallesAfiliacion;

