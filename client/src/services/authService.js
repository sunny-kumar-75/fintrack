
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const authApi = axios.create({
  baseURL: `${API_BASE}/api/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function signup(formData) {
  const { data } = await authApi.post('/signup', formData);
  return data;
}

export async function login(email, password) {
  const { data } = await authApi.post('/login', { email, password });
  return data;
}

export async function googleAuth(googleData) {
  const { data } = await authApi.post('/google', googleData);
  return data;
}

export async function forgotPassword(email) {
  const { data } = await authApi.post('/forgot-password', { email });
  return data;
}

export async function resetPassword(email, otp, password) {
  const { data } = await authApi.post(`/reset-password`, { email, otp, password });
  return data;
}

export async function refreshToken() {
  const { data } = await authApi.post('/refresh-token');
  return data;
}

export async function getMe(token) {
  const { data } = await authApi.get('/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return data;
}

export async function logout() {
  const { data } = await authApi.post('/logout');
  return data;
}

export async function changePassword(token, currentPassword, newPassword) {
  const { data } = await authApi.post(
    '/change-password',
    { currentPassword, newPassword },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  return data;
}
