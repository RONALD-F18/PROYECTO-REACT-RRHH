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

export const validarContrasena = (valor) => {
  if (!valor) return "La contraseña es requerida";
  if (valor.length < 8) return "Debe tener al menos 8 caracteres";
  if (!expresionesRegulares.mayuscula.test(valor)) return "Debe tener al menos una mayúscula";
  if (!expresionesRegulares.numero.test(valor)) return "Debe tener al menos un número";
  return null;
};

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



