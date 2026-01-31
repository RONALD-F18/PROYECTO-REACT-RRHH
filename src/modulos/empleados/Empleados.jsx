import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos, FiltrosBusqueda } from '../../componentes';
import { ModalEmpleado } from './componentes';

function Empleados() {
  const navegar = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);

  const empleados = [
    {
      id: 1,
      documento: '1129244160',
      nombre: 'Ronaldo Stiven Franco Duran',
      cargo: 'Programador',
      estado: 'Activo',
      numeroCuenta: '123456789',
      tipoCuenta: 'Ahorros',
      banco: '007',
      direccion: 'Calle 100 #50-30 Bogotá',
      nacionalidad: 'Colombiana',
      estadoCivil: 'Soltero',
      profesion: 'Programador',
      discapacidad: 'Ninguna',
      rh: 'Positivo',
      grupoSanguineo: 'O+',
      fechaExpedicion: '2015-03-20',
      descripcion: 'Desarrollador con experiencia en múltiples tecnologías.'
    },
    {
      id: 2,
      documento: '100458799',
      nombre: 'Lina Marcela Torres',
      cargo: 'Analista',
      estado: 'Activo',
      numeroCuenta: '987654321',
      tipoCuenta: 'Corriente',
      banco: '007',
      direccion: 'Carrera 15 #80-45 Medellín',
      nacionalidad: 'Colombiana',
      estadoCivil: 'Casado',
      profesion: 'Analista',
      discapacidad: 'Ninguna',
      rh: 'Negativo',
      grupoSanguineo: 'A-',
      fechaExpedicion: '2018-07-10',
      descripcion: 'Analista especializada en procesos de negocio.'
    },
  ];


  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Módulo de Empleados"
        subtitulo="Sistema de Gestión de Recursos Humanos"
        textoBoton="Nuevo Empleado"
        alHacerClic={() => {
          setEmpleadoEditar(null);
          setMostrarModal(true);
        }}
      />

      <FiltrosBusqueda
        titulo="Empleados Registrados"
        placeholderBusqueda="Buscar por nombre o documento..."
        filtrosSelect={[
          {
            nombre: 'estado',
            placeholder: 'Todos los estados',
            opciones: ['Activo', 'Inactivo']
          },
          {
            nombre: 'cargo',
            placeholder: 'Todos los cargos',
            opciones: ['Programador', 'Analista']
          }
        ]}
        onFiltrar={(filtros) => console.log('Filtrar empleados:', filtros)}
      />

      <div style={{ marginTop: '20px' }}>
        <TablaDatos
          columnas={[
            { campo: 'documento', encabezado: 'Documento' },
            { campo: 'nombre', encabezado: 'Nombre' },
            { campo: 'cargo', encabezado: 'Cargo' },
            {
              campo: 'estado',
              encabezado: 'Estado',
              renderizar: (estado) => (
                <span className={`etiqueta etiqueta-${estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                  {estado}
                </span>
              )
            }
          ]}
          datos={empleados}
          renderAcciones={(empleado) => (
            <>
              <button
                className="btn-accion-tabla btn-accion-editar"
                title="Editar"
                onClick={() => {
                  setEmpleadoEditar(empleado);
                  setMostrarModal(true);
                }}
              >
                ✎
              </button>
              <button
                className="btn-accion-tabla btn-accion-ver"
                title="Ver"
                onClick={() => navegar(`/empleados/${empleado.id}`)}
              >
                👁
              </button>
              <button className="btn-accion-tabla btn-accion-eliminar" title="Eliminar">🗑</button>
            </>
          )}
        />
      </div>

      <ModalEmpleado
        mostrar={mostrarModal}
        cerrar={() => {
          setMostrarModal(false);
          setEmpleadoEditar(null);
        }}
        datosEmpleado={empleadoEditar}
      />
    </ContenedorPrincipal>
  );
}

export default Empleados;
