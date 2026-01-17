import { useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';
import { ModalEmpleado } from './componentes';

function Empleados() {
  const [mostrarModal, setMostrarModal] = useState(false);
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
    },
    {
      id: 2,
      documento: '100458799',
      nombre: 'Lina Marcela Torres',
      cargo: 'Analista',
      estado: 'Activo',
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
        alHacerClic={() => setMostrarModal(true)}
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

      <div className="contenedor-tabla" style={{ marginTop: '20px' }}>
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map((empleado) => (
              <tr key={empleado.id}>
                <td>{empleado.documento}</td>
                <td>{empleado.nombre}</td>
                <td>{empleado.cargo}</td>
                <td>
                  <span className={`etiqueta etiqueta-${empleado.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                    {empleado.estado}
                  </span>
                </td>
                <td>
                  <div className="tabla-acciones">
                    <button className="btn-accion-tabla" title="Editar">✎</button>
                    <button className="btn-accion-tabla" title="Ver">👁</button>
                    <button className="btn-accion-tabla" title="Eliminar">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {empleadosFiltrados.length === 0 && (
          <div className="tabla-sin-datos">
            No se encontraron empleados con los filtros seleccionados.
          </div>
        )}
      </div>

      <ModalEmpleado
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
      />
    </ContenedorPrincipal>
  );
}

export default Empleados;
