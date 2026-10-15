import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/api/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (e) {
    // Ignore logout errors
  } finally {
    sessionStorage.removeItem('swift_token');
    sessionStorage.removeItem('swift_user');
    localStorage.removeItem('swift_token');
    localStorage.removeItem('swift_user');
  }
};
