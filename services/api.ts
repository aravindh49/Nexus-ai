
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data: any) => api.post('/auth/token', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  signup: (data: any) => api.post('/auth/signup', data),
  me: () => api.get('/users/me'),
  getUsers: () => api.get('/users'),
};

export const resourceApi = {
  getAll: () => api.get('/resources'),
  create: (data: any) => api.post('/resources', data),
  remediate: (id: number) => api.post(`/resources/${id}/remediate`),
};

export const taskApi = {
  getAll: () => api.get('/tasks'),
  create: (data: any) => api.post('/tasks', data),
  optimize: (id: number) => api.post(`/tasks/${id}/optimize`),
};

export default api;
