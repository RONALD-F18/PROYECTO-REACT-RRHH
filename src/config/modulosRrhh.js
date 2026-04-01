/**
 * Módulos alineados con la API / capa de servicios (ServiceRepositoryProvider).
 * `soloAdmin`: solo visible para administrador en la app autenticada.
 */

export const USUARIO_MOCK = {
  nombre: "Administrador",
  correo: "admin@talentsphere.com",
  rol: "administrador",
  esAdmin: true,
};

export const VERSION_APP = "0.1.0";

export const MODULOS_NAVEGACION = [
  {
    ruta: "/dashboard",
    etiqueta: "Inicio",
    descripcion: "Bienvenida y accesos al sistema",
  },
  {
    ruta: "/empleados",
    etiqueta: "Empleados",
    descripcion: "Empleado y banco de datos",
  },
  {
    ruta: "/contratos",
    etiqueta: "Contratos",
    descripcion: "Contrato y cargo",
  },
  {
    ruta: "/afiliaciones",
    etiqueta: "Afiliaciones",
    descripcion: "EPS, ARL, pensiones, cesantías, riesgo",
  },
  {
    ruta: "/inasistencias",
    etiqueta: "Inasistencias",
    descripcion: "Control de inasistencias",
  },
  {
    ruta: "/prestaciones",
    etiqueta: "Prestaciones sociales",
    descripcion: "Prestaciones y beneficios",
  },
  {
    ruta: "/incapacidades",
    etiqueta: "Incapacidades",
    descripcion: "Tipos, clasificación e incapacidades",
  },
  {
    ruta: "/actividades",
    etiqueta: "Calendario",
    descripcion: "Actividades y eventos",
  },
  {
    ruta: "/empresa",
    etiqueta: "Empresa",
    descripcion: "Datos de la organización",
  },
  {
    ruta: "/certificaciones",
    etiqueta: "Certificaciones",
    descripcion: "Certificados laborales",
  },
  {
    ruta: "/comunicaciones-disciplinarias",
    etiqueta: "Comunicaciones Disciplinarias",
    descripcion: "Memorandos, suspensiones y reconocimientos",
  },
  {
    ruta: "/reportes",
    etiqueta: "Reportes",
    descripcion: "Reportes del sistema",
  },
  {
    ruta: "/usuarios",
    etiqueta: "Usuarios y roles",
    descripcion: "Solo administrador",
    soloAdmin: true,
  },
];

/** Tarjetas de la landing pública (misma cobertura de dominio + métrica orientativa). */
export const SERVICIOS_LANDING = [
  {
    titulo: "Autenticación y usuarios",
    descripcion: "Inicio de sesión, perfil y, para administradores, gestión de usuarios y roles.",
    metrica: "Sesión · perfil · RBAC",
    destacado: false,
  },
  {
    titulo: "Empleados",
    descripcion: "Administra perfiles completos y expedientes digitales de todo tu personal en un solo lugar.",
    metrica: "Expediente + banco",
    destacado: false,
  },
  {
    titulo: "Contratos y cargos",
    descripcion: "Vinculación laboral, cargos asociados y seguimiento de contratos vigentes.",
    metrica: "Contrato · cargo",
    destacado: false,
  },
  {
    titulo: "Afiliaciones",
    descripcion:
      "EPS, ARL, pensiones, cesantías, compensación, riesgo y afiliación con trazabilidad por empleado.",
    metrica: "7 frentes de afiliación",
    destacado: true,
  },
  {
    titulo: "Inasistencias",
    descripcion: "Registro y consulta de faltas y ausencias para apoyo al control de asistencia.",
    metrica: "Por periodo",
    destacado: false,
  },
  {
    titulo: "Prestaciones sociales",
    descripcion:
      "Calcula y gestiona prestaciones sociales, cesantías, primas e intereses automáticamente.",
    metrica: "Liquidaciones y periodos",
    destacado: false,
  },
  {
    titulo: "Incapacidades",
    descripcion: "Tipos, clasificación e historial de incapacidades ligado al empleado.",
    metrica: "Tipos · clasificación",
    destacado: false,
  },
  {
    titulo: "Calendario de actividades",
    descripcion: "Actividades y eventos de RRHH en una sola línea de tiempo.",
    metrica: "Eventos programados",
    destacado: false,
  },
  {
    titulo: "Empresa",
    descripcion: "Datos maestros de la organización que alimentan el resto de módulos.",
    metrica: "Ficha empresa",
    destacado: false,
  },
  {
    titulo: "Certificaciones",
    descripcion: "Emisión y control de certificaciones laborales.",
    metrica: "Plantillas y registros",
    destacado: false,
  },
  {
    titulo: "Comunicaciones Disciplinarias",
    descripcion: "Comunicaciones y actuaciones disciplinarias documentadas.",
    metrica: "Historial disciplinario",
    destacado: false,
  },
  {
    titulo: "Reportes",
    descripcion: "Salidas e informes consolidados para auditoría y dirección.",
    metrica: "Exportación / vistas",
    destacado: false,
  },
];

export function modulosVisiblesParaUsuario(esAdmin) {
  return MODULOS_NAVEGACION.filter((m) => !m.soloAdmin || esAdmin);
}
