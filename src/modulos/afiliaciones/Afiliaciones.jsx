import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, FiltrosBusqueda, TarjetasResumen, SinDatos } from '../../componentes';
import { ModalAfiliacion } from './componentes';
import '../../estilos/modulos/afiliaciones.css';

function Afiliaciones() {
  const navegar = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [afiliacionEditar, setAfiliacionEditar] = useState(null);

  const tarjetasResumen = [
    {
      etiqueta: 'Total',
      valor: '2',
      color: 'azul',
      icono: ''
    },
    {
      etiqueta: 'Aprovadas',
      valor: '2',
      color: 'verde',
      icono: ''
    },
    {
      etiqueta: 'Pendientes',
      valor: '2',
      color: 'azul',
      icono: ''
    },
    {
      etiqueta: 'En Proceso',
      valor: '2',
      color: 'amarillo',
      icono: ''
    }
  ];

  const afiliaciones = [
    {
      id: 1,
      empleado: 'Carlos Andrés Martínez',
      documento: '1001234567',
      codigo: 'AF 2024-001',
      eps: 'Sanitas EPS',
      fechaSolicitud: '15-10-2024',
      tipoRegimen: 'Nueva/Contributivo',
      estado: 'Aprovada'
    }
  ];


  const manejarNuevaAfiliacion = () => {
    setAfiliacionEditar(null);
    setMostrarModal(true);
  };

  const manejarModificar = (id) => {
    const afiliacion = afiliaciones.find(aff => aff.id === id);
    if (afiliacion) {
      // Convertir datos de la lista al formato del modal
      setAfiliacionEditar({
        documento: afiliacion.documento,
        nombre: afiliacion.empleado,
        codigoAfiliacion: afiliacion.codigo,
        eps: afiliacion.eps,
        tipoAfiliacion: afiliacion.tipoRegimen?.includes('Contributivo') ? 'Contributivo' : 'Subsidiado',
        fechaAfiliacionEPS: '',
        fondoPensiones: '',
        fechaAfiliacionPensiones: '',
        fondoCesantias: '',
        fechaAfiliacionCesantias: '',
        arl: '',
        claseRiesgo: '',
        fechaAfiliacionARL: '',
        cajaCompensacion: '',
        fechaAfiliacionCaja: '',
        descripcion: ''
      });
      setMostrarModal(true);
    }
  };

  const manejarGuardarAfiliacion = (datos) => {
    // Solo registrar en consola - el backend manejará la persistencia
    if (afiliacionEditar) {
      console.log('Actualizar afiliación:', datos);
    } else {
      console.log('Registrar nueva afiliación:', datos);
    }
    setMostrarModal(false);
    setAfiliacionEditar(null);
  };

  const manejarVerDetalles = (id) => {
    navegar(`/afiliaciones/${id}`);
  };


  const manejarFiltrar = (filtros) => {
    console.log('Filtrar afiliaciones:', filtros);
  };

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Módulo de Afiliaciones"
        subtitulo="Gestión de afiliaciones a seguridad social"
        textoBoton="Nueva Afiliación"
        alHacerClic={manejarNuevaAfiliacion}
      />

      <div className="afiliaciones-contenido">
        {/* Tarjetas de resumen */}
        <TarjetasResumen tarjetas={tarjetasResumen} />

        {/* Filtros - Separados del contenedor principal */}
        <FiltrosBusqueda
          placeholderBusqueda="Buscar por empleado, documento o código..."
          filtrosSelect={[
            {
              nombre: 'estado',
              placeholder: 'Todos los Estados',
              opciones: ['Aprovada', 'Pendiente', 'En Proceso', 'Rechazada']
            },
            {
              nombre: 'eps',
              placeholder: 'Todas las EPS',
              opciones: ['Sanitas EPS', 'SURA', 'Nueva EPS', 'Coomeva']
            }
          ]}
          onFiltrar={manejarFiltrar}
        />

        {/* Contenedor principal con lista de afiliaciones */}
        <div className="afiliaciones-contenedor-principal">
          <h2 className="afiliaciones-titulo-seccion">Afiliaciones Registradas</h2>

          {/* Lista de afiliaciones */}
          <div className="lista-afiliaciones">
            {afiliaciones.length === 0 ? (
              <SinDatos mensaje="No se encontraron afiliaciones" />
            ) : (
              afiliaciones.map((afiliacion) => (
                <div key={afiliacion.id} className="tarjeta-afiliacion">
                  <div className="tarjeta-afiliacion-header">
                    <div className="tarjeta-afiliacion-info">
                      <h3 className="tarjeta-afiliacion-nombre">{afiliacion.empleado}</h3>
                      <p className="tarjeta-afiliacion-documento">Documento: {afiliacion.documento}</p>
                    </div>
                    <div className="tarjeta-afiliacion-estado">
                      <span className="etiqueta etiqueta-verde">{afiliacion.estado}</span>
                    </div>
                  </div>
                  
                  <div className="tarjeta-afiliacion-detalles">
                    <div className="detalle-fila">
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">Código:</span>
                        <span className="detalle-valor">{afiliacion.codigo}</span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">EPS:</span>
                        <span className="detalle-valor">{afiliacion.eps}</span>
                      </div>
                    </div>
                    <div className="detalle-fila">
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">Fecha solicitud:</span>
                        <span className="detalle-valor">{afiliacion.fechaSolicitud}</span>
                      </div>
                      <div className="detalle-item">
                        <span className="detalle-etiqueta">Tipo/Régimen:</span>
                        <span className="detalle-valor">{afiliacion.tipoRegimen}</span>
                      </div>
                    </div>
                  </div>

                  <div className="tarjeta-afiliacion-acciones">
                    <button
                      className="btn-accion-afiliacion btn-eliminar"
                      onClick={() => console.log('Eliminar afiliación:', afiliacion.id)}
                    >
                      Eliminar
                    </button>
                    <button
                      className="btn-accion-afiliacion btn-modificar"
                      onClick={() => manejarModificar(afiliacion.id)}
                    >
                      Modificar
                    </button>
                    <button
                      className="btn-accion-afiliacion btn-ver-detalles"
                      onClick={() => manejarVerDetalles(afiliacion.id)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ModalAfiliacion
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setAfiliacionEditar(null);
        }}
        datosAfiliacion={afiliacionEditar}
        onGuardar={manejarGuardarAfiliacion}
      />
    </ContenedorPrincipal>
  );
}

export default Afiliaciones;

