import Sidebar from "../../components/Sidebar";
import "./Empleados.css";

function Empleados() {
  const empleados = [
    {
      id: 1,
      documento: "1129244160",
      nombre: "Ronaldo Stiven Franco Duran",
      cargo: "Programador",
      estado: "Activo",
      tipoCuenta: "Ahorros",
      numeroCuenta: "123546879",
      banco: "Bancolombia",
      codigoBanco: "007",
      direccion: "Calle 123 #45-67 Bogotá",
      discapacidad: "Ninguna",
      nacionalidad: "Colombiana",
      rh: "+",
      estadoCivil: "Soltero",
      grupoSanguineo: "O",
      profesion: "Ingeniero de Software",
      fechaExpedicion: "15/03/2020",
      descripcion:
        "Desarrollador full-stack con experiencia en React y Node.js. Apasionado por crear soluciones innovadoras y eficientes.",
    },
    {
      id: 2,
      documento: "100458799",
      nombre: "Lina Marcela Torres",
      cargo: "Analista",
      estado: "Activo",
      tipoCuenta: "Corriente",
      numeroCuenta: "458796321",
      banco: "Davivienda",
      codigoBanco: "051",
      direccion: "Av. 19 #45 Bogotá",
      discapacidad: "Ninguna",
      nacionalidad: "Colombiana",
      rh: "-",
      estadoCivil: "Casada",
      grupoSanguineo: "A",
      profesion: "Administradora",
      fechaExpedicion: "11/02/2017",
      descripcion:
        "Analista de procesos con enfoque en experiencia del empleado.",
    },
  ];

  return (
    <div className="contenedor-aplicacion">
      <Sidebar />

      <main className="zona-principal">
        <header className="encabezado-empleados">
          <div className="texto-empleados">
            <h1>Módulo de Empleados</h1>
            <p>Sistema de Gestión de Recursos Humanos</p>
          </div>
          <button className="btn-nuevo">Nuevo Empleado</button>
        </header>

        <div className="cuerpo-empleados">
          <section className="bloque-filtros">
            <h2>Empleados Registrados</h2>
            <div className="fila-filtros">
              <div className="caja-busqueda">
                <span className="icono-busqueda">🔍</span>
                <input placeholder="Buscar por documento, nombre o cargo..." />
              </div>
              <select>
                <option>Todos los Cargos</option>
                <option>Programador</option>
                <option>Analista</option>
                <option>Gerente</option>
              </select>
              <select>
                <option>Todos los Estados</option>
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </div>
          </section>

          <section className="tabla-empleados">
            <table>
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
                {empleados.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.documento}</td>
                    <td>{emp.nombre}</td>
                    <td>{emp.cargo}</td>
                    <td>
                      <span className="etiqueta-estado">{emp.estado}</span>
                    </td>
                    <td className="acciones">
                      <button>✎</button>
                      <button>👁</button>
                      <button>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Empleados;