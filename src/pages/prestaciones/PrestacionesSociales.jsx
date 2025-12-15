import Sidebar from "../../components/Sidebar";
import "./PrestacionesSociales.css";

function PrestacionesSociales() {
  const empleados = [
    {
      id: 1,
      nombre: "Carlos Andrés Gomez",
      documento: "1015432198",
      contrato: "N°52265",
      periodo: "Desde Enero 2024",
      cargo: "Desarrollador",
      fechaInicio: "03-09-2006",
    },
    {
      id: 2,
      nombre: "María Fernanda López",
      documento: "1020567834",
      contrato: "N°52265",
      periodo: "Desde Enero 2024",
      cargo: "Aux Contable",
      fechaInicio: "03-09-2006",
    },
    {
      id: 3,
      nombre: "Juan Pablo Martínez",
      documento: "1025678901",
      contrato: "N°52265",
      periodo: "Desde Enero 2024",
      cargo: "RRHH",
      fechaInicio: "03-09-2006",
    },
    {
      id: 4,
      nombre: "Andrea Carolina Silva",
      documento: "1033705584",
      contrato: "N°52265",
      periodo: "Desde Enero 2024",
      cargo: "Diseñador",
      fechaInicio: "03-09-2006",
    },
  ];

  return (
    <div className="contenedor-aplicacion">
      <Sidebar />

      <main className="zona-principal">
        <header className="encabezado-prestaciones">
          <div className="info-header">
            <div className="icono-header"></div>
            <div>
              <h1>Prestaciones Sociales</h1>
              <p>Gestión, cálculo y pagos de beneficios laborales</p>
            </div>
          </div>
        </header>

        <div className="cuerpo-prestaciones">
          <h2>Gestión de Prestaciones Sociales</h2>

          <div className="tarjetas-prestaciones">
            <div className="tarjeta-prestacion verde">
              <div className="info-tarjeta">
                <h3>Prima de Servicios</h3>
                <p className="valor">$14,500,000</p>
              </div>
              <div className="icono-tarjeta"></div>
            </div>

            <div className="tarjeta-prestacion azul">
              <div className="info-tarjeta">
                <h3>Cesantías</h3>
                <p className="valor">$7,500,000</p>
              </div>
              <div className="icono-tarjeta"></div>
            </div>

            <div className="tarjeta-prestacion morado">
              <div className="info-tarjeta">
                <h3>Interes Cesantías</h3>
                <p className="valor">$4,500,000</p>
              </div>
              <div className="icono-tarjeta"></div>
            </div>

            <div className="tarjeta-prestacion naranja">
              <div className="info-tarjeta">
                <h3>Vacaciones</h3>
                <p className="valor">$4,500,000</p>
              </div>
              <div className="icono-tarjeta"></div>
            </div>
          </div>

          <div className="tabla-empleados-prestaciones">
            <table>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Contrato</th>
                  <th>Cargo</th>
                  <th>Fecha Inicio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="info-empleado">
                        <span className="nombre-empleado">{emp.nombre}</span>
                        <span className="doc-empleado">
                          C.C {emp.documento}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="info-contrato">
                        <span className="num-contrato">{emp.contrato}</span>
                        <span className="periodo-contrato">{emp.periodo}</span>
                      </div>
                    </td>
                    <td>{emp.cargo}</td>
                    <td>{emp.fechaInicio}</td>
                    <td>
                      <button className="btn-detalles">Ver detalles</button>
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

export default PrestacionesSociales;
