import { useState } from 'react';
import { ContenedorPrincipal, EncabezadoModulo } from '../../componentes';

function Usuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const usuarios = [
    { id: 1, nombre: 'Carlos Andrés Gomez', documento: '1015432198', telefono: '+57 310 555 1234', rol: 'Administrador', estado: 'Activo', ultimoAcceso: 'Hoy 10:30 AM' },
    { id: 2, nombre: 'María Fernanda López', documento: '1020567834', telefono: '+57 320 555 7890', rol: 'Funcionario', estado: 'Activo', ultimoAcceso: 'Hoy 09:15 AM' },
    { id: 3, nombre: 'Juan Pablo Martínez', documento: '1025678901', telefono: '+57 315 555 9876', rol: 'Funcionario', estado: 'Activo', ultimoAcceso: 'Ayer 04:45 PM' },
    { id: 4, nombre: 'Andrea Carolina Silva', documento: '1033705584', telefono: '+57 318 555 4321', rol: 'Funcionario', estado: 'Inactivo', ultimoAcceso: '15/11/2025' },
  ];

  const conteo = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.estado === 'Activo').length,
    inactivos: usuarios.filter((u) => u.estado === 'Inactivo').length,
    admins: usuarios.filter((u) => u.rol === 'Administrador').length,
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideBusqueda = usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) || usuario.documento.includes(busqueda);
    const coincideEstado = !filtroEstado || usuario.estado === filtroEstado;
    const coincideRol = !filtroRol || usuario.rol === filtroRol;
    return coincideBusqueda && coincideEstado && coincideRol;
  });

  return (
    <ContenedorPrincipal>
      <EncabezadoModulo
        titulo="Gestión de Usuarios"
        subtitulo="Administración de acceso y permisos"
        textoBoton="Nuevo Usuario"
        alHacerClic={() => console.log('Nuevo usuario')}
      />

      <div className="tarjetas-resumen" style={{ marginBottom: '20px' }}>
        <div className="tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Total Usuarios</span>
          <span className="tarjeta-resumen-valor">{conteo.total}</span>
        </div>
        <div className="tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Activos</span>
          <span className="tarjeta-resumen-valor verde">{conteo.activos}</span>
        </div>
        <div className="tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Inactivos</span>
          <span className="tarjeta-resumen-valor gris">{conteo.inactivos}</span>
        </div>
        <div className="tarjeta-resumen">
          <span className="tarjeta-resumen-etiqueta">Administradores</span>
          <span className="tarjeta-resumen-valor azul">{conteo.admins}</span>
        </div>
      </div>

      <div className="bloque-filtros">
        <div className="caja-busqueda">
          <span className="icono-busqueda">🔍</span>
          <input
            placeholder="Buscar por nombre o documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="fila-filtros" style={{ marginTop: '14px' }}>
          <select className="filtro-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <select className="filtro-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Funcionario">Funcionario</option>
          </select>
        </div>
      </div>

      <div className="contenedor-tabla" style={{ marginTop: '20px' }}>
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
            {usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600 }}>{usuario.nombre}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>C.C {usuario.documento}</span>
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
                <td style={{ color: '#64748b', fontSize: '13px' }}>{usuario.ultimoAcceso}</td>
                <td>
                  <div className="tabla-acciones">
                    <button className="btn-accion-tabla" title="Editar">✎</button>
                    <button className="btn-accion-tabla" title="Eliminar">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContenedorPrincipal>
  );
}

export default Usuarios;
