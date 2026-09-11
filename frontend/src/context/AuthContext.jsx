import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Purge any legacy demo or mock tokens from previous app versions
  const cleanInitialSession = () => {
    try {
      const savedToken = localStorage.getItem('smartsend_token');
      if (savedToken && (savedToken.startsWith('demo-') || savedToken.startsWith('mock-'))) {
        localStorage.removeItem('smartsend_token');
        localStorage.removeItem('smartsend_user');
        return null;
      }
      return savedToken || null;
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(() => cleanInitialSession());
  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem('smartsend_token');
      if (!savedToken || savedToken.startsWith('demo-') || savedToken.startsWith('mock-')) {
        return null;
      }
      const savedUser = localStorage.getItem('smartsend_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Strictly verify authentication with Supabase
      if (isSupabaseConfigured) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && session?.access_token && mounted) {
            const meta = session.user.user_metadata || {};
            const adminUser = {
              id: session.user.id,
              name: meta.name || meta.full_name || session.user.email?.split('@')[0],
              email: session.user.email,
              role: 'admin',
              title: meta.title || 'Lead Administrator',
              phone: meta.phone || '',
              company: meta.company || 'SmartSend AI',
              bio: meta.bio || '',
              avatar_url: meta.avatar_url || ''
            };
            setToken(session.access_token);
            setUser(adminUser);
            localStorage.setItem('smartsend_token', session.access_token);
            localStorage.setItem('smartsend_user', JSON.stringify(adminUser));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session verification error:', e);
        }
      }

      // 2. Check for active authenticated user session
      const existingToken = localStorage.getItem('smartsend_token');
      const existingUserStr = localStorage.getItem('smartsend_user');

      if (existingToken && !existingToken.startsWith('demo-') && !existingToken.startsWith('mock-') && existingUserStr && mounted) {
        try {
          const parsedUser = JSON.parse(existingUserStr);
          if (parsedUser && (parsedUser.email || '').toLowerCase() === 'admin@smartsendai.online') {
            setToken(existingToken);
            setUser(parsedUser);
            setLoading(false);
            return;
          }
        } catch (err) {}
      }

      // 3. Outside or unauthenticated visitors: clear and enforce login
      if (mounted) {
        localStorage.removeItem('smartsend_token');
        localStorage.removeItem('smartsend_user');
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    let authSubscription = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && session?.access_token) {
          const meta = session.user.user_metadata || {};
          const adminUser = {
            id: session.user.id,
            name: meta.name || meta.full_name || session.user.email?.split('@')[0],
            email: session.user.email,
            role: 'admin',
            title: meta.title || 'Lead Administrator',
            phone: meta.phone || '',
            company: meta.company || 'SmartSend AI',
            bio: meta.bio || '',
            avatar_url: meta.avatar_url || ''
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

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('smartsend_user', JSON.stringify(res.user));
    } else {
      setUser(prev => {
        const next = { ...prev, ...profileData };
        localStorage.setItem('smartsend_user', JSON.stringify(next));
        return next;
      });
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

  const isAuthenticated = Boolean(token && !token.startsWith('demo-') && !token.startsWith('mock-'));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

