import { Routes, Route, Navigate } from "react-router-dom";
import {
  Inicio,
  InicioSesion,
  RecuperarContrasena,
  Panel,
  Empleados,
  DetallesEmpleado,
  Usuarios,
  PrestacionesSociales,
  DetallesPrestaciones,
  Incapacidades,
  DetallesIncapacidad,
  Afiliaciones,
  DetallesAfiliacion,
} from "../modulos";
import { esAdminSesionLocal } from "../services/autenticacion";

// Rutas públicas
export const rutasPublicas = [
  { ruta: "/", componente: Inicio },
  { ruta: "/login", componente: InicioSesion },
  { ruta: "/recuperar-contrasena", componente: RecuperarContrasena },
];

// Rutas privadas (empleados y el resto salvo /usuarios: accesibles con sesión; /usuarios solo admin abajo)
export const rutasPrivadas = [
  { ruta: "/dashboard", componente: Panel },
  { ruta: "/empleados", componente: Empleados },
  { ruta: "/empleados/:id", componente: DetallesEmpleado },
  { ruta: "/usuarios", componente: Usuarios },
  { ruta: "/prestaciones", componente: PrestacionesSociales },
  { ruta: "/prestaciones/:id", componente: DetallesPrestaciones },
  { ruta: "/incapacidades", componente: Incapacidades },
  { ruta: "/incapacidades/:id", componente: DetallesIncapacidad },
  { ruta: "/incapacidades/:id/editar", componente: DetallesIncapacidad },
  { ruta: "/afiliaciones", componente: Afiliaciones },
  { ruta: "/afiliaciones/:id", componente: DetallesAfiliacion },
];

function EnrutadorPrincipal() {
  const esAdmin = esAdminSesionLocal();
  return (
    <Routes>
      {rutasPublicas.map(({ ruta, componente: Componente }) => (
        <Route key={ruta} path={ruta} element={<Componente />} />
      ))}
      {rutasPrivadas.map(({ ruta, componente: Componente }) => {
        if (ruta === "/usuarios" && !esAdmin) {
          return <Route key={ruta} path={ruta} element={<Navigate to="/dashboard" replace />} />;
        }
        return <Route key={ruta} path={ruta} element={<Componente />} />;
      })}
    </Routes>
  );
}

export default EnrutadorPrincipal;