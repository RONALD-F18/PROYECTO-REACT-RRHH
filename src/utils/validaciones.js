// Expresiones regulares para validaciones
export const expresionesRegulares = {
  soloLetras: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  soloNumeros: /^\d+$/,
  nombreUsuario: /^[a-zA-Z0-9_]+$/,
  correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^\d{7,15}$/,
  mayuscula: /[A-Z]/,
  numero: /\d/,
};

/** Política front alineada al API (Laravel: min 8, max 64) + reglas con regex */
export const REGEX_CONTRASENA_USUARIO_API = {
  longitudMin: 8,
  longitudMax: 64,
  tieneMayuscula: /[A-ZÁÉÍÓÚÑ]/,
  tieneDigito: /\d/,
};

/**
 * Valida contraseña para crear/editar usuario (contrasena_usuario).
 * @param {string} valor
 * @param {{ permitirVacio?: boolean }} opciones — en edición, vacío = no cambiar clave
 * @returns {string|null} mensaje de error o null si es válida
 */
export function validarContrasenaUsuarioApi(valor, { permitirVacio = false } = {}) {
  const v = typeof valor === 'string' ? valor : '';
  if (!v.trim()) {
    return permitirVacio ? null : 'La contraseña es obligatoria';
  }
  if (v.length < REGEX_CONTRASENA_USUARIO_API.longitudMin) {
    return `Mínimo ${REGEX_CONTRASENA_USUARIO_API.longitudMin} caracteres`;
  }
  if (v.length > REGEX_CONTRASENA_USUARIO_API.longitudMax) {
    return `Máximo ${REGEX_CONTRASENA_USUARIO_API.longitudMax} caracteres`;
  }
  if (!REGEX_CONTRASENA_USUARIO_API.tieneMayuscula.test(v)) {
    return 'Debe incluir al menos una letra mayúscula (A-Z, Ñ, vocales con tilde mayúscula)';
  }
  if (!REGEX_CONTRASENA_USUARIO_API.tieneDigito.test(v)) {
    return 'Debe incluir al menos un número';
  }
  return null;
}

// Funciones de validación
export const validarNombres = (valor) => {
  if (!valor.trim()) return "El nombre es requerido";
  if (valor.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (!expresionesRegulares.soloLetras.test(valor)) return "Solo se permiten letras";
  return null;
};

export const validarApellidos = (valor) => {
  if (!valor.trim()) return "Los apellidos son requeridos";
  if (valor.trim().length < 2) return "Los apellidos deben tener al menos 2 caracteres";
  if (!expresionesRegulares.soloLetras.test(valor)) return "Solo se permiten letras";
  return null;
};

export const validarNombreUsuario = (valor) => {
  if (!valor.trim()) return "El nombre de usuario es requerido";
  if (valor.trim().length < 3) return "Debe tener al menos 3 caracteres";
  if (!expresionesRegulares.nombreUsuario.test(valor)) return "Solo letras, números y guión bajo";
  return null;
};

export const validarTipoDocumento = (valor) => {
  if (!valor) return "Debes seleccionar un tipo de documento";
  return null;
};

export const validarNumeroDocumento = (valor) => {
  if (!valor.trim()) return "El número de documento es requerido";
  if (!expresionesRegulares.soloNumeros.test(valor)) return "Solo se permiten números";
  if (valor.length < 5) return "Debe tener al menos 5 dígitos";
  return null;
};

export const validarCorreo = (valor) => {
  if (!valor.trim()) return "El correo es requerido";
  if (!expresionesRegulares.correo.test(valor)) return "Correo electrónico inválido";
  return null;
};

export const validarContrasena = (valor) => validarContrasenaUsuarioApi(valor, { permitirVacio: false });

export const validarConfirmarContrasena = (valor, contrasena) => {
  if (!valor) return "Debes confirmar la contraseña";
  if (valor !== contrasena) return "Las contraseñas no coinciden";
  return null;
};

export const validarTelefono = (valor) => {
  if (valor.trim() && !expresionesRegulares.telefono.test(valor)) {
    return "Teléfono inválido (7-15 dígitos)";
  }
  return null;
};

export const validarFechaNacimiento = (valor) => {
  if (!valor) return "La fecha de nacimiento es requerida";
  const fecha = new Date(valor);
  const hoy = new Date();
  if (fecha > hoy) return "La fecha no puede ser futura";
  return null;
};

export const validarTerminos = (valor) => {
  if (!valor) return "Debes aceptar los términos y condiciones";
  return null;
};



