import { useNavigate, useParams } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';

function DetallesIncapacidad() {
  const { id } = useParams();
  const navegar = useNavigate();

  const incapacidad = {
    id,
    empleado: 'Willi G',
    iniciales: 'WG',
    documento: '32131123',
    codigo: '654546',
    tipo: 'Accidente Laboral',
    dias: 14,
    fechaInicio: '11/11/2025',
    fechaFin: '24/11/2025',
    pagador: 'ARL',
    porcentajePagador: '100%',
    descripcionDiagnostico:
      'Se detectaron cálculos renales con signos obstructivos. Se recomienda reposo y seguimiento médico.',
    codigoEnfermedad: '545656',
    diasEmpresa: 0,
    valorEmpresa: '$0',
    diasEps: 0,
    valorEps: '$0',
    diasArl: 14,
    valorArl: '$1.633.333',
    totalPagado: '$1.633.333',
    salarioBase: '$3.633.333',
    salarioDiario: '$116.667',
    observaciones: 'Que tal como se encuentra.',
    estado: 'Activa',
  };

  const manejarEditar = () => {
    navegar(`/incapacidades/${id}/editar`);
  };

  const manejarEliminar = () => {
    console.log('Eliminar incapacidad');
  };

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Incapacidades"
        subtitulo="Detalle completo de la incapacidad seleccionada"
        mostrarBoton={false}
      />

      <div className="detalle-incapacidad">
        <div className="detalles-acciones">
          <button
            type="button"
            className="btn-volver"
            onClick={() => navegar('/incapacidades')}
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
              onClick={manejarEliminar}
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

        <section className="detalle-incapacidad-encabezado">
          <div className="detalle-incapacidad-info">
            <div className="detalle-incapacidad-avatar">
              <span>{incapacidad.iniciales}</span>
            </div>
            <div className="detalle-incapacidad-datos">
              <h1>Detalles de la Incapacidad</h1>
              <p>Información completa del registro médico</p>
              <div className="detalle-incapacidad-empleado">
                <div>
                  <span className="detalle-incapacidad-nombre">{incapacidad.empleado}</span>
                  <span className="detalle-incapacidad-documento">
                    {incapacidad.documento}
                  </span>
                  <span className="detalle-incapacidad-codigo">
                    Código: {incapacidad.codigo}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="detalle-incapacidad-estado">
            <span className="etiqueta etiqueta-verde">{incapacidad.estado}</span>
          </div>
        </section>

        <section className="detalle-incapacidad-resumen-grid">
          <article className="detalle-incapacidad-tarjeta">
            <span className="detalle-tarjeta-etiqueta">Tipo</span>
            <h3 className="detalle-tarjeta-titulo">{incapacidad.tipo}</h3>
          </article>
          <article className="detalle-incapacidad-tarjeta">
            <span className="detalle-tarjeta-etiqueta">Duración</span>
            <h3 className="detalle-tarjeta-titulo">{incapacidad.dias} días</h3>
            <p className="detalle-tarjeta-subtexto">
              Del {incapacidad.fechaInicio} al {incapacidad.fechaFin}
            </p>
          </article>
          <article className="detalle-incapacidad-tarjeta">
            <span className="detalle-tarjeta-etiqueta">Pagador</span>
            <h3 className="detalle-tarjeta-titulo">{incapacidad.pagador}</h3>
            <p className="detalle-tarjeta-subtexto">{incapacidad.porcentajePagador}</p>
          </article>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto azul"></span>
            <h2>Diagnóstico Médico</h2>
          </header>
          <div className="detalle-incapacidad-card">
            <p className="detalle-incapacidad-descripcion">
              {incapacidad.descripcionDiagnostico}
            </p>
            <div className="detalle-incapacidad-codigo">
              <span className="detalle-etiqueta">Código Enfermedad</span>
              <span className="detalle-valor">{incapacidad.codigoEnfermedad}</span>
            </div>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto verde"></span>
            <h2>Distribución de Pagos</h2>
          </header>
          <div className="detalle-incapacidad-distribucion">
            <div className="bloque-pago empresa">
              <span className="bloque-pago-etiqueta">Días Empresa</span>
              <span className="bloque-pago-valor">{incapacidad.diasEmpresa}</span>
              <span className="bloque-pago-monto">{incapacidad.valorEmpresa}</span>
            </div>
            <div className="bloque-pago eps">
              <span className="bloque-pago-etiqueta">Días EPS</span>
              <span className="bloque-pago-valor">{incapacidad.diasEps}</span>
              <span className="bloque-pago-monto">{incapacidad.valorEps}</span>
            </div>
            <div className="bloque-pago arl">
              <span className="bloque-pago-etiqueta">Días ARL</span>
              <span className="bloque-pago-valor">{incapacidad.diasArl}</span>
              <span className="bloque-pago-monto">{incapacidad.valorArl}</span>
            </div>
            <div className="bloque-pago total">
              <span className="bloque-pago-etiqueta">Total Pagado</span>
              <span className="bloque-pago-valor">{incapacidad.totalPagado}</span>
            </div>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto celeste"></span>
            <h2>Base Salarial</h2>
          </header>
          <div className="detalle-incapacidad-salario">
            <div>
              <span className="detalle-etiqueta">Salario Base del Contrato</span>
              <span className="detalle-valor">{incapacidad.salarioBase}</span>
            </div>
            <div>
              <span className="detalle-etiqueta">Salario Diario</span>
              <span className="detalle-valor">{incapacidad.salarioDiario}</span>
            </div>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion">
          <header className="detalle-seccion-header">
            <span className="detalle-seccion-punto gris"></span>
            <h2>Observaciones</h2>
          </header>
          <div className="detalle-incapacidad-card">
            <p className="detalle-incapacidad-descripcion">
              {incapacidad.observaciones}
            </p>
          </div>
        </section>

        <section className="detalle-incapacidad-seccion acciones">
          <h2 className="detalle-seccion-titulo">Acciones</h2>
          <div className="detalle-incapacidad-acciones">
            <button type="button" className="btn-detalle btn-detalle-primario">
              Finalizar Incapacidad
            </button>
            <button
              type="button"
              className="btn-detalle btn-detalle-secundario"
              onClick={() => navegar('/incapacidades')}
            >
              Volver al listado
            </button>
          </div>
        </section>
      </div>
    </ContenedorPrincipal>
  );
}

export default DetallesIncapacidad;


