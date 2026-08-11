import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to request headers
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('naivadyam_user')
      ? JSON.parse(localStorage.getItem('naivadyam_user'))
      : null;
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
