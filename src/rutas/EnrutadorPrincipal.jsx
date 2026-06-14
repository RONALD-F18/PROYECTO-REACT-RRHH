import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
  Inicio,
  InicioSesion,
  RecuperarContrasena,
  CambiarContrasena,
  Panel,
  Empleados,
  DetallesEmpleado,
  Usuarios,
  PrestacionesSociales,
  DetallesPrestaciones,
  Incapacidades,
  Inasistencias,
  CalendarioActividades,
  DetallesIncapacidad,
  Afiliaciones,
  DetallesAfiliacion,
  Contratos,
  DetallesContrato,
  Certificaciones,
  DetalleCertificacion,
  ComunicacionesDisciplinarias,
  Reportes,
} from "../modulos";
import { esAdminSesionLocal, haySesionLocalActiva } from "../services/autenticacion";

/**
 * Bloquea rutas privadas sin sesión (evita flash del módulo antes de redirigir al login).
 */
function RutaPrivada({ children }) {
  "use no memo";
  const ubicacion = useLocation();
  if (!haySesionLocalActiva()) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  return children;
}

function RutaUsuariosProtegida() {
  "use no memo";
  const ubicacion = useLocation();
  if (!haySesionLocalActiva()) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  if (!esAdminSesionLocal()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Usuarios />;
}

/** Rutas públicas: si ya hay sesión, no quedarse en login/registro. */
function RutaPublica({ children }) {
  "use no memo";
  const { pathname } = useLocation();
  if (haySesionLocalActiva() && (pathname === "/login" || pathname === "/")) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/**
 * Cualquier ruta desconocida: sin sesión → login; con sesión → dashboard (evita pantalla en blanco / 404).
 */
function RutaComodin() {
  "use no memo";
  const ubicacion = useLocation();
  if (!haySesionLocalActiva()) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  return <Navigate to="/dashboard" replace />;
}

export const rutasPublicas = [
  { ruta: "/", componente: Inicio },
  { ruta: "/login", componente: InicioSesion },
  { ruta: "/recuperar-contrasena", componente: RecuperarContrasena },
  { ruta: "/cambiar-contrasena", componente: CambiarContrasena },
];

export const rutasPrivadas = [
  { ruta: "/dashboard", componente: Panel },
  { ruta: "/empleados", componente: Empleados },
  { ruta: "/empleados/:id", componente: DetallesEmpleado },
  { ruta: "/contratos", componente: Contratos },
  { ruta: "/contratos/:id", componente: DetallesContrato },
  { ruta: "/certificaciones", componente: Certificaciones },
  { ruta: "/certificaciones/:id", componente: DetalleCertificacion },
  { ruta: "/usuarios", componente: Usuarios },
  { ruta: "/prestaciones", componente: PrestacionesSociales },
  { ruta: "/prestaciones/:id", componente: DetallesPrestaciones },
  { ruta: "/incapacidades", componente: Incapacidades },
  { ruta: "/inasistencias", componente: Inasistencias },
  { ruta: "/actividades", componente: CalendarioActividades },
  { ruta: "/incapacidades/:id", componente: DetallesIncapacidad },
  { ruta: "/afiliaciones", componente: Afiliaciones },
  { ruta: "/afiliaciones/:id", componente: DetallesAfiliacion },
  { ruta: "/comunicaciones-disciplinarias", componente: ComunicacionesDisciplinarias },
  { ruta: "/reportes", componente: Reportes },
];

function EnrutadorPrincipal() {
  return (
    <Routes>
      {rutasPublicas.map(({ ruta, componente: Componente }) => (
        <Route
          key={ruta}
          path={ruta}
          element={
            <RutaPublica>
              <Componente />
            </RutaPublica>
          }
        />
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
      <Route
        path="/calendario"
        element={
          <RutaPrivada>
            <Navigate to="/actividades" replace />
          </RutaPrivada>
        }
      />
      <Route path="*" element={<RutaComodin />} />
    </Routes>
  );
}

export default EnrutadorPrincipal;
