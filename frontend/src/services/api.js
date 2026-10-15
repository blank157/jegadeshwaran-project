import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT token from current session to every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('swift_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config?.url?.includes('/api/auth/login')) {
      sessionStorage.removeItem('swift_token');
      sessionStorage.removeItem('swift_user');
      localStorage.removeItem('swift_token');
      localStorage.removeItem('swift_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
