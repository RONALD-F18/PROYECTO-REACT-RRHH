import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import './Users.css'

function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterRole, setFilterRole] = useState('todos')
  const [selectedUser, setSelectedUser] = useState(null)
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Carlos Andrés Gomez', doc: '1015432198', phone: '+57 3105551234', role: 'Administrador', status: 'Activo', lastAccess: 'Hoy 10:30 AM', email: 'carlosgomez@empresa.com' },
    { id: 2, name: 'María Fernanda López', doc: '1020567834', phone: '+57 3205557890', role: 'Funcionario', status: 'Activo', lastAccess: 'Hoy 09:15 AM', email: 'mariaf@empresa.com' },
    { id: 3, name: 'Juan Pablo Martínez', doc: '1025678901', phone: '+57 3155559876', role: 'Funcionario', status: 'Activo', lastAccess: 'Ayer 04:45 PM', email: 'juanp@empresa.com' },
    { id: 4, name: 'Andrea Carolina Silva', doc: '1033705584', phone: '+57 3185554321', role: 'Funcionario', status: 'Inactivo', lastAccess: '15/11/2025', email: 'andreas@empresa.com' },
  ])

  const stats = {
    total: users.length,
    activos: users.filter(u => u.status === 'Activo').length,
    inactivos: users.filter(u => u.status === 'Inactivo').length,
    admins: users.filter(u => u.role === 'Administrador').length
  }

  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.doc.includes(searchTerm)
    const matchStatus = filterStatus === 'todos' || user.status.toLowerCase() === filterStatus
    const matchRole = filterRole === 'todos' || user.role.toLowerCase() === filterRole
    return matchSearch && matchStatus && matchRole
  })

  const openEditModal = (user) => {
    setSelectedUser({ ...user })
    setShowModal(true)
  }

  const openNewModal = () => {
    setSelectedUser({ 
      id: Date.now(), 
      name: '', 
      doc: '', 
      phone: '', 
      role: 'Funcionario', 
      status: 'Activo', 
      lastAccess: 'Nuevo', 
      email: '' 
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (users.find(u => u.id === selectedUser.id)) {
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u))
    } else {
      setUsers([...users, selectedUser])
    }
    setShowModal(false)
    setSelectedUser(null)
  }

  const handleDelete = (id) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="main-content">
        <header className="users-header">
          <button className="hamburger light" onClick={() => setSidebarOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="header-info">
            <h1>Gestión de Usuarios</h1>
            <p>Administración de Acceso y Permisos del sistema</p>
          </div>
          <button className="btn-new" onClick={openNewModal}>
            <span className="btn-icon">👤</span>
            Nuevo Usuario
          </button>
        </header>

        <div className="users-body">
          <div className="stats-boxes">
            <div className="stats-box">
              <span className="box-label">Total Usuarios</span>
              <span className="box-value">{stats.total}</span>
            </div>
            <div className="stats-box">
              <span className="box-label">Usuarios Activos</span>
              <span className="box-value">{stats.activos}</span>
            </div>
            <div className="stats-box">
              <span className="box-label">Usuarios Inactivos</span>
              <span className="box-value">{stats.inactivos}</span>
            </div>
            <div className="stats-box">
              <span className="box-label">Administradores</span>
              <span className="box-value">{stats.admins}</span>
            </div>
          </div>

          <div className="filters-box">
            <div className="search-row">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre, email o documento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters-row">
              <button 
                className={`filter-btn ${filterStatus === 'todos' ? '' : 'active'}`}
                onClick={() => setFilterStatus('todos')}
              >
                Todos los estados
              </button>
              <button 
                className={`filter-btn ${filterRole === 'todos' ? '' : 'active'}`}
                onClick={() => setFilterRole('todos')}
              >
                Todos los roles
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="users-table">
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
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <span className="cell-name">{user.name}</span>
                        <span className="cell-doc">C.C {user.doc}</span>
                      </div>
                    </td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`role-tag ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastAccess}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-edit" onClick={() => openEditModal(user)}>✎</button>
                        <button className="action-delete" onClick={() => handleDelete(user.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && selectedUser && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-brand">
                <svg width="28" height="28" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="url(#modalGrad)" />
                  <circle cx="16" cy="16" r="2.5" fill="white"/>
                  <defs>
                    <linearGradient id="modalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2>Editar Usuarios</h2>
              <button className="modal-x" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div className="modal-content">
              <h3>👤 Información Personal</h3>
              
              <div className="modal-fields">
                <div className="modal-field">
                  <label>Nombre Completo *</label>
                  <input 
                    type="text" 
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  />
                </div>
                <div className="modal-field">
                  <label>Documento *</label>
                  <input 
                    type="text" 
                    value={selectedUser.doc}
                    onChange={(e) => setSelectedUser({...selectedUser, doc: e.target.value})}
                  />
                </div>
                <div className="modal-field">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  />
                </div>
                <div className="modal-field">
                  <label>Telefono *</label>
                  <input 
                    type="text" 
                    value={selectedUser.phone}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                  />
                </div>
              </div>

              <h3>Permisos y Acceso</h3>
              
              <div className="role-list">
                <label className={`role-item ${selectedUser.role === 'Administrador' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    checked={selectedUser.role === 'Administrador'}
                    onChange={() => setSelectedUser({...selectedUser, role: 'Administrador'})}
                  />
                  <div className="role-info">
                    <span className="role-name">Administrador</span>
                    <span className="role-desc">Acceso total al sistema</span>
                  </div>
                </label>
                <label className={`role-item ${selectedUser.role === 'Funcionario' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    checked={selectedUser.role === 'Funcionario'}
                    onChange={() => setSelectedUser({...selectedUser, role: 'Funcionario'})}
                  />
                  <div className="role-info">
                    <span className="role-name">Funcionario</span>
                    <span className="role-desc">Acceso limitado según permisos</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn-guardar" onClick={handleSave}>Guardar Cambios</button>
              <button className="btn-cancelar" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users