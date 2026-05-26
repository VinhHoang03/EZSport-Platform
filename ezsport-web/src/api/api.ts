import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.replace(/\/$/, '') + (rawBaseURL.endsWith('/api') ? '' : '/api');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
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

export default api;
