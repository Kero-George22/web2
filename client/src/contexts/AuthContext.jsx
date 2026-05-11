import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate user on mount using the session cookie
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUser(res.data.data.user);
      })
      .catch(() => {
        setUser(null); 
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: u } = res.data.data;
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { user: u } = res.data.data;
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { 
      await api.post('/auth/logout'); 
    } catch { 
      /* handle error if needed */ 
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
