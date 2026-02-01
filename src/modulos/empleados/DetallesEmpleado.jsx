import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';
import { ModalEmpleado } from './componentes';

function DetallesEmpleado() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [estado, setEstado] = useState('Activo');

  const empleado = {
    id: 1,
    nombre: 'Willi G',
    cargo: 'Ingeniero de Software',
    estado: estado,
    iniciales: 'WG',
    tipoDocumento: 'Cédula de Ciudadanía',
    documento: '1129255781',
    fechaExpedicion: '2020-05-15',
    nacionalidad: 'Colombiana',
    estadoCivil: 'Soltero',
    banco: '007',
    codigoBanco: '007',
    numeroCuenta: '123546879',
    tipoCuenta: 'Ahorros',
    grupoSanguineo: 'O+',
    rh: 'Positivo',
    discapacidad: 'Ninguna',
    profesion: 'Ingeniero de Software',
    direccion: 'Calle 123 #45-67 Bogotá',
    descripcion: 'Desarrollador full-stack con experiencia en React y Node.js. Apasionado por crear soluciones innovadoras y eficientes.'
  };

  const manejarEditar = () => {
    setMostrarModal(true);
  };

  const manejarCambioEstado = (nuevoEstado) => {
    setEstado(nuevoEstado);
    console.log('Cambiar estado de empleado:', { id, nuevoEstado });
  };

  const estadosDisponibles = ['Activo', 'Inactivo', 'Vacaciones', 'Licencia', 'Suspendido'];


  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Empleados"
        subtitulo="Información detallada del colaborador"
        mostrarBoton={false}
      />

      <div className="detalles-empleado">
        <div className="detalles-acciones">
          <button className="btn-volver" onClick={() => navegar('/empleados')}>
            ← Volver
          </button>
          <div className="detalles-botones-accion">
            <button className="btn-accion btn-accion-editar" onClick={manejarEditar} title="Editar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button className="btn-accion btn-accion-eliminar" onClick={() => console.log('Eliminar empleado:', id)} title="Eliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="tarjeta-perfil">
          <div className="perfil-avatar">
            <span className="avatar-iniciales">{empleado.iniciales}</span>
          </div>
          <div className="perfil-info">
            <h2 className="perfil-nombre">{empleado.nombre}</h2>
            <p className="perfil-cargo">{empleado.cargo}</p>
          </div>
          <div className="perfil-estado">
            <select
              value={estado}
              onChange={(e) => manejarCambioEstado(e.target.value)}
              className="select-estado-empleado"
            >
              {estadosDisponibles.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información Personal</h3>
          <div className="campos-grid">
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Tipo de Documento</span>
              <span className="campo-valor">{empleado.tipoDocumento}</span>
            </div>
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Número de Documento</span>
              <span className="campo-valor">{empleado.documento}</span>
            </div>
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Fecha de Expedición</span>
              <span className="campo-valor">{new Date(empleado.fechaExpedicion).toLocaleDateString('es-CO')}</span>
            </div>
            <div className="campo-item campo-blanco">
              <span className="campo-etiqueta">Nacionalidad</span>
              <span className="campo-valor">{empleado.nacionalidad}</span>
            </div>
            <div className="campo-item campo-amarillo">
              <span className="campo-etiqueta">Estado Civil</span>
              <span className="campo-valor">{empleado.estadoCivil}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información Bancaria</h3>
          <div className="campos-grid">
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Banco</span>
              <span className="campo-valor">Bancolombia</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Código del Banco</span>
              <span className="campo-valor">{empleado.codigoBanco}</span>
            </div>
            <div className="campo-item campo-verde">
              <span className="campo-etiqueta">Número de Cuenta</span>
              <span className="campo-valor">{empleado.numeroCuenta}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información de Salud</h3>
          <div className="campos-grid">
            <div className="campo-item campo-morado">
              <span className="campo-etiqueta">Grupo Sanguíneo</span>
              <span className="campo-valor">{empleado.grupoSanguineo}</span>
            </div>
            <div className="campo-item campo-morado">
              <span className="campo-etiqueta">RH</span>
              <span className="campo-valor">{empleado.rh === 'Positivo' ? '+' : '-'}</span>
            </div>
            <div className="campo-item campo-morado">
              <span className="campo-etiqueta">Discapacidad</span>
              <span className="campo-valor">{empleado.discapacidad}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Información Adicional</h3>
          <div className="campos-grid">
            <div className="campo-item campo-azul">
              <span className="campo-etiqueta">Profesión</span>
              <span className="campo-valor">{empleado.profesion}</span>
            </div>
            <div className="campo-item campo-azul">
              <span className="campo-etiqueta">Dirección</span>
              <span className="campo-valor">{empleado.direccion}</span>
            </div>
          </div>
        </div>

        <div className="seccion-informacion">
          <h3 className="seccion-titulo">Descripción</h3>
          <div className="campo-descripcion">
            <div className="descripcion-barra"></div>
            <p className="descripcion-texto">{empleado.descripcion}</p>
          </div>
        </div>
      </div>

      <ModalEmpleado
        mostrar={mostrarModal}
        cerrar={() => setMostrarModal(false)}
        datosEmpleado={empleado}
      />
    </ContenedorPrincipal>
  );
}

export default DetallesEmpleado;

