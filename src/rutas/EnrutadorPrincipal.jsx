import { Routes, Route } from "react-router-dom";
import {
  Inicio,
  InicioSesion,
  Registro,
  Panel,
  Empleados,
  Usuarios,
  PrestacionesSociales,
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
  { ruta: "/usuarios", componente: Usuarios },
  { ruta: "/prestaciones", componente: PrestacionesSociales },
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