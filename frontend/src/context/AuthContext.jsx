import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const login = async (data) => { const r = await api.post('/auth/login', data); localStorage.setItem('ledger_token', r.data.token); setUser(r.data.user); };
  const register = async (data) => { const r = await api.post('/auth/register', data); localStorage.setItem('ledger_token', r.data.token); setUser(r.data.user); };
  const logout = () => { localStorage.removeItem('ledger_token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
