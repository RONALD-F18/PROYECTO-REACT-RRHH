import api from './api';

export async function iniciarSesion(credenciales) {
  const { data } = await api.post('/login', {
    email_usuario: credenciales.email_usuario,
    contrasena_usuario: credenciales.contrasena_usuario,
  });
  return data;
}

export async function cerrarSesion() {
  const { data } = await api.post('/logout');
  return data;
}
