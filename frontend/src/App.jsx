import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/layout/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Contacts from './pages/Contacts';
import Scheduled from './pages/Scheduled';
import History from './pages/History';
import Settings from './pages/Settings';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
          <p className="text-xs font-semibold">Loading SmartSend AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 min-w-0">
        <div key={location.pathname} className="animate-page-enter">
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/scheduled" element={<Scheduled />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

