import { useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';

function Incapacidades() {
  const navegar = useNavigate();

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


  const manejarNuevaIncapacidad = () => {
    console.log('Nueva incapacidad');
  };

  const manejarEditar = (id) => {
    navegar(`/incapacidades/${id}/editar`);
  };

  const manejarVer = (id) => {
    navegar(`/incapacidades/${id}`);
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
            type="text"
            className="input-busqueda"
            placeholder="Buscar documento o código..."
          />
          <div className="filtro-grupo">
            <label>Estado</label>
            <select className="filtro-select">
              <option value="">Todo los Estados</option>
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>
          <div className="filtro-grupo">
            <label>Tipo</label>
            <select className="filtro-select">
              <option value="">Todo los Tipos</option>
              <option value="Accidente Laboral">Accidente Laboral</option>
              <option value="Enfermedad General">Enfermedad General</option>
              <option value="Licencia">Licencia</option>
            </select>
          </div>
          <button className="btn-filtrar-incapacidades" type="button">
            <span className="icono-busqueda"></span>
            Filtrar
          </button>
        </div>

        {/* Lista de incapacidades */}
        <div className="lista-incapacidades">
          {incapacidades.length === 0 ? (
            <div className="sin-incapacidades">
              <p>No se encontraron incapacidades</p>
            </div>
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

