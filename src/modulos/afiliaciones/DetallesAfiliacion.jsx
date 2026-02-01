import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TarjetaInformacion } from '../../componentes';
import '../../estilos/modulos/afiliaciones.css';

function DetallesAfiliacion() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [estado, setEstado] = useState('Activa');

  const afiliacion = {
    id,
    empleado: 'Willi G',
    iniciales: 'WG',
    documento: '321321123',
    codigo: 'AF-2025-002',
    estado: estado,
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

  const manejarCambioEstado = (nuevoEstado) => {
    setEstado(nuevoEstado);
    console.log('Cambiar estado de afiliación:', { id, nuevoEstado });
  };

  const estadosDisponibles = ['Activa', 'Aprovada', 'Pendiente', 'En Proceso', 'Rechazada'];

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
            <select
              value={estado}
              onChange={(e) => manejarCambioEstado(e.target.value)}
              className="select-estado-afiliacion"
            >
              {estadosDisponibles.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
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

