import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'ledger_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (data) => {
    const response = await api.post('/auth/login', data);
    localStorage.setItem(TOKEN_KEY, response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    localStorage.setItem(TOKEN_KEY, response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);