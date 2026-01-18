import { useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';

function Incapacidades() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const incapacidades = [
    {
      id: 1,
      codigo: 1654499,
      empleado: 'Carlos Andrés Martinez',
      documento: '1001234567',
      tipo: 'Accidente Laboral',
      periodo: '11-11-2025 al 24-11-2025',
      dias: 14,
      entidad: 'ARL',
      activa: true
    }
  ];

  const estadosDisponibles = ['Activas', 'Inactivas', 'Cerradas'];
  const tiposDisponibles = ['Enfermedad General', 'Accidente Laboral', 'Licencia Maternidad', 'Licencia Paternidad'];

  const incapacidadesFiltradas = incapacidades.filter((incapacidad) => {
    const coincideBusqueda = !busqueda ||
      incapacidad.documento.includes(busqueda) ||
      incapacidad.codigo.toString().includes(busqueda) ||
      incapacidad.empleado.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = !filtroEstado || 
      (filtroEstado === 'Activas' && incapacidad.activa) ||
      (filtroEstado === 'Inactivas' && !incapacidad.activa);
    
    const coincideTipo = !filtroTipo || incapacidad.tipo === filtroTipo;
    
    return coincideBusqueda && coincideEstado && coincideTipo;
  });

  const manejarNuevaIncapacidad = () => {
    setMostrarModal(true);
  };

  const manejarEditar = (id) => {
    console.log('Editar incapacidad:', id);
  };

  const manejarVer = (id) => {
    console.log('Ver incapacidad:', id);
  };

  const manejarEliminar = (id) => {
    console.log('Eliminar incapacidad:', id);
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
        <div className="bloque-filtros-incapacidades">
          <input
            className="input-busqueda"
            placeholder="Buscar documento o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
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
          <select
            className="filtro-select"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los Tipos</option>
            {tiposDisponibles.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          <button className="btn-filtrar-incapacidades">
            Filtrar
          </button>
        </div>

        {/* Lista de incapacidades */}
        <div className="lista-incapacidades">
          {incapacidadesFiltradas.length === 0 ? (
            <div className="sin-incapacidades">
              <p>No se encontraron incapacidades</p>
            </div>
          ) : (
            incapacidadesFiltradas.map((incapacidad) => (
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
                      onClick={() => manejarEliminar(incapacidad.id)}
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
    </ContenedorPrincipal>
  );
}

export default Incapacidades;

