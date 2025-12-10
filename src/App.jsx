import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/afiliaciones" element={<Dashboard />} />
        <Route path="/empleados" element={<Dashboard />} />
        <Route path="/certificacion" element={<Dashboard />} />
        <Route path="/contratos" element={<Dashboard />} />
        <Route path="/memorandos" element={<Dashboard />} />
        <Route path="/prestaciones" element={<Dashboard />} />
        <Route path="/inasistencias" element={<Dashboard />} />
        <Route path="/incapacidades" element={<Dashboard />} />
        <Route path="/actividades" element={<Dashboard />} />
        <Route path="/reportes" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App