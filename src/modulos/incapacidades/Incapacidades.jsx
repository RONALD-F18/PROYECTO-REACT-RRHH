import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, FiltrosBusqueda, SinDatos } from '../../componentes';
import { ModalIncapacidad } from './componentes';

function Incapacidades() {
  const navegar = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [incapacidadEditar, setIncapacidadEditar] = useState(null);
  const [incapacidades] = useState([
    {
      id: 1,
      codigo: 1654499,
      empleado: 'Carlos Andrés Martinez',
      documento: '1001234567',
      nombre: 'Carlos Andrés Martinez',
      codigoContrato: 'CT-2024-001',
      codigoAfiliacion: '1654499',
      tipo: 'Accidente Laboral',
      tipoIncapacidad: 'Accidente Laboral',
      periodo: '11-11-2025 al 24-11-2025',
      fechaInicio: '2025-11-11',
      fechaFin: '2025-11-24',
      dias: 14,
      diasCalculados: 14,
      entidad: 'ARL',
      activa: true,
      diagnostico: 'Se detectaron cálculos renales con signos obstructivos. Se recomienda reposo y seguimiento médico.',
      descripcionDiagnostico: 'Se detectaron cálculos renales con signos obstructivos. Se recomienda reposo y seguimiento médico.',
      codigoClasificacion: 'J00, S82',
      codigoEnfermedad: '545656',
      observaciones: 'Que tal como se encuentra.',
      descripcion: 'Que tal como se encuentra.'
    }
  ]);

  const manejarNuevaIncapacidad = () => {
    setIncapacidadEditar(null);
    setMostrarModal(true);
  };

  const manejarEditar = (id) => {
    const incapacidad = incapacidades.find(inc => inc.id === id);
    if (incapacidad) {
      setIncapacidadEditar(incapacidad);
      setMostrarModal(true);
    }
  };

  const manejarGuardarIncapacidad = (datos) => {
    // Solo registrar en consola - el backend manejará la persistencia
    if (incapacidadEditar) {
      console.log('Actualizar incapacidad:', { id: incapacidadEditar.id, ...datos });
    } else {
      console.log('Registrar nueva incapacidad:', datos);
    }
    setMostrarModal(false);
    setIncapacidadEditar(null);
  };

  const manejarVer = (id) => {
    navegar(`/incapacidades/${id}`);
  };


  const manejarFiltrar = (filtros) => {
    console.log('Filtrar incapacidades:', filtros);
    // Aquí se implementaría la lógica de filtrado
  };

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Módulo Incapacidades"
        subtitulo="Control de incapacidades médicas y licencias"
        textoBoton="Nueva Incapacidad"
        alHacerClic={manejarNuevaIncapacidad}
      />

      <div className="incapacidades-contenido">
        <div>
          <h2 className="incapacidades-titulo">Gestión de Incapacidades</h2>
          <p className="incapacidades-subtitulo">Control de incapacidades médicas y licencias</p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="tarjetas-resumen-incapacidades">
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Total</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-morado">0</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Activas</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-rojo">0</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Origen Común</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-verde">0</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Laboral</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-naranja">0</span>
          </div>
          <div className="tarjeta-resumen-incapacidad">
            <span className="tarjeta-resumen-etiqueta">Total Días</span>
            <span className="tarjeta-resumen-valor tarjeta-resumen-morado">0</span>
          </div>
        </div>

        {/* Tarjeta de costo total */}
        <div className="tarjeta-costo-total">
          <div className="tarjeta-costo-contenido">
            <span className="tarjeta-costo-etiqueta">Costo Total de Incapacidades</span>
            <span className="tarjeta-costo-valor">$3.200.000</span>
          </div>
          <div className="tarjeta-costo-icono">$</div>
        </div>

        {/* Filtros */}
        <FiltrosBusqueda
          placeholderBusqueda="Buscar documento o código..."
          filtrosSelect={[
            {
              nombre: 'estado',
              placeholder: 'Todos los Estados',
              opciones: ['Activa', 'Inactiva']
            },
            {
              nombre: 'tipo',
              placeholder: 'Todos los Tipos',
              opciones: ['Accidente Laboral', 'Enfermedad General', 'Licencia']
            }
          ]}
          onFiltrar={manejarFiltrar}
        />

        {/* Lista de incapacidades */}
        <div className="lista-incapacidades">
          {incapacidades.length === 0 ? (
            <SinDatos mensaje="No se encontraron incapacidades" />
          ) : (
            incapacidades.map((incapacidad) => (
              <div key={incapacidad.id} className="tarjeta-incapacidad">
                <div className="tarjeta-incapacidad-header">
                  <div className="tarjeta-incapacidad-info-empleado">
                    <h3 className="tarjeta-incapacidad-nombre">{incapacidad.empleado}</h3>
                    <p className="tarjeta-incapacidad-documento">Documento: {incapacidad.documento}</p>
                  </div>
                  <div className="tarjeta-incapacidad-acciones">
                    <button
                      className="btn-accion-incapacidad btn-accion-editar"
                      title="Editar"
                      onClick={() => manejarEditar(incapacidad.id)}
                    >
                      ✎
                    </button>
                    <button
                      className="btn-accion-incapacidad btn-accion-ver"
                      title="Ver"
                      onClick={() => manejarVer(incapacidad.id)}
                    >
                      👁
                    </button>
                    <button
                      className="btn-accion-incapacidad btn-accion-eliminar"
                      title="Eliminar"
                      onClick={() => console.log('Eliminar incapacidad:', incapacidad.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <div className="tarjeta-incapacidad-detalles">
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Código</span>
                    <span className="detalle-valor">{incapacidad.codigo}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Tipo</span>
                    <span className="detalle-valor">{incapacidad.tipo}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Periodo</span>
                    <span className="detalle-valor">{incapacidad.periodo}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Días</span>
                    <span className="detalle-valor">{incapacidad.dias}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Entidad</span>
                    <span className="detalle-valor">{incapacidad.entidad}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Activa</span>
                    <span className="etiqueta etiqueta-verde">{incapacidad.activa ? 'Activa' : 'Inactiva'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ModalIncapacidad
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setIncapacidadEditar(null);
        }}
        datosIncapacidad={incapacidadEditar}
        onGuardar={manejarGuardarIncapacidad}
      />
    </ContenedorPrincipal>
  );
}

export default Incapacidades;

