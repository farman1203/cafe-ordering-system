import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loginAdmin, fetchProfile } from '../services/adminService';
import { TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY)); // true while we verify a saved token

  // On page load: if a token is saved, ask the server who we are
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    fetchProfile()
      .then(setAdmin)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // axios interceptor fires this when the JWT expires
  useEffect(() => {
    const onExpired = () => {
      setAdmin(null);
      toast.info('Your session expired. Please log in again.');
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginAdmin(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  return <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
