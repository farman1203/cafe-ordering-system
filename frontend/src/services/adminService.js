import api from './api';

export const loginAdmin = async (email, password) => (await api.post('/admin/login', { email, password })).data;
export const fetchProfile = async () => (await api.get('/admin/profile')).data.data;
export const fetchStats = async (signal) => (await api.get('/admin/stats', { signal })).data.data;
