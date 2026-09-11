import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  Sparkles,
  Sun,
  Moon,
  LogOut,
  User,
  PlusCircle,
  ShieldCheck,
  FlaskConical,
  LayoutDashboard,
  Wand2,
  Users,
  Clock,
  History,
  Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/profile', label: 'Admin Profile', icon: User },
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/generator', label: 'AI Composer', icon: Wand2, highlight: true },
  { path: '/contacts', label: 'Contacts & Groups', icon: Users },
  { path: '/scheduled', label: 'Scheduled Queue', icon: Clock },
  { path: '/history', label: 'Delivery History', icon: History },
  { path: '/settings', label: 'Settings & APIs', icon: Settings },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then(res => {
        setIsDemoMode(res.settings?.demo_mode === 'true');
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors shadow-xs">
      {/* Top Bar: Brand, Quick Status, Action Controls */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/60">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-100 dark:to-indigo-400 bg-clip-text text-transparent">
                  SmartSend AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  GenAI 2.0
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right actions: Mode Badge, New Message, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode / Live Mode Badge */}
          {isDemoMode ? (
            <Link
              to="/settings"
              title="Click to configure API credentials in Settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors btn-lift"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="font-semibold">Demo Mode</span>
              <span className="hidden md:inline text-[10px] opacity-75">(Safe Simulation)</span>
            </Link>
          ) : (
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 btn-lift"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold">Live Mode</span>
            </Link>
          )}

          {/* Quick Create Button */}
          <Link
            to="/generator"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm shadow-indigo-600/30 transition-all btn-lift btn-shimmer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Message</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light and Dark Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer select-none active:scale-95 btn-lift"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user?.name || 'Admin'}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-xs"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <span className="hidden md:block text-xs font-medium text-slate-700 dark:text-slate-200">
                {user?.name || 'Admin'}
              </span>
            </button>

            {menuOpen && (
              <div
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40"
              >
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute right-4 top-14 w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Admin User'}</p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{user?.title || 'Workspace Administrator'}</p>
                    <p className="text-slate-400 truncate text-[10px] mt-0.5">{user?.email || 'admin@smartsendai.online'}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-1 font-medium"
                  >
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings & API Keys</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors mt-1 cursor-pointer border-t border-slate-100 dark:border-slate-800/80 pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Menu Options Bar on the Top */}
      <div className="px-4 sm:px-6 lg:px-8 bg-slate-50/75 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800/40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto overflow-y-hidden py-1.5 no-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-150 select-none cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'scale-110 text-white'
                            : 'text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                        }`}
                      />
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="flex h-2 w-2 relative ml-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick System Online indicator */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1.5 shrink-0 pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </header>
  );
}


