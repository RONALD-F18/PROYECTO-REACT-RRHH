import Sidebar from "../../components/Sidebar";
import "./Users.css";

function Users() {
  const usuarios = [
    {
      id: 1,
      nombre: "Carlos Andrés Gomez",
      doc: "1015432198",
      telefono: "+57 3105551234",
      rol: "Administrador",
      estado: "Activo",
      ultimoAcceso: "Hoy 10:30 AM",
    },
    {
      id: 2,
      nombre: "María Fernanda López",
      doc: "1020567834",
      telefono: "+57 3205557890",
      rol: "Funcionario",
      estado: "Activo",
      ultimoAcceso: "Hoy 09:15 AM",
    },
    {
      id: 3,
      nombre: "Juan Pablo Martínez",
      doc: "1025678901",
      telefono: "+57 3155559876",
      rol: "Funcionario",
      estado: "Activo",
      ultimoAcceso: "Ayer 04:45 PM",
    },
    {
      id: 4,
      nombre: "Andrea Carolina Silva",
      doc: "1033705584",
      telefono: "+57 3185554321",
      rol: "Funcionario",
      estado: "Inactivo",
      ultimoAcceso: "15/11/2025",
    },
  ];

  return (
    <div className="contenedor-aplicacion">
      <Sidebar />

      <main className="zona-principal">
        <header className="encabezado-usuarios">
          <div className="texto-usuarios">
            <h1>Gestión de Usuarios</h1>
            <p>Administración de acceso y permisos</p>
          </div>
          <button className="btn-nuevo">Nuevo Usuario</button>
        </header>

        <div className="cuerpo-usuarios">
          <div className="tarjetas-resumen">
            <div className="tarjeta-resumen">
              <span className="etiqueta-resumen">Total Usuarios</span>
              <span className="valor-resumen">4</span>
            </div>
            <div className="tarjeta-resumen">
              <span className="etiqueta-resumen">Activos</span>
              <span className="valor-resumen">3</span>
            </div>
            <div className="tarjeta-resumen">
              <span className="etiqueta-resumen">Inactivos</span>
              <span className="valor-resumen">1</span>
            </div>
            <div className="tarjeta-resumen">
              <span className="etiqueta-resumen">Administradores</span>
              <span className="valor-resumen">1</span>
            </div>
          </div>

          <div className="bloque-filtros">
            <div className="caja-busqueda">
              <span className="icono-busqueda">🔍</span>
              <input placeholder="Buscar por nombre, email o documento..." />
            </div>
            <div className="fila-filtros">
              <select>
                <option>Todos los estados</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
              <select>
                <option>Todos los roles</option>
                <option>Administrador</option>
                <option>Funcionario</option>
              </select>
            </div>
          </div>

          <div className="tabla-usuarios">
            <table className="cuadro-usuarios">
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
                {usuarios.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="celda-usuario">
                        <span className="usuario-nombre">{user.nombre}</span>
                        <span className="usuario-doc">C.C {user.doc}</span>
                      </div>
                    </td>
                    <td>{user.telefono}</td>
                    <td>
                      <span className="etiqueta-rol">{user.rol}</span>
                    </td>
                    <td>
                      <span className="etiqueta-estado">{user.estado}</span>
                    </td>
                    <td>{user.ultimoAcceso}</td>
                    <td className="acciones">
                      <button>✎</button>
                      <button>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Users;
