import { Routes, Route } from "react-router-dom";
import {
  Inicio,
  InicioSesion,
  Registro,
  Panel,
  Empleados,
  DetallesEmpleado,
  Usuarios,
  PrestacionesSociales,
  DetallesPrestaciones,
  Incapacidades,
  DetallesIncapacidad,
} from "../modulos";

// Rutas públicas
export const rutasPublicas = [
  { ruta: "/", componente: Inicio },
  { ruta: "/login", componente: InicioSesion },
  { ruta: "/registro", componente: Registro },
];

// Rutas privadas
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
];

function EnrutadorPrincipal() {
  return (
    <Routes>
      {rutasPublicas.map(({ ruta, componente: Componente }) => (
        <Route key={ruta} path={ruta} element={<Componente />} />
      ))}
      {rutasPrivadas.map(({ ruta, componente: Componente }) => (
        <Route key={ruta} path={ruta} element={<Componente />} />
      ))}
    </Routes>
  );
}

export default EnrutadorPrincipal;