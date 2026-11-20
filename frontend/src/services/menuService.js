import api from './api';

export const fetchMenu = async (params = {}, signal) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null && v !== 'All' && v !== false));
  const { data } = await api.get('/menu', { params: clean, signal });
  return data.data;
};
export const fetchCategories = async (signal) => (await api.get('/menu/categories', { signal })).data.data;
export const createMenuItem = async (payload) => (await api.post('/menu', payload)).data.data;
export const updateMenuItem = async (id, payload) => (await api.put(`/menu/${id}`, payload)).data.data;
export const deleteMenuItem = async (id) => (await api.delete(`/menu/${id}`)).data;
