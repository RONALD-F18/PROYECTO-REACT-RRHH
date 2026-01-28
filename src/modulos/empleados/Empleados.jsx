import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos } from '../../componentes';
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

      <div className="bloque-filtros">
        <h2>Empleados Registrados</h2>
        <div className="fila-filtros-grid">
          <div className="caja-busqueda">
            <span className="icono-busqueda"></span>
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
            />
          </div>
          <select className="filtro-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <select className="filtro-select">
            <option value="">Todos los cargos</option>
            <option value="Programador">Programador</option>
            <option value="Analista">Analista</option>
          </select>
          <button className="btn-filtrar" type="button">
            <span className="icono-busqueda"></span>
            Filtrar
          </button>
        </div>
      </div>

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
