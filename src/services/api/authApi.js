import api from '../api';

export async function loginApi(payload) {
  const { data } = await api.post('/login', payload);
  return data;
}

export async function logoutApi() {
  const { data } = await api.post('/logout', {});
  return data;
}
