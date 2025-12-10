import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './Dashboard.css'

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="main-content">
        <header className="page-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="header-info">
            <h1>Dashboard</h1>
            <p>Bienvenido a Talent Sphere</p>
          </div>
          <span className="header-date">Domingo , 07 Dic 2025</span>
        </header>

        <div className="dashboard-body">
          <div className="stats-column">
            <div className="stat-card">
              <div className="stat-icon yellow">
                <span>👤</span>
              </div>
              <div className="stat-data">
                <span className="stat-number">247</span>
                <span className="stat-text">Empleados Activos</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon pink">
                <span>📋</span>
              </div>
              <div className="stat-data">
                <span className="stat-number">234</span>
                <span className="stat-text">Contratos Vigentes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <span>📅</span>
              </div>
              <div className="stat-data">
                <span className="stat-number">18</span>
                <span className="stat-text">Inasistencias (Mes)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <span>🏥</span>
              </div>
              <div className="stat-data">
                <span className="stat-number">21</span>
                <span className="stat-text">Incapacidades</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <span>▤</span>
              </div>
              <div className="stat-data">
                <span className="stat-number">247</span>
                <span className="stat-text">Afiliaciones</span>
              </div>
            </div>
          </div>

          <div className="activities-section">
            <div className="card">
              <div className="card-top">
                <h3>Actividades Recientes</h3>
                <a href="#" className="link-blue">Ver Todas</a>
              </div>
              <div className="activities-list">
                <div className="activity-row">
                  <div className="activity-content">
                    <span className="activity-text">Ricardo Pérez registrado</span>
                    <span className="badge badge-green">Empleado</span>
                  </div>
                  <span className="activity-time">Hace 2 Horas</span>
                </div>
                <div className="activity-row">
                  <div className="activity-content">
                    <span className="activity-text">Contrato Aprobado - Ana García</span>
                    <span className="badge badge-red">Contrato</span>
                  </div>
                  <span className="activity-time">Hace 2 Horas</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <h3>Actividades Recientes</h3>
                <span className="tasks-badge">4 Tareas</span>
              </div>
              <div className="tasks-list">
                <div className="task-row">
                  <input type="checkbox" />
                  <div className="task-content">
                    <span className="task-text">Revisión de Contratos</span>
                    <div className="task-meta">
                      <span className="task-date">08 Dic</span>
                      <span className="priority priority-alta">Alta</span>
                    </div>
                  </div>
                </div>
                <div className="task-row">
                  <input type="checkbox" />
                  <div className="task-content">
                    <span className="task-text">Registrar Afiliación al Nuevo Empleado</span>
                    <div className="task-meta">
                      <span className="task-date">12 Dic</span>
                      <span className="priority priority-media">Media</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Acciones Rapidas</h3>
              <div className="actions-grid">
                <Link to="/empleados" className="action-btn btn-yellow">Nuevo Empleado</Link>
                <Link to="/contratos" className="action-btn btn-pink">Crear Contrato</Link>
                <Link to="/prestaciones" className="action-btn btn-orange">Registrar Prestación</Link>
                <Link to="/afiliaciones" className="action-btn btn-green">Registrar Afiliación</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard