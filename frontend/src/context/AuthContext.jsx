import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartsend_user');
    try {
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smartsend_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. Check Supabase Auth session if configured
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const adminUser = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              email: session.user.email,
              role: 'admin'
            };
            setToken(session.access_token);
            setUser(adminUser);
            localStorage.setItem('smartsend_token', session.access_token);
            localStorage.setItem('smartsend_user', JSON.stringify(adminUser));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session check error:', e);
        }
      }

      // 2. Check existing local token
      const existingToken = localStorage.getItem('smartsend_token');
      if (existingToken && mounted) {
        setToken(existingToken);
        const existingUser = localStorage.getItem('smartsend_user');
        if (existingUser) {
          try {
            setUser(JSON.parse(existingUser));
          } catch {}
        }
      } else if (mounted) {
        setToken(null);
        setUser(null);
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // Listen to Supabase auth state changes (e.g. sign in, sign out, token refresh)
    let authSubscription = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' && session?.user) {
          const adminUser = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            email: session.user.email,
            role: 'admin'
          };
          setToken(session.access_token);
          setUser(adminUser);
          localStorage.setItem('smartsend_token', session.access_token);
          localStorage.setItem('smartsend_user', JSON.stringify(adminUser));
        } else if (event === 'SIGNED_OUT') {
          setToken(null);
          setUser(null);
          localStorage.removeItem('smartsend_token');
          localStorage.removeItem('smartsend_user');
        }
      });
      authSubscription = data?.subscription;
    }

    return () => {
      mounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res?.token && res?.user) {
      localStorage.setItem('smartsend_token', res.token);
      localStorage.setItem('smartsend_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async () => {
    throw new Error('Public registration is disabled. Only authorized administrators can access this workspace.');
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
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

