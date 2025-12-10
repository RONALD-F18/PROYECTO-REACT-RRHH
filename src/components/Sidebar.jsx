import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { path: '/afiliaciones', label: 'Afiliaciones', icon: '▤' },
    { path: '/Empleados', label: 'Empleados', icon: '👥' },
    { path: '/certificacion', label: 'Certificación', icon: '🎓' },
    { path: '/contratos', label: 'Contratos', icon: '📄' },
    { path: '/memorandos', label: 'Memorandos', icon: '⚠' },
    { path: '/prestaciones', label: 'Prestaciones Sociales', icon: '⊕' },
    { path: '/inasistencias', label: 'Inasistencias', icon: '📅' },
    { path: '/incapacidades', label: 'Incapacidades', icon: '🏥' },
    { path: '/actividades', label: 'Actividades', icon: '📌' },
    { path: '/reportes', label: 'Reportes', icon: '📊' },
    { path: '/usuarios', label: 'Usuarios', icon: '👤' },
  ]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="url(#sideGrad)" />
                <ellipse cx="16" cy="16" rx="9" ry="3.5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8"/>
                <ellipse cx="16" cy="16" rx="9" ry="3.5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" transform="rotate(60 16 16)"/>
                <ellipse cx="16" cy="16" rx="9" ry="3.5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" transform="rotate(-60 16 16)"/>
                <circle cx="16" cy="16" r="2.5" fill="white"/>
                <defs>
                  <linearGradient id="sideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">Talent Sphere</span>
              <span className="brand-sub">Gestión de RRHH</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link to="#" className="menu-item help-item">
            <span className="menu-icon">?</span>
            <span className="menu-label">Ayuda</span>
          </Link>
          
          <div className="user-card">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-email">gatafuriosa@gmail.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar