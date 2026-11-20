import axios from 'axios';

export const TOKEN_KEY = 'bb_admin_token';

// Base URL comes from .env (VITE_API_URL). The localhost fallback is for local development only.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach the admin JWT (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says "401" for a logged-in admin, the token expired -> tell the app to log out
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginCall = error.config?.url?.includes('/admin/login');
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY) && !isLoginCall) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// Turns any axios error into one friendly message
export const getErrorMessage = (error) => {
  if (error.code === 'ERR_CANCELED') return '';
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (!error.response) return 'Cannot reach the server. Check your internet connection and try again.';
  const data = error.response.data;
  if (data?.errors?.length) return data.errors.map((e) => e.message).join('. ');
  return data?.message || `Something went wrong (error ${error.response.status}).`;
};

export default api;
