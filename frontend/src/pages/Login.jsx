import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);

  // Independent Login Form State (Always starts empty, never prefilled from sign-up)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Independent Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const { login, register } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setLoginEmail('admin@smartsend.ai');
    setLoginPassword('admin123');
    setIsRegister(false);
    setAccountNotFound(false);
    setRegisteredSuccess(false);
    info('Demo admin credentials loaded. Click LOGIN to sign in.', 'Demo Loaded');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAccountNotFound(false);
    setRegisteredSuccess(false);

    if (!loginEmail || !loginPassword) {
      error('Please enter both your email and password.');
      setLoading(false);
      return;
    }

    try {
      await login(loginEmail, loginPassword);
      success('Signed in successfully.');
      navigate('/');
    } catch (err) {
      if (err.message && (err.message.includes('No account found') || err.message.includes('USER_NOT_FOUND'))) {
        setAccountNotFound(true);
      } else {
        error(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAccountNotFound(false);
    setRegisteredSuccess(false);

    if (!regEmail || !regPassword) {
      error('Please enter both your email and password.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create account in backend database without logging in
      await register(regName, regEmail, regPassword, false);

      // 2. Clear registration inputs
      setRegName('');
      setRegEmail('');
      setRegPassword('');

      // 3. Keep login fields completely empty (do NOT prefill)
      setLoginEmail('');
      setLoginPassword('');

      // 4. Set success message prompt
      setRegisteredSuccess(true);

      // 5. Trigger the signature sliding animation back to Login panel!
      setIsRegister(false);

      info('Account created successfully! Please log in with your credentials.', 'Account Created');
    } catch (err) {
      error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantAutoRegister = async () => {
    setLoading(true);
    try {
      await login(loginEmail, loginPassword, true); // autoRegister = true
      success(`Account created with ${loginEmail} and signed in!`, 'Welcome!');
      navigate('/');
    } catch (err) {
      error(err.message || 'Failed to auto-create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f0f2f5] dark:bg-[#0c0f14] font-poppins antialiased text-[#1c1e21] dark:text-slate-100 transition-colors">
      {/* Floating Theme Toggle (Switch between Light and Dark mode anytime) */}
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

      {/* Sliding Master Card (Frontend Joe CSS Logins Part 19) */}
      <div className="relative w-full max-w-4xl min-h-[580px] bg-white dark:bg-[#141820] rounded-[32px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-800/80 overflow-hidden flex">
        
        {/* ========================================================================= */}
        {/* 1. SIGN IN FORM CONTAINER (Left Half)                                    */}
        {/* ========================================================================= */}
        <div 
          className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            isRegister 
              ? 'hidden md:flex md:opacity-0 md:-translate-x-8 md:pointer-events-none' 
              : 'flex opacity-100 translate-x-0 pointer-events-auto z-10'
          }`}
        >
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1e21] dark:text-white">
                Login
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your email to access your messaging workspace.
              </p>
            </div>

            {/* Account Created - Prompt to Log In with Animation (Fields kept blank) */}
            {registeredSuccess && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs space-y-1.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="font-bold text-xs">Account created successfully!</p>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 pl-6 leading-relaxed">
                  Please enter your email and password below to log in.
                </p>
              </div>
            )}

            {/* Account Not Found Auto-Register Prompt */}
            {accountNotFound && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">No account found with "{loginEmail}"</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Would you like to create an account with this password?
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleInstantAutoRegister}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Create Account & Sign In Now
                </button>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="hello@example.com"
                  value={loginEmail}
                  onChange={e => {
                    setLoginEmail(e.target.value);
                    setAccountNotFound(false);
                    setRegisteredSuccess(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800/80 border-0 text-[#1c1e21] dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => {
                    setLoginPassword(e.target.value);
                    setAccountNotFound(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800/80 border-0 text-[#1c1e21] dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-[#1c1e21]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => info('Password reset link has been dispatched to your email (simulated).', 'Reset Password')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold tracking-wider text-xs uppercase bg-[#1c1e21] dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white shadow-md active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Processing...' : 'LOGIN'}
              </button>
            </form>

            {/* Divider with 'Or' */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <span className="relative bg-white dark:bg-[#141820] px-3 text-[11px] text-slate-400">
                Or
              </span>
            </div>

            {/* Social / Fast Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const googleEmail = prompt('Enter your Google email:', 'myname@gmail.com');
                  if (googleEmail) {
                    setLoginEmail(googleEmail);
                    setLoginPassword('google_auth_pass');
                    info(`Google account ${googleEmail} loaded. Click LOGIN to sign in.`, 'Google Ready');
                  }
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800 hover:bg-[#e9ecf0] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleFillDemo}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800 hover:bg-[#e9ecf0] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ⚡
                </div>
                <span>Demo User</span>
              </button>
            </div>
          </div>

          {/* Mobile switcher link */}
          <div className="pt-4 text-center md:hidden text-xs text-slate-500">
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => {
                setIsRegister(true);
                setRegisteredSuccess(false);
              }} 
              className="text-indigo-600 font-bold underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SIGN UP FORM CONTAINER (Right Half behind sliding panel)               */}
        {/* ========================================================================= */}
        <div 
          className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
            !isRegister 
              ? 'hidden md:flex md:opacity-0 md:translate-x-8 md:pointer-events-none' 
              : 'flex opacity-100 translate-x-0 pointer-events-auto z-10'
          }`}
        >
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1e21] dark:text-white">
                Create Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your details to start sending personalized AI messages.
              </p>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Mukesh Varma"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800/80 border-0 text-[#1c1e21] dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800/80 border-0 text-[#1c1e21] dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400">Min 4 chars</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Choose password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800/80 border-0 text-[#1c1e21] dark:text-white text-xs placeholder-slate-400 focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold tracking-wider text-xs uppercase bg-[#1c1e21] dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white shadow-md active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'SIGN UP'}
              </button>
            </form>

            {/* Divider with 'Or' */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <span className="relative bg-white dark:bg-[#141820] px-3 text-[11px] text-slate-400">
                Or
              </span>
            </div>

            {/* Quick Demo Option */}
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-[#f2f4f7] dark:bg-slate-800 hover:bg-[#e9ecf0] text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                ⚡
              </div>
              <span>Load Pre-configured Demo Account</span>
            </button>
          </div>

          {/* Mobile switcher link */}
          <div className="pt-4 text-center md:hidden text-xs text-slate-500">
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={() => {
                setIsRegister(false);
                setRegisteredSuccess(false);
              }} 
              className="text-indigo-600 font-bold underline cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SLIDING OVERLAY CONTAINER (Desktop Only, Signature Reel Animation)     */}
        {/* ========================================================================= */}
        <div 
          className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full z-30 overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] p-3 pointer-events-none ${
            isRegister ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* Inner Mountain Graphic Panel with Rounded Corners */}
          <div className="relative w-full h-full rounded-[26px] overflow-hidden flex flex-col items-center justify-center p-8 sm:p-12 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] select-none pointer-events-auto">
            
            {/* Picture Fits Exactly Edge-to-Edge with Subtle Parallax Synchronized to Slide */}
            <img
              src="/mountain-dusk.jpg"
              alt="Mountain wallpaper"
              className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] scale-110 ${
                isRegister ? 'translate-x-3' : '-translate-x-3'
              }`}
            />

            {/* Cinematic Gradient Overlays for High-Contrast Centered Typography */}
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/65"></div>

            {/* SmartSend AI Brand Chip - Positioned at Top Left */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="tracking-wide">SmartSend AI</span>
            </div>

            {/* Centered Text & Button Container with Horizontal Transitions That Move WITH the Image Animation */}
            <div className="relative z-10 w-full max-w-sm flex items-center justify-center text-center min-h-[260px] overflow-hidden">
              
              {/* --- SLIDING CONTENT A: 'Hello there / SIGN UP' (Active when in Login mode) --- */}
              <div 
                className={`absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 px-4 transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
                  !isRegister 
                    ? 'opacity-100 translate-x-0 pointer-events-auto' 
                    : 'opacity-0 -translate-x-32 pointer-events-none'
                }`}
              >
                <div className="space-y-2">
                  <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
                    !isRegister ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                  }`}>
                    Hello there
                  </h2>
                  <p className={`text-xs sm:text-sm text-slate-100/90 leading-relaxed font-normal drop-shadow max-w-xs mx-auto transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] delay-75 ${
                    !isRegister ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'
                  }`}>
                    Begin your journey using this software, and start sending now.
                  </p>
                </div>

                <div className={`pt-3 transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] delay-150 ${
                  !isRegister ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-12 opacity-0 scale-95'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setAccountNotFound(false);
                      setRegisteredSuccess(false);
                    }}
                    className="px-10 py-3 rounded-full border-2 border-white text-white font-bold tracking-widest text-xs uppercase bg-black/30 hover:bg-white hover:text-slate-950 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    SIGN UP
                  </button>
                </div>
              </div>

              {/* --- SLIDING CONTENT B: 'Welcome back / SIGN IN' (Active when in Register mode) --- */}
              <div 
                className={`absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 px-4 transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
                  isRegister 
                    ? 'opacity-100 translate-x-0 pointer-events-auto' 
                    : 'opacity-0 translate-x-32 pointer-events-none'
                }`}
              >
                <div className="space-y-2">
                  <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
                    isRegister ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
                  }`}>
                    Welcome back
                  </h2>
                  <p className={`text-xs sm:text-sm text-slate-100/90 leading-relaxed font-normal drop-shadow max-w-xs mx-auto transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] delay-75 ${
                    isRegister ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
                  }`}>
                    To keep connected with us, please login with your personal info.
                  </p>
                </div>

                <div className={`pt-3 transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] delay-150 ${
                  isRegister ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-12 opacity-0 scale-95'
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setAccountNotFound(false);
                      setRegisteredSuccess(false);
                    }}
                    className="px-10 py-3 rounded-full border-2 border-white text-white font-bold tracking-widest text-xs uppercase bg-black/30 hover:bg-white hover:text-slate-950 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    SIGN IN
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
