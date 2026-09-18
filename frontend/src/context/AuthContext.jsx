import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Ensure fresh browser opens always show the Login page first
  const cleanInitialSession = () => {
    try {
      // Clear persistent tokens from localStorage so fresh website visits always show login page
      localStorage.removeItem('smartsend_token');
      localStorage.removeItem('smartsend_user');

      // Check if there is an active in-session token for this specific browser tab
      const sessionToken = sessionStorage.getItem('smartsend_token');
      if (sessionToken && !sessionToken.startsWith('demo-') && !sessionToken.startsWith('mock-')) {
        return sessionToken;
      }
      return null;
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(() => cleanInitialSession());
  const [user, setUser] = useState(() => {
    try {
      const sessionToken = sessionStorage.getItem('smartsend_token');
      if (!sessionToken || sessionToken.startsWith('demo-') || sessionToken.startsWith('mock-')) {
        return null;
      }
      const sessionUser = sessionStorage.getItem('smartsend_user');
      return sessionUser ? JSON.parse(sessionUser) : null;
    } catch {
      return null;
    }
  });

  // If there is no active token in this session, loading is false immediately (zero delay showing login page)
  const [loading, setLoading] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem('smartsend_token'));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const currentSessionToken = sessionStorage.getItem('smartsend_token');

      // If no active session token exists in this tab, enforce logged-out state immediately
      if (!currentSessionToken) {
        if (mounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Verify active session with Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && session?.access_token && mounted) {
            const meta = session.user.user_metadata || {};
            const isDefaultAdmin = (session.user.email || '').toLowerCase() === 'admin@smartsendai.online';
            const activeUser = {
              id: session.user.id,
              name: meta.name || meta.full_name || session.user.email?.split('@')[0],
              email: session.user.email,
              role: meta.role || (isDefaultAdmin ? 'admin' : 'user'),
              title: meta.title || (isDefaultAdmin ? 'Lead Administrator' : 'Workspace Member'),
              phone: meta.phone || '',
              company: meta.company || 'SmartSend AI',
              bio: meta.bio || '',
              avatar_url: meta.avatar_url || ''
            };
            setToken(session.access_token);
            setUser(activeUser);
            sessionStorage.setItem('smartsend_token', session.access_token);
            sessionStorage.setItem('smartsend_user', JSON.stringify(activeUser));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session verification error:', e);
        }
      }

      // Check for active session in sessionStorage
      const sessionUserStr = sessionStorage.getItem('smartsend_user');
      if (currentSessionToken && sessionUserStr && mounted) {
        try {
          const parsedUser = JSON.parse(sessionUserStr);
          if (parsedUser && parsedUser.email) {
            setToken(currentSessionToken);
            setUser(parsedUser);
            setLoading(false);
            return;
          }
        } catch (err) {}
      }

      if (mounted) {
        sessionStorage.removeItem('smartsend_token');
        sessionStorage.removeItem('smartsend_user');
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
          const isDefaultAdmin = (session.user.email || '').toLowerCase() === 'admin@smartsendai.online';
          const activeUser = {
            id: session.user.id,
            name: meta.name || meta.full_name || session.user.email?.split('@')[0],
            email: session.user.email,
            role: meta.role || (isDefaultAdmin ? 'admin' : 'user'),
            title: meta.title || (isDefaultAdmin ? 'Lead Administrator' : 'Workspace Member'),
            phone: meta.phone || '',
            company: meta.company || 'SmartSend AI',
            bio: meta.bio || '',
            avatar_url: meta.avatar_url || ''
          };
          setToken(session.access_token);
          setUser(activeUser);
          sessionStorage.setItem('smartsend_token', session.access_token);
          sessionStorage.setItem('smartsend_user', JSON.stringify(activeUser));
        } else if (event === 'SIGNED_OUT') {
          setToken(null);
          setUser(null);
          sessionStorage.removeItem('smartsend_token');
          sessionStorage.removeItem('smartsend_user');
        }
      });
      authSubscription = data?.subscription;
    }

    return () => {
      mounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const login = async (email, password, remember = true) => {
    const res = await api.login({ email, password });
    if (res?.token && res?.user) {
      sessionStorage.setItem('smartsend_token', res.token);
      sessionStorage.setItem('smartsend_user', JSON.stringify(res.user));

      if (remember) {
        localStorage.setItem('smartsend_remembered_email', email);
      } else {
        localStorage.removeItem('smartsend_remembered_email');
      }

      // Purge any persistent tokens from localStorage
      localStorage.removeItem('smartsend_token');
      localStorage.removeItem('smartsend_user');

      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    // Intentionally do not set token or user state here.
    // Flow requires the user to log in on the Login page after signing up.
    return res;
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    if (res?.user) {
      setUser(res.user);
      sessionStorage.setItem('smartsend_user', JSON.stringify(res.user));
    } else {
      setUser(prev => {
        const next = { ...prev, ...profileData };
        sessionStorage.setItem('smartsend_user', JSON.stringify(next));
        return next;
      });
    }
    return res;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    sessionStorage.removeItem('smartsend_token');
    sessionStorage.removeItem('smartsend_user');
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

