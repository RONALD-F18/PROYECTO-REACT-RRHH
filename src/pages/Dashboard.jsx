import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="contenedor-aplicacion">
      <Sidebar />
      
      <main className="zona-principal">
        <header className="encabezado-pagina">
          <div className="texto-encabezado">
            <h1>Panel General</h1>
            <p>Resumen rápido de la operación</p>
          </div>
          <span className="fecha-encabezado">Domingo , 07 Dic 2025</span>
        </header>

        <div className="cuerpo-dashboard">
          <div className="columna-resumen">
            <div className="tarjeta-dato">
              <div className="icono-dato amarillo">
                <span />
              </div>
              <div className="contenido-dato">
                <span className="numero-dato">247</span>
                <span className="texto-dato">Empleados activos</span>
              </div>
            </div>

            <div className="tarjeta-dato">
              <div className="icono-dato rosa">
                <span />
              </div>
              <div className="contenido-dato">
                <span className="numero-dato">234</span>
                <span className="texto-dato">Contratos vigentes</span>
              </div>
            </div>

            <div className="tarjeta-dato">
              <div className="icono-dato naranja">
                <span />
              </div>
              <div className="contenido-dato">
                <span className="numero-dato">18</span>
                <span className="texto-dato">Inasistencias del mes</span>
              </div>
            </div>

            <div className="tarjeta-dato">
              <div className="icono-dato azul">
                <span />
              </div>
              <div className="contenido-dato">
                <span className="numero-dato">21</span>
                <span className="texto-dato">Incapacidades</span>
              </div>
            </div>

            <div className="tarjeta-dato">
              <div className="icono-dato verde">
                <span />
              </div>
              <div className="contenido-dato">
                <span className="numero-dato">247</span>
                <span className="texto-dato">Afiliaciones</span>
              </div>
            </div>
          </div>

          <div className="seccion-actividades">
            <div className="tarjeta">
              <div className="tarjeta-superior">
                <h3>Actividades recientes</h3>
                <a href="#" className="enlace-azul">Ver todas</a>
              </div>
              <div className="lista-actividades">
                <div className="fila-actividad">
                  <div className="detalle-actividad">
                    <span className="texto-actividad">Ricardo Pérez registrado</span>
                    <span className="etiqueta etiqueta-verde">Empleado</span>
                  </div>
                  <span className="tiempo-actividad">Hace 2 horas</span>
                </div>
                <div className="fila-actividad">
                  <div className="detalle-actividad">
                    <span className="texto-actividad">Contrato aprobado - Ana García</span>
                    <span className="etiqueta etiqueta-roja">Contrato</span>
                  </div>
                  <span className="tiempo-actividad">Hace 2 horas</span>
                </div>
              </div>
            </div>

            <div className="tarjeta">
              <div className="tarjeta-superior">
                <h3>Tareas pendientes</h3>
                <span className="contador-tareas">4 Tareas</span>
              </div>
              <div className="lista-tareas">
                <div className="fila-tarea">
                  <div className="contenido-tarea">
                    <span className="texto-tarea">Revisión de contratos</span>
                    <div className="meta-tarea">
                      <span className="fecha-tarea">08 Dic</span>
                      <span className="prioridad prioridad-alta">Alta</span>
                    </div>
                  </div>
                </div>
                <div className="fila-tarea">
                  <div className="contenido-tarea">
                    <span className="texto-tarea">Registrar afiliación al nuevo empleado</span>
                    <div className="meta-tarea">
                      <span className="fecha-tarea">12 Dic</span>
                      <span className="prioridad prioridad-media">Media</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="acciones-rapidas">
              <h3>Accesos rápidos</h3>
              <div className="rejilla-acciones">
                <Link to="/empleados" className="boton-accion btn-amarillo">Nuevo empleado</Link>
                <Link to="/contratos" className="boton-accion btn-rosa">Crear contrato</Link>
                <Link to="/prestaciones" className="boton-accion btn-naranja">Registrar prestación</Link>
                <Link to="/afiliaciones" className="boton-accion btn-verde">Registrar afiliación</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard