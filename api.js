import axios from 'axios';

const api = axios.create({
  baseURL: '', // Empty base string matches Vite's proxy configurations
  timeout: 45000, // 45 seconds timeout for heavy spaCy resume parsing executions
});

// Outbound request interceptor to automatically attach authorization tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Inbound response interceptor to handle standard API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // Token expiration / invalid token
      if (status === 401) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
