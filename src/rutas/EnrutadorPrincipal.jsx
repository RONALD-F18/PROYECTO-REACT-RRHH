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
  Contratos,
  DetallesContrato,
  ComunicacionesDisciplinarias,
} from "../modulos";
import { esAdminSesionLocal, haySesionLocalActiva } from "../services/autenticacion";

/**
 * Bloquea rutas privadas sin sesión en localStorage (lectura síncrona: no hay flash del módulo
 * ni espera a un 401 del API).
 */
function RutaPrivada({ children }) {
  "use no memo";
  if (!haySesionLocalActiva()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * La comprobación debe ocurrir al renderizar la ruta (no al armar el árbol de <Route>),
 * para que siempre lea la sesión actual y no quede memoizada una rama Navigate → /dashboard
 * (p. ej. con React Compiler + localStorage).
 */
function RutaUsuariosProtegida() {
  "use no memo";
  if (!haySesionLocalActiva()) {
    return <Navigate to="/login" replace />;
  }
  if (!esAdminSesionLocal()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Usuarios />;
}

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
  { ruta: "/contratos", componente: Contratos },
  { ruta: "/contratos/:id", componente: DetallesContrato },
  { ruta: "/usuarios", componente: Usuarios },
  { ruta: "/prestaciones", componente: PrestacionesSociales },
  { ruta: "/prestaciones/:id", componente: DetallesPrestaciones },
  { ruta: "/incapacidades", componente: Incapacidades },
  { ruta: "/incapacidades/:id", componente: DetallesIncapacidad },
  { ruta: "/afiliaciones", componente: Afiliaciones },
  { ruta: "/afiliaciones/:id", componente: DetallesAfiliacion },
  { ruta: "/comunicaciones-disciplinarias", componente: ComunicacionesDisciplinarias },
];

function EnrutadorPrincipal() {
  return (
    <Routes>
      {rutasPublicas.map(({ ruta, componente: Componente }) => (
        <Route key={ruta} path={ruta} element={<Componente />} />
      ))}
      {rutasPrivadas.map(({ ruta, componente: Componente }) =>
        ruta === "/usuarios" ? (
          <Route key={ruta} path={ruta} element={<RutaUsuariosProtegida />} />
        ) : (
          <Route
            key={ruta}
            path={ruta}
            element={
              <RutaPrivada>
                <Componente />
              </RutaPrivada>
            }
          />
        ),
      )}
    </Routes>
  );
}

export default EnrutadorPrincipal;