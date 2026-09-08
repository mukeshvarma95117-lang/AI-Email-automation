import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Wand2,
  Users,
  Clock,
  History,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/generator', label: 'AI Composer', icon: Wand2, highlight: true },
  { path: '/contacts', label: 'Contacts & Groups', icon: Users },
  { path: '/scheduled', label: 'Scheduled Queue', icon: Clock },
  { path: '/history', label: 'Delivery History', icon: History },
  { path: '/settings', label: 'Settings & APIs', icon: Settings },
];

export default function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hidden lg:flex flex-col justify-between p-4 transition-colors min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Main Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar-nav-item group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium select-none cursor-pointer overflow-hidden ${
                    isActive
                      ? 'active bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 relative z-10">
                      {/* Active Indicator Accent Bar */}
                      <span
                        className={`w-1 h-4 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-white scale-y-100 opacity-100'
                            : 'bg-transparent scale-y-0 opacity-0 -ml-1'
                        }`}
                      />
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'scale-110 text-white drop-shadow-xs'
                            : 'text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                        }`}
                      />
                      <span className="transition-transform duration-200">
                        {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 relative z-10">
                      {item.highlight && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-all duration-200 ${
                          isActive
                            ? 'text-white/80 translate-x-0 opacity-100'
                            : 'text-slate-400 -translate-x-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                        }`}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Workflow Quick Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-xs mb-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Workflow Engine</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            Transform plain prompts into multi-channel campaigns in seconds.
          </p>
          <div className="flex flex-col gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[9px] flex items-center justify-center font-bold">1</span>
              <span>Describe message intent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[9px] flex items-center justify-center font-bold">2</span>
              <span>AI generation & refine</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[9px] flex items-center justify-center font-bold">3</span>
              <span>Personalize & Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[9px] flex items-center justify-center font-bold">4</span>
              <span>Send / Schedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Switcher */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3 mb-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>Theme</span>
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <span className={`px-2 py-0.5 rounded-md transition-all ${!isDark ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-400'}`}>Light</span>
            <span className={`px-2 py-0.5 rounded-md transition-all ${isDark ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-400'}`}>Dark</span>
          </button>
        </div>
      </div>

      {/* Channel indicators footer */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-2 px-1">
          Supported Channels
        </p>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
          <div className="flex items-center gap-1" title="Email (SMTP)">
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px]">Email</span>
          </div>
          <div className="flex items-center gap-1" title="WhatsApp Business">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px]">WhatsApp</span>
          </div>
          <div className="flex items-center gap-1" title="SMS (Twilio)">
            <Smartphone className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[11px]">SMS</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

