import axios from 'axios';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: API_URL + '/api' });
api.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = 'Bearer ' + t; return c; });
export const errMsg = e => e.response?.data?.message || e.message;
export default api;
