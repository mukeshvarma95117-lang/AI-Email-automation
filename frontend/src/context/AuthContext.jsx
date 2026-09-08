import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartsend_user');
    try {
      if (saved) return JSON.parse(saved);
    } catch {}
    return { id: 1, name: 'Admin User', email: 'admin@smartsend.ai', role: 'admin' };
  });

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('smartsend_token');
    if (saved) return saved;
    const initialToken = 'demo-session-' + Date.now();
    localStorage.setItem('smartsend_token', initialToken);
    localStorage.setItem('smartsend_user', JSON.stringify({ id: 1, name: 'Admin User', email: 'admin@smartsend.ai', role: 'admin' }));
    return initialToken;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !token.startsWith('demo-')) {
      let isDone = false;
      const timer = setTimeout(() => {
        if (!isDone) setLoading(false);
      }, 2500);

      api.getMe()
        .then(res => {
          isDone = true;
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('smartsend_user', JSON.stringify(res.user));
          }
        })
        .catch((err) => {
          isDone = true;
          // Only log out if specifically 401 Unauthorized from live backend
          if (err?.message?.includes('401') || err?.message?.includes('token')) {
            logout();
          }
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

