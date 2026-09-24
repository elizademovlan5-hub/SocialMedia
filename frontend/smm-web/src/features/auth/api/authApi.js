import api from '../../../api/axios';

export async function login(data) {
  const response = await api.post('/auth/login', data);

  return response.data;
}

export async function register(data) {
  const response = await api.post('/auth/register', data);

  return response.data;
}

export async function logout(refreshToken) {
  await api.post('/auth/logout', {
    refreshToken,
  });
}