import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo, TablaDatos } from '../../componentes';
import { ModalEmpleado } from './componentes';

function Empleados() {
  const navegar = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

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

  const cargosDisponibles = ['Programador', 'Analista', 'Gerente', 'Diseñador'];
  const estadosDisponibles = ['Activo', 'Inactivo'];

  const empleadosFiltrados = empleados.filter((empleado) => {
    const coincideBusqueda =
      empleado.documento.includes(busqueda) ||
      empleado.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.cargo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCargo = !filtroCargo || empleado.cargo === filtroCargo;
    const coincideEstado = !filtroEstado || empleado.estado === filtroEstado;
    return coincideBusqueda && coincideCargo && coincideEstado;
  });

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
              placeholder="Buscar por documento, nombre o cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select
            className="filtro-select"
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
          >
            <option value="">Todos los Cargos</option>
            {cargosDisponibles.map((cargo) => (
              <option key={cargo} value={cargo}>{cargo}</option>
            ))}
          </select>
          <select
            className="filtro-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            {estadosDisponibles.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
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
          datos={empleadosFiltrados}
          renderAcciones={(empleado) => (
            <>
              <button 
                className="btn-accion-tabla" 
                title="Editar"
                onClick={() => {
                  setEmpleadoEditar(empleado);
                  setMostrarModal(true);
                }}
              >
                ✎
              </button>
              <button 
                className="btn-accion-tabla" 
                title="Ver"
                onClick={() => navegar(`/empleados/${empleado.id}`)}
              >
                👁
              </button>
              <button className="btn-accion-tabla" title="Eliminar">🗑</button>
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
