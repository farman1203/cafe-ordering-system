import api from './api';

export const createOrder = async (payload) => (await api.post('/orders', payload)).data.data;
export const trackOrder = async (orderId, phone, signal) =>
  (await api.get(`/orders/track/${encodeURIComponent(orderId.trim())}`, { params: { phone }, signal })).data.data;

// admin
export const fetchOrders = async (params = {}, signal) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== 'All'));
  return (await api.get('/orders', { params: clean, signal })).data.data;
};
export const updateOrderStatus = async (id, status) => (await api.patch(`/orders/${id}/status`, { status })).data.data;
