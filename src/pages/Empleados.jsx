import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ModuleHeader from '../components/ModuleHeader'
import DataTable from '../components/DataTable'
import FormField from '../components/FormField'
import { InfoCard, InfoRow } from '../components/InfoCard'
import './Empleados.css'

function Empleados() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCargo, setFilterCargo] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [selectedEmpleado, setSelectedEmpleado] = useState(null)
  
  const [formData, setFormData] = useState({
    documento: '',
    tipoCuenta: '',
    numeroCuenta: '',
    banco: '',
    direccion: '',
    discapacidad: '',
    nacionalidad: '',
    rh: '',
    estadoCivil: '',
    grupoSanguineo: '',
    profesion: '',
    fechaExpedicion: '',
    descripcion: ''
  })

  const [empleados, setEmpleados] = useState([
    { 
      id: 1, 
      documento: '1129244160', 
      nombre: 'Ronaldo Stiven Franco Duran', 
      cargo: 'Programador', 
      estado: 'Activo',
      tipoCuenta: 'Ahorros',
      numeroCuenta: '123546879',
      banco: 'Bancolombia',
      codigoBanco: '007',
      direccion: 'Calle 123 #45-67 Bogotá',
      discapacidad: 'Ninguna',
      nacionalidad: 'Colombiana',
      rh: '+',
      estadoCivil: 'Soltero',
      grupoSanguineo: 'O',
      profesion: 'Ingeniero de Software',
      fechaExpedicion: '15/03/2020',
      descripcion: 'Desarrollador full-stack con experiencia en React y Node.js. Apasionado por crear soluciones innovadoras y eficientes.'
    }
  ])

  const columns = [
    { header: 'Documento', field: 'documento' },
    { header: 'Nombre', field: 'nombre' },
    { header: 'Cargo', field: 'cargo' },
    { 
      header: 'Estado', 
      field: 'estado',
      render: (value) => (
        <span className={`status-badge ${value.toLowerCase()}`}>{value}</span>
      )
    }
  ]

  const cargos = ['Programador', 'Analista', 'Gerente', 'Asistente', 'Contador']
  const tiposCuenta = ['Ahorros', 'Corriente']
  const estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre']
  const gruposSanguineos = ['A', 'B', 'AB', 'O']
  const rhOptions = ['+', '-']

  const filteredEmpleados = empleados.filter(emp => {
    const matchSearch = emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       emp.documento.includes(searchTerm) ||
                       emp.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCargo = !filterCargo || emp.cargo === filterCargo
    const matchEstado = !filterEstado || emp.estado === filterEstado
    return matchSearch && matchCargo && matchEstado
  })

  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNew = () => {
    setSelectedEmpleado(null)
    setFormData({
      documento: '',
      tipoCuenta: '',
      numeroCuenta: '',
      banco: '',
      direccion: '',
      discapacidad: '',
      nacionalidad: '',
      rh: '',
      estadoCivil: '',
      grupoSanguineo: '',
      profesion: '',
      fechaExpedicion: '',
      descripcion: ''
    })
    setCurrentView('form')
  }

  const handleEdit = (emp) => {
    setSelectedEmpleado(emp)
    setFormData({
      documento: emp.documento,
      tipoCuenta: emp.tipoCuenta || '',
      numeroCuenta: emp.numeroCuenta || '',
      banco: emp.banco || '',
      direccion: emp.direccion || '',
      discapacidad: emp.discapacidad || '',
      nacionalidad: emp.nacionalidad || '',
      rh: emp.rh || '',
      estadoCivil: emp.estadoCivil || '',
      grupoSanguineo: emp.grupoSanguineo || '',
      profesion: emp.profesion || '',
      fechaExpedicion: emp.fechaExpedicion || '',
      descripcion: emp.descripcion || ''
    })
    setCurrentView('form')
  }

  const handleView = (emp) => {
    setSelectedEmpleado(emp)
    setCurrentView('detail')
  }

  const handleDelete = (emp) => {
    if (confirm('¿Está seguro de eliminar este empleado?')) {
      setEmpleados(empleados.filter(e => e.id !== emp.id))
    }
  }

  const handleSave = () => {
    if (selectedEmpleado) {
      setEmpleados(empleados.map(e => 
        e.id === selectedEmpleado.id ? { ...e, ...formData } : e
      ))
    } else {
      const newEmp = {
        id: Date.now(),
        ...formData,
        nombre: 'Nuevo Empleado',
        cargo: formData.profesion || 'Sin cargo',
        estado: 'Activo'
      }
      setEmpleados([...empleados, newEmp])
    }
    setCurrentView('list')
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedEmpleado(null)
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="main-content">
        {currentView === 'list' && (
          <>
            <ModuleHeader 
              title="Módulo de Empleados"
              subtitle="Sistema de Gestión de Recursos Humanos"
              buttonText="Nuevo Empleado"
              onButtonClick={handleNew}
            />
            
            <div className="module-body">
              <div className="filters-card">
                <h3>Empleados Registrados</h3>
                <div className="filters-row">
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input 
                      type="text"
                      placeholder="Buscar por documento, nombre o cargo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    value={filterCargo} 
                    onChange={(e) => setFilterCargo(e.target.value)}
                  >
                    <option value="">Todos los Cargos</option>
                    {cargos.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select 
                    value={filterEstado} 
                    onChange={(e) => setFilterEstado(e.target.value)}
                  >
                    <option value="">Todos los Estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <DataTable 
                columns={columns}
                data={filteredEmpleados}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                colorTheme="blue"
              />
            </div>
          </>
        )}

        {currentView === 'form' && (
          <>
            <ModuleHeader 
              title="Módulo de Empleados"
              subtitle="Sistema de Gestión de Recursos Humanos"
              buttonText="Nuevo Empleado"
              onButtonClick={handleNew}
            />
            
            <div className="module-body">
              <div className="form-card">
                <div className="form-header">
                  <h2>Registrar Nuevo Empleado</h2>
                  <button className="close-form" onClick={handleCancel}>✕</button>
                </div>
                
                <div className="form-grid">
                  <FormField 
                    label="Número de Documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleFormChange}
                    placeholder="Ingrese el documento"
                    required
                  />
                  <FormField 
                    label="Tipo de Cuenta"
                    type="select"
                    name="tipoCuenta"
                    value={formData.tipoCuenta}
                    onChange={handleFormChange}
                    options={tiposCuenta}
                    required
                  />
                  <FormField 
                    label="Número de Cuenta"
                    name="numeroCuenta"
                    value={formData.numeroCuenta}
                    onChange={handleFormChange}
                    placeholder="Número de cuenta bancaria"
                    required
                  />
                  <FormField 
                    label="Banco"
                    name="banco"
                    value={formData.banco}
                    onChange={handleFormChange}
                    placeholder="Código del banco"
                    required
                  />
                  <FormField 
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleFormChange}
                    placeholder="Dirección de residencia"
                    required
                  />
                  <FormField 
                    label="Discapacidad"
                    name="discapacidad"
                    value={formData.discapacidad}
                    onChange={handleFormChange}
                    placeholder="Ninguna"
                    required
                  />
                  <FormField 
                    label="Nacionalidad"
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleFormChange}
                    placeholder="País de nacionalidad"
                    required
                  />
                  <FormField 
                    label="RH"
                    type="select"
                    name="rh"
                    value={formData.rh}
                    onChange={handleFormChange}
                    options={rhOptions}
                    required
                  />
                  <FormField 
                    label="Estado Civil"
                    type="select"
                    name="estadoCivil"
                    value={formData.estadoCivil}
                    onChange={handleFormChange}
                    options={estadosCiviles}
                    required
                  />
                  <FormField 
                    label="Grupo Sanguíneo"
                    type="select"
                    name="grupoSanguineo"
                    value={formData.grupoSanguineo}
                    onChange={handleFormChange}
                    options={gruposSanguineos}
                    required
                  />
                  <FormField 
                    label="Profesión"
                    name="profesion"
                    value={formData.profesion}
                    onChange={handleFormChange}
                    placeholder="Profesión u oficio"
                    required
                  />
                  <FormField 
                    label="Fecha de Expedición del Doc"
                    name="fechaExpedicion"
                    value={formData.fechaExpedicion}
                    onChange={handleFormChange}
                    placeholder="dd/mm/aaaa"
                    required
                  />
                </div>
                
                <div className="form-full">
                  <FormField 
                    label="Descripción"
                    type="textarea"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                    placeholder="Información adicional del empleado"
                  />
                </div>

                <div className="form-buttons">
                  <button className="btn-save" onClick={handleSave}>
                    💾 Guardar Empleado
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'detail' && selectedEmpleado && (
          <>
            <header className="detail-header">
              <div className="detail-header-left">
                <div className="module-logo">
                  <svg width="32" height="32" viewBox="0 0 38 38">
                    <circle cx="19" cy="19" r="17" fill="url(#detGrad)" />
                    <circle cx="19" cy="19" r="3" fill="#fbbf24"/>
                    <defs>
                      <linearGradient id="detGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span>Empleados</span>
              </div>
            </header>

            <div className="detail-body">
              <div className="detail-nav">
                <button className="back-btn" onClick={handleCancel}>
                  ← Volver
                </button>
                <div className="detail-actions">
                  <button className="action-btn edit" onClick={() => handleEdit(selectedEmpleado)}>✎</button>
                  <button className="action-btn delete" onClick={() => handleDelete(selectedEmpleado)}>🗑</button>
                </div>
              </div>

              <div className="employee-banner">
                <div className="employee-avatar">
                  {getInitials(selectedEmpleado.nombre)}
                </div>
                <div className="employee-main-info">
                  <h2>{selectedEmpleado.nombre.split(' ').slice(0, 2).join(' ')}</h2>
                  <p>{selectedEmpleado.profesion || selectedEmpleado.cargo}</p>
                </div>
                <span className={`status-tag ${selectedEmpleado.estado.toLowerCase()}`}>
                  {selectedEmpleado.estado}
                </span>
              </div>

              <InfoCard title="Información Personal">
                <InfoRow label="Tipo de Documento" value="Cédula de Ciudadanía" colorTheme="yellow" />
                <InfoRow label="Número de Documento" value={selectedEmpleado.documento} colorTheme="yellow" />
                <InfoRow label="Fecha de Expedición" value={selectedEmpleado.fechaExpedicion} colorTheme="yellow" />
                <InfoRow label="Nacionalidad" value={selectedEmpleado.nacionalidad} colorTheme="yellow" />
                <InfoRow label="Estado Civil" value={selectedEmpleado.estadoCivil} colorTheme="yellow" />
              </InfoCard>

              <InfoCard title="Información Bancaria">
                <InfoRow label="Banco" value={selectedEmpleado.banco} colorTheme="green" />
                <InfoRow label="Código del Banco" value={selectedEmpleado.codigoBanco || '007'} colorTheme="green" />
                <InfoRow label="Número de Cuenta" value={selectedEmpleado.numeroCuenta} colorTheme="green" />
              </InfoCard>

              <InfoCard title="Información de Salud">
                <InfoRow label="Grupo Sanguíneo" value={selectedEmpleado.grupoSanguineo} colorTheme="pink" />
                <InfoRow label="RH" value={selectedEmpleado.rh} colorTheme="pink" />
                <InfoRow label="Discapacidad" value={selectedEmpleado.discapacidad} colorTheme="pink" />
              </InfoCard>

              <InfoCard title="Información Adicional">
                <InfoRow label="Profesión" value={selectedEmpleado.profesion} colorTheme="blue" />
                <InfoRow label="Dirección" value={selectedEmpleado.direccion} colorTheme="blue" />
              </InfoCard>

              <InfoCard title="Descripción">
                <div className="description-box">
                  <p>{selectedEmpleado.descripcion}</p>
                </div>
              </InfoCard>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Empleados