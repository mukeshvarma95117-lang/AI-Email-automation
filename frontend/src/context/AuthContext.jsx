import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartsend_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartsend_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      let isDone = false;
      const timer = setTimeout(() => {
        if (!isDone) setLoading(false);
      }, 2500);

      api.getMe()
        .then(res => {
          isDone = true;
          setUser(res.user);
          localStorage.setItem('smartsend_user', JSON.stringify(res.user));
        })
        .catch(() => {
          isDone = true;
          logout();
        })
        .finally(() => {
          isDone = true;
          clearTimeout(timer);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password, autoRegister = false) => {
    const res = await api.login({ email, password, autoRegister });
    localStorage.setItem('smartsend_token', res.token);
    localStorage.setItem('smartsend_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password, autoLogin = false) => {
    const res = await api.register({ name, email, password });
    if (autoLogin) {
      localStorage.setItem('smartsend_token', res.token);
      localStorage.setItem('smartsend_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('smartsend_token');
    localStorage.removeItem('smartsend_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: Boolean(token) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

