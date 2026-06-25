// Expresiones regulares para validaciones
export const expresionesRegulares = {
  soloLetras: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  soloNumeros: /^\d+$/,
  nombreUsuario: /^[a-zA-Z0-9_]+$/,
  correo: /^(?!.*\.\.)[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i,
  telefono: /^\d{7,15}$/,
  mayuscula: /[A-Z]/,
  numero: /\d/,
};

/** Política front alineada al API (Laravel: min 8, max 64) + reglas con regex */
export const REGEX_CONTRASENA_USUARIO_API = {
  longitudMin: 8,
  longitudMax: 64,
  tieneMayuscula: /[A-ZÁÉÍÓÚÑ]/,
  tieneMinuscula: /[a-záéíóúñ]/,
  tieneDigito: /\d/,
  tieneEspecial: /[^A-Za-z0-9áéíóúÁÉÍÓÚñÑ]/,
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
    return 'Debe incluir al menos una letra mayúscula';
  }
  if (!REGEX_CONTRASENA_USUARIO_API.tieneMinuscula.test(v)) {
    return 'Debe incluir al menos una letra minúscula';
  }
  if (!REGEX_CONTRASENA_USUARIO_API.tieneDigito.test(v)) {
    return 'Debe incluir al menos un número';
  }
  if (!REGEX_CONTRASENA_USUARIO_API.tieneEspecial.test(v)) {
    return 'Debe incluir al menos un carácter especial';
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

/** Límite habitual en VARCHAR de usuario (Laravel). */
export const LONGITUD_NOMBRE_USUARIO_MAX = 255;
export const LONGITUD_EMAIL_USUARIO_MAX = 255;

/**
 * Nombre completo del usuario (perfil / tabla usuarios).
 * Letras con tildes, espacios, guion, apóstrofo y punto (sin números ni símbolos raros).
 */
export function validarNombreCompletoUsuario(valor) {
  const v = typeof valor === 'string' ? valor.trim() : '';
  if (!v) return 'El nombre es obligatorio.';
  if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  if (v.length > LONGITUD_NOMBRE_USUARIO_MAX) {
    return `El nombre no puede superar ${LONGITUD_NOMBRE_USUARIO_MAX} caracteres.`;
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-'.,]+$/u.test(v)) {
    return 'El nombre solo puede incluir letras, espacios, guiones, apóstrofos o comas.';
  }
  return null;
}

/** Correo para formularios de usuario con tope de longitud alineado al backend. */
export function validarEmailUsuario(valor) {
  const base = validarCorreo(valor);
  if (base) return base;
  if (valor.trim().length > LONGITUD_EMAIL_USUARIO_MAX) {
    return `El correo no puede superar ${LONGITUD_EMAIL_USUARIO_MAX} caracteres.`;
  }
  return null;
}

/**
 * Alineado a `UsuarioRequest` (Laravel) — actualización PUT/PATCH: `nombre_usuario` string|max:255.
 * Mensajes iguales a `UsuarioRequest::messages()`.
 */
export function validarNombreUsuarioRequest(valor) {
  const v = typeof valor === 'string' ? valor : '';
  const t = v.trim();
  if (!t) return 'El nombre de usuario es obligatorio.';
  if (t.length > LONGITUD_NOMBRE_USUARIO_MAX) {
    return 'El nombre de usuario no puede superar los 255 caracteres.';
  }
  return null;
}

/**
 * Alineado a `UsuarioRequest`: `email_usuario` string|email|max:255.
 * (El front no replica `email:rfc,dns` al 100%; el servidor sigue siendo la referencia.)
 */
export function validarEmailUsuarioRequest(valor) {
  const v = typeof valor === 'string' ? valor : '';
  const t = v.trim();
  if (!t) return 'El correo electrónico es obligatorio.';
  if (t.length > LONGITUD_EMAIL_USUARIO_MAX) {
    return 'El correo electrónico no puede superar los 255 caracteres.';
  }
  if (!expresionesRegulares.correo.test(t)) {
    return 'El correo electrónico debe tener un formato válido.';
  }
  return null;
}

/**
 * Actualización: `contrasena_usuario` => sometimes|string|min:8|max:64 (vacío = no cambiar).
 */
export function validarContrasenaUsuarioRequestActualizacion(valor) {
  const v = typeof valor === 'string' ? valor : '';
  if (!v.trim()) return null;
  if (v.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (v.length > 64) return 'La contraseña no puede superar los 64 caracteres.';
  return null;
}

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

/** Teclas que no deben bloquearse en inputs de texto (navegación, copiar/pegar, etc.) */
export function esTeclaControlNavegacion(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  const k = e.key;
  if (
    k === 'Backspace' ||
    k === 'Delete' ||
    k === 'Tab' ||
    k === 'Escape' ||
    k === 'Enter' ||
    k === 'ArrowLeft' ||
    k === 'ArrowRight' ||
    k === 'ArrowUp' ||
    k === 'ArrowDown' ||
    k === 'Home' ||
    k === 'End'
  ) {
    return true;
  }
  return false;
}

/** Bloquea en keydown cualquier tecla que no sea dígito (útil en documento CC/CE/TI, celular, cuenta). */
export function prevenirSiNoEsDigito(e) {
  if (esTeclaControlNavegacion(e)) return;
  if (e.key.length === 1 && !/\d/.test(e.key)) {
    e.preventDefault();
  }
}

/** Documento tipo pasaporte: letras, números y guion. */
export function prevenirSiNoEsPasaporteDoc(e) {
  if (esTeclaControlNavegacion(e)) return;
  if (e.key.length === 1 && !/^[A-Za-z0-9\-]$/.test(e.key)) {
    e.preventDefault();
  }
}

/** Nombres/apellidos: letras Unicode y espacio (espejo EmpleadoRequest / \p{L}\s). */
export function prevenirSiNoEsLetrasNombre(e) {
  if (esTeclaControlNavegacion(e)) return;
  if (e.key.length === 1 && e.key !== ' ' && !/^\p{L}$/u.test(e.key)) {
    e.preventDefault();
  }
}

/** Nacionalidad: letras Unicode y espacio. */
export function prevenirSiNoEsNacionalidad(e) {
  if (esTeclaControlNavegacion(e)) return;
  if (e.key.length === 1 && e.key !== ' ' && !/^\p{L}$/u.test(e.key)) {
    e.preventDefault();
  }
}

/** Profesión: letras Unicode y espacio (EmpleadoRequest). */
export function prevenirSiNoEsProfesion(e) {
  if (esTeclaControlNavegacion(e)) return;
  if (e.key.length === 1 && e.key !== ' ' && !/^\p{L}$/u.test(e.key)) {
    e.preventDefault();
  }
}

export function sanitizarSoloDigitos(valor, maxLen = Infinity) {
  const s = String(valor ?? '').replace(/\D/g, '');
  return maxLen < Infinity ? s.slice(0, maxLen) : s;
}

export function sanitizarDocPasaporte(valor, maxLen = 50) {
  return String(valor ?? '')
    .replace(/[^A-Za-z0-9\-]/g, '')
    .slice(0, maxLen);
}

export function sanitizarLetrasNombre(valor, maxLen = 100) {
  return String(valor ?? '')
    .replace(/[^\p{L}\s]/gu, '')
    .slice(0, maxLen);
}

export function sanitizarNacionalidad(valor, maxLen = 50) {
  return String(valor ?? '')
    .replace(/[^\p{L}\s]/gu, '')
    .slice(0, maxLen);
}

export function sanitizarProfesion(valor, maxLen = 100) {
  return String(valor ?? '')
    .replace(/[^\p{L}\s]/gu, '')
    .slice(0, maxLen);
}

