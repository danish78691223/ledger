import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ledger_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('ledger_token')) {
      localStorage.removeItem('ledger_token');

      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;