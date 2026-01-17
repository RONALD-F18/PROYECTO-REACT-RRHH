import { useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';
import { ModalUsuario } from './componentes';

function Usuarios() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const listaUsuarios = [
    { id: 1, nombre: 'Carlos Andrés Gomez', documento: '1015432198', telefono: '+57 310 555 1234', rol: 'Administrador', estado: 'Activo', ultimoAcceso: 'Hoy 10:30 AM' },
    { id: 2, nombre: 'María Fernanda López', documento: '1020567834', telefono: '+57 320 555 7890', rol: 'Funcionario', estado: 'Activo', ultimoAcceso: 'Hoy 09:15 AM' },
    { id: 3, nombre: 'Juan Pablo Martínez', documento: '1025678901', telefono: '+57 315 555 9876', rol: 'Funcionario', estado: 'Activo', ultimoAcceso: 'Ayer 04:45 PM' },
    { id: 4, nombre: 'Andrea Carolina Silva', documento: '1033705584', telefono: '+57 318 555 4321', rol: 'Funcionario', estado: 'Inactivo', ultimoAcceso: '15/11/2025' },
  ];

  const estadisticas = {
    total: listaUsuarios.length,
    activos: listaUsuarios.filter((u) => u.estado === 'Activo').length,
    inactivos: listaUsuarios.filter((u) => u.estado === 'Inactivo').length,
    admins: listaUsuarios.filter((u) => u.rol === 'Administrador').length,
  };

  return (
    <ContenedorPrincipal>
      <div className="modulo-usuarios">
        <EncabezadoModulo
          titulo="Gestión de Usuarios"
          subtitulo="Administración de acceso y permisos"
          textoBoton="Nuevo Usuario"
          alHacerClic={() => {
            setUsuarioEditar(null);
            setMostrarModal(true);
          }}
        />

        <div className="tarjetas-resumen">
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Total Usuarios</span>
            <span className="tarjeta-resumen-valor">{estadisticas.total}</span>
          </div>
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Activos</span>
            <span className="tarjeta-resumen-valor verde">{estadisticas.activos}</span>
          </div>
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Inactivos</span>
            <span className="tarjeta-resumen-valor gris">{estadisticas.inactivos}</span>
          </div>
          <div className="tarjeta-resumen">
            <span className="tarjeta-resumen-etiqueta">Administradores</span>
            <span className="tarjeta-resumen-valor azul">{estadisticas.admins}</span>
          </div>
        </div>

        <div className="bloque-filtros">
          <div className="caja-busqueda">
            <span className="icono-busqueda"></span>
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
            />
          </div>
          <div className="fila-filtros">
            <select className="filtro-select">
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <select className="filtro-select">
              <option value="">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Funcionario">Funcionario</option>
            </select>
          </div>
        </div>

        <div className="contenedor-tabla">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último Acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="usuario-info">
                      <span className="usuario-nombre">{usuario.nombre}</span>
                      <span className="usuario-documento">C.C {usuario.documento}</span>
                    </div>
                  </td>
                  <td>{usuario.telefono}</td>
                  <td>
                    <span className={`etiqueta etiqueta-${usuario.rol === 'Administrador' ? 'admin' : 'funcionario'}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`etiqueta etiqueta-${usuario.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="fecha-acceso">{usuario.ultimoAcceso}</td>
                  <td>
                    <div className="tabla-acciones">
                      <button
                        className="btn-accion-tabla"
                        title="Editar"
                        onClick={() => {
                          setUsuarioEditar(usuario);
                          setMostrarModal(true);
                        }}
                      >
                        ✎
                      </button>
                      <button className="btn-accion-tabla" title="Eliminar">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ModalUsuario
          mostrar={mostrarModal}
          cerrar={() => {
            setMostrarModal(false);
            setUsuarioEditar(null);
          }}
          datosUsuario={usuarioEditar}
        />
      </div>
    </ContenedorPrincipal>
  );
}

export default Usuarios;
