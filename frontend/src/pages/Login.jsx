import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, 
  AlertCircle, 
  Sun, 
  Moon, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2 
} from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const passwordInputRef = useRef(null);

  const { login, isAuthenticated } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    if (location.state?.justSignedUp) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 150);
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (!email || !password) {
      error('Please enter both your email and password.');
      setLoading(false);
      return;
    }

    try {
      await login(email.trim(), password);
      success('Welcome back! Signed into SmartSend AI workspace.');
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f0f2f5] dark:bg-[#0c0f14] font-poppins antialiased text-[#1c1e21] dark:text-slate-100 transition-colors">
      {/* Floating Theme Toggle */}
      <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Light and Dark Mode"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer select-none"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container Card */}
      <div className="relative w-full max-w-4xl min-h-[560px] bg-white dark:bg-[#141820] rounded-[32px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800/80 overflow-hidden flex flex-col md:flex-row">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: Clean, Focused Sign-In Form                                  */}
        {/* ========================================================================= */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-1 flex items-center justify-center border border-indigo-500/30 shadow-md shadow-indigo-500/20">
                <img
                  src="/logo-icon.png"
                  alt="SmartSend AI Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(14,165,233,0.35)]"
                />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block">
                  SmartSend AI
                </span>
                <span className="text-[10px] text-slate-400 font-medium block -mt-1">
                  Enterprise Automation
                </span>
              </div>
            </div>

            {/* Switcher Tabs between Sign In and Sign Up */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl mb-6 border border-slate-200/70 dark:border-slate-800 text-xs font-semibold">
              <span className="flex-1 py-1.5 px-3 text-center rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                Sign In
              </span>
              <Link 
                to="/signup" 
                className="flex-1 py-1.5 px-3 text-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Sign Up
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1e21] dark:text-white">
                Workspace Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your account.
              </p>
            </div>

            {/* Success Message Alert (after registration) */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="font-semibold">{successMessage}</p>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <p className="font-semibold">{errorMessage}</p>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 text-[#1c1e21] dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-[#f2f4f7] dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 text-[#1c1e21] dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span>Remember session</span>
                </label>

                <button
                  type="button"
                  onClick={() => info('Please contact your administrator to reset your credentials.', 'Password Reset')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold tracking-wider text-xs uppercase bg-[#1c1e21] dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white shadow-md active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Signup */}
            <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              <span>Don't have an account? </span>
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Security Notice Footer */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Protected workspace environment.</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Visual Artwork & Security Information                       */}
        {/* ========================================================================= */}
        <div className="hidden md:flex md:w-1/2 p-3">
          <div className="relative w-full h-full rounded-[26px] overflow-hidden flex flex-col justify-between p-8 sm:p-10 text-white shadow-2xl select-none">
            {/* Background Artwork */}
            <img
              src="/mountain-dusk.jpg"
              alt="Workspace wallpaper"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none scale-105"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-black/45"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-slate-950/20 to-black/80"></div>

            {/* Brand Pill */}
            <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-lg w-fit">
              <img src="/logo-icon.png" alt="SmartSend AI Logo" className="w-4 h-4 object-contain filter drop-shadow-[0_1px_4px_rgba(14,165,233,0.5)]" />
              <span className="tracking-wide">SmartSend AI Suite</span>
            </div>

            {/* Centered Typography */}
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 backdrop-blur-sm border border-indigo-400/30 text-[11px] font-medium text-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span>Supabase Protected</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                Admin Console
              </h2>
              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal drop-shadow max-w-sm">
                Single unified portal for AI-powered multi-channel communication, Resend live email delivery, and recipient contact management.
              </p>
            </div>

            {/* Bottom Status Card */}
            <div className="relative z-10 p-3.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-white font-semibold">Protected Environment</span>
              </div>
              <span className="text-slate-400">Team Admin Access</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
