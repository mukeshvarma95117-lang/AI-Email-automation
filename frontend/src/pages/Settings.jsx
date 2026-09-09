import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
  Settings as SettingsIcon,
  Sparkles,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  Key,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Sliders,
  Send,
  Sun,
  Moon,
  Zap,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    demo_mode: 'true',
    default_channel: 'email',
    default_tone: 'Professional',
    default_language: 'English',
    timezone: 'Asia/Kolkata',
    llm_provider: 'openai',
    llm_model: 'gpt-4o-mini',
    llm_base_url: 'https://api.openai.com/v1',
    llm_api_key: '',
    email_provider: 'resend',
    resend_api_key: '',
    resend_from: 'SmartSend AI <notifications@smartsendai.online>',
    email_host: 'smtp.gmail.com',
    email_port: '587',
    email_user: '',
    email_pass: '',
    email_from: 'notifications@smartsend.ai',
    whatsapp_provider: 'meta_cloud',
    whatsapp_token: '',
    whatsapp_phone_number_id: '',
    sms_provider: 'twilio',
    sms_account_sid: '',
    sms_auth_token: '',
    sms_from_number: '+15550100'
  });

  const [saving, setSaving] = useState(false);
  const [testingLlm, setTestingLlm] = useState(false);
  const [testingChannel, setTestingChannel] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);
  const [verifyingSmtp, setVerifyingSmtp] = useState(false);
  const [verifyingResend, setVerifyingResend] = useState(false);
  const [showGmailGuide, setShowGmailGuide] = useState(false);

  const { success, error, info } = useToast();
  const { theme, setTheme, isDark } = useTheme();

  useEffect(() => {
    let mounted = true;
    api.getSettings()
      .then(res => {
        if (mounted && res?.settings) {
          setSettings(prev => ({ ...prev, ...res.settings }));
        }
      })
      .catch(err => {
        console.error('Settings load warning:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      success('Settings successfully updated and saved.', 'Saved');
    } catch (err) {
      error(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestLlm = async () => {
    setTestingLlm(true);
    try {
      const res = await api.testLlm({
        apiKey: settings.llm_api_key,
        baseUrl: settings.llm_base_url,
        model: settings.llm_model
      });
      if (res.success) {
        success(res.message, 'LLM API Connected');
      } else {
        info(res.message || res.error, 'Built-in Engine Mode');
      }
    } catch (err) {
      error(err.message || 'LLM Connection failed.');
    } finally {
      setTestingLlm(false);
    }
  };

  const handleVerifyResend = async () => {
    setVerifyingResend(true);
    try {
      const res = await api.verifyResend({
        apiKey: settings.resend_api_key,
        from: settings.resend_from
      });

      if (res.valid) {
        success(res.message, 'Resend Connected Successfully!');
      } else {
        error(res.message, 'Resend Verification Failed');
      }
    } catch (err) {
      error(err.message || 'Failed to verify Resend API credentials.');
    } finally {
      setVerifyingResend(false);
    }
  };

  const applyGmailPreset = () => {
    setSettings(prev => ({
      ...prev,
      email_provider: 'smtp',
      email_host: 'smtp.gmail.com',
      email_port: '465',
      email_from: prev.email_user ? `SmartSend AI <${prev.email_user}>` : 'SmartSend AI <notifications@smartsend.ai>'
    }));
    setShowGmailGuide(true);
    success('Gmail SMTP settings preset applied.', 'Gmail Preset Applied');
  };

  const handleVerifySmtp = async () => {
    if (!settings.email_user) {
      error('Please enter your SMTP Username (e.g. your Gmail address) before verifying.');
      return;
    }
    setVerifyingSmtp(true);
    try {
      const res = await api.verifySmtp({
        host: settings.email_host,
        port: settings.email_port,
        user: settings.email_user,
        pass: settings.email_pass
      });

      if (res.valid) {
        success(res.message, 'SMTP Connected Successfully!');
      } else {
        if (res.message?.includes('535') || res.message?.toLowerCase().includes('password')) {
          setShowGmailGuide(true);
        }
        error(res.message, 'SMTP Connection Failed');
      }
    } catch (err) {
      error(err.message || 'Failed to verify SMTP server credentials.');
    } finally {
      setVerifyingSmtp(false);
    }
  };

  const handleTestEmail = async () => {
    const defaultRecipient = settings.email_user || 'mukeshvarma95117@gmail.com';
    const target = prompt('Enter recipient email address to receive a live test email:', defaultRecipient);
    if (!target || !target.trim()) return;

    setTestingChannel('email');
    try {
      const res = await api.testChannel({
        channel: 'email',
        testRecipient: target.trim(),
        forceReal: true
      });

      if (res.success && res.result?.status === 'Sent') {
        const providerName = res.result?.provider === 'resend' ? 'Resend API' : 'SMTP';
        success(`Live verification email dispatched via ${providerName} to ${target}! Please check your inbox.`, 'Email Delivered!');
      } else if (res.result?.isDemo) {
        info(`Simulated in Demo Mode (${res.result?.status}). To send real emails, disable Demo Mode.`, 'Demo Notice');
      } else {
        error(res.result?.error || 'Email dispatch failed. Please check your credentials.', 'Delivery Failed');
      }
    } catch (err) {
      error(err.message || 'Failed to dispatch test email.');
    } finally {
      setTestingChannel(null);
    }
  };

  const handleTestChannel = async (channel) => {
    if (channel === 'email') {
      return handleTestEmail();
    }
    setTestingChannel(channel);
    const target = prompt(`Enter test destination for ${channel} (Phone number with country code):`, '+15550192');
    if (!target) {
      setTestingChannel(null);
      return;
    }

    try {
      const res = await api.testChannel({ channel, testRecipient: target });
      success(`Test ${channel} dispatched to ${target}! (Result: ${res.result?.status})`, 'Channel Verified');
    } catch (err) {
      error(err.message || `Test ${channel} failed.`);
    } finally {
      setTestingChannel(null);
    }
  };

  const isResendActive = (settings.email_provider || 'resend') === 'resend';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Settings & Provider Configurations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure appearance, Resend API / SMTP email delivery, LLM endpoints, WhatsApp, SMS, and simulation modes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer btn-shimmer btn-glow btn-lift"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Preferences'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 0: Appearance & Theme Mode */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Appearance & Theme Mode
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Active: {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Choose your preferred color palette. Changes apply immediately across the entire platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                !isDark
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Light Mode</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Clean, bright interface optimized for day work</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                !isDark ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {!isDark && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                isDark
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm border border-indigo-800/80">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Dark Mode</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Deep slate & indigo theme with low eye strain</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isDark ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {isDark && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </button>
          </div>
        </div>

        {/* Section 1: Demo Mode Switch */}
        <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          String(settings.demo_mode) === 'true'
            ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/60'
            : 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-900/60'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FlaskConical className={`w-5 h-5 ${String(settings.demo_mode) === 'true' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Demo Mode (Simulation Engine)</span>
                {String(settings.demo_mode) === 'true' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    Simulation Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Live Delivery Active
                  </span>
                )}
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed max-w-xl">
              {String(settings.demo_mode) === 'true'
                ? 'When Demo Mode is enabled, message dispatches are simulated safely without requiring live provider delivery. Turn off to dispatch real emails and messages.'
                : 'Live Delivery is active: Emails and messages dispatched through SmartSend AI will be transmitted to real recipients via your configured provider.'}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={String(settings.demo_mode) === 'true'}
              onChange={e => handleChange('demo_mode', e.target.checked ? 'true' : 'false')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {/* Section 2: LLM API Configuration */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                OpenAI-Compatible LLM Configuration
              </h3>
            </div>
            <button
              type="button"
              onClick={handleTestLlm}
              disabled={testingLlm}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              {testingLlm ? 'Testing API...' : 'Test Connection'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Provider Endpoint</label>
              <input
                type="text"
                placeholder="https://api.openai.com/v1"
                value={settings.llm_base_url}
                onChange={e => handleChange('llm_base_url', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Model Name</label>
              <input
                type="text"
                placeholder="gpt-4o-mini or llama-3.3-70b"
                value={settings.llm_model}
                onChange={e => handleChange('llm_model', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-proj-..."
                  value={settings.llm_api_key}
                  onChange={e => handleChange('llm_api_key', e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Compatible with OpenAI, Groq, OpenRouter, and Ollama. Leave empty to use SmartSend Built-in Smart Fallback Engine.
          </p>
        </div>

        {/* Section 3: Email Dispatch Configuration (Resend API & SMTP) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Email Dispatch Provider
                  </h3>
                  {(isResendActive ? (settings.resend_api_key || settings.resend_api_key_is_set) : (settings.email_user && (settings.email_pass || settings.email_pass_is_set))) ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active ({isResendActive ? 'Resend Cloud API' : 'SMTP'})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      API Key Required
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Deliver real transactional emails using Resend REST API or standard SMTP.
                </p>
              </div>
            </div>

            {/* Provider Switcher Pills */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleChange('email_provider', 'resend')}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isResendActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Resend API (Cloud)</span>
              </button>

              <button
                type="button"
                onClick={() => handleChange('email_provider', 'smtp')}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isResendActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>SMTP (Gmail / Custom)</span>
              </button>
            </div>
          </div>

          {/* ================= RESEND API CONFIGURATION ================= */}
          {isResendActive && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Resend Top Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    R
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Resend Cloud Email API</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero SMTP timeout, instant deliverability, high inbox placement rate</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyResend}
                    disabled={verifyingResend}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm btn-lift"
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${verifyingResend ? 'animate-spin' : ''}`} />
                    <span>{verifyingResend ? 'Verifying...' : 'Verify Resend API'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingChannel === 'email'}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer btn-lift btn-send-hover"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testingChannel === 'email' ? 'Dispatching...' : 'Send Live Test Email'}</span>
                  </button>
                </div>
              </div>

              {/* Resend Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Resend API Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Resend API Key</label>
                    {settings.resend_api_key_is_set && !settings.resend_api_key && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Configured
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showResendKey ? 'text' : 'password'}
                      placeholder="re_..."
                      value={settings.resend_api_key}
                      onChange={e => handleChange('resend_api_key', e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResendKey(!showResendKey)}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Generate or view keys on <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium">resend.com/api-keys</a></p>
                </div>

                {/* Resend From Address */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Sender "From" Address</label>
                  <input
                    type="text"
                    placeholder="SmartSend AI <notifications@smartsendai.online>"
                    value={settings.resend_from}
                    onChange={e => handleChange('resend_from', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-slate-400">Default: <code className="font-mono">SmartSend AI &lt;notifications@smartsendai.online&gt;</code> (Verified GoDaddy Custom Domain), or manage domains at <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium">resend.com/domains</a>.</p>
                </div>
              </div>

              {/* Helpful Domain Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Custom Domain Active:</strong> Resend is configured to send from your custom domain <span className="font-semibold text-slate-900 dark:text-white">smartsendai.online</span>! Emails deliver reliably worldwide. If you switch senders or domains, make sure the domain is verified at <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">resend.com/domains</a>.
                </div>
              </div>
            </div>
          )}

          {/* ================= SMTP CONFIGURATION ================= */}
          {!isResendActive && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={applyGmailPreset}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>1-Click Gmail Setup</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifySmtp}
                    disabled={verifyingSmtp}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer btn-lift"
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 text-emerald-500 ${verifyingSmtp ? 'animate-spin' : ''}`} />
                    <span>{verifyingSmtp ? 'Verifying...' : 'Verify SMTP Connection'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingChannel === 'email'}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[11px] hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer btn-lift btn-send-hover"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingChannel === 'email' ? 'Dispatching...' : 'Send Real Test Email'}</span>
                </button>
              </div>

              {/* Gmail Setup Guide Accordion */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>How to connect Gmail with an App Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGmailGuide(!showGmailGuide)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {showGmailGuide ? 'Hide Instructions' : 'View Instructions'}
                  </button>
                </div>

                {showGmailGuide && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-medium">
                      ⚠️ <strong>Do NOT use your regular Gmail password:</strong> Google strictly rejects standard account passwords. You must generate a 16-character <strong>Google App Password</strong> below.
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>
                        Ensure <strong>2-Step Verification</strong> is enabled on your{' '}
                        <a
                          href="https://myaccount.google.com/security"
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-0.5"
                        >
                          Google Account Security <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>
                        Go to{' '}
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-0.5"
                        >
                          Google App Passwords <ExternalLink className="w-3 h-3" />
                        </a>
                        , create an app password named <strong>SmartSend AI</strong>.
                      </li>
                      <li>
                        Copy the 16-character code (e.g. <code>abcd efgh ijkl mnop</code>), paste it into the <strong>SMTP Password</strong> field below, and click <strong>Save Preferences</strong>.
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Host */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">SMTP Host</label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    value={settings.email_host}
                    onChange={e => handleChange('email_host', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                  />
                </div>

                {/* Port */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">SMTP Port</label>
                  <input
                    type="text"
                    placeholder="465 or 587"
                    value={settings.email_port}
                    onChange={e => handleChange('email_port', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                  />
                </div>

                {/* Username / Email */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">SMTP Username</label>
                  <input
                    type="text"
                    placeholder="you@gmail.com"
                    value={settings.email_user}
                    onChange={e => handleChange('email_user', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">SMTP Password</label>
                    {settings.email_pass_is_set && !settings.email_pass && (
                      <span className="text-[10px] text-emerald-600 font-semibold">Configured</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showEmailPass ? 'text' : 'password'}
                      placeholder={settings.email_pass_is_set ? '••••••••••••' : 'App Password'}
                      value={settings.email_pass}
                      onChange={e => handleChange('email_pass', e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPass(!showEmailPass)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showEmailPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* From Address */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">From Name / Address</label>
                  <input
                    type="text"
                    placeholder="SmartSend AI <you@gmail.com>"
                    value={settings.email_from}
                    onChange={e => handleChange('email_from', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: WhatsApp Configuration */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                WhatsApp Business API Integration
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleTestChannel('whatsapp')}
              disabled={testingChannel === 'whatsapp'}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Test WhatsApp
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Meta Access Token</label>
              <input
                type="password"
                placeholder="EAA..."
                value={settings.whatsapp_token}
                onChange={e => handleChange('whatsapp_token', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Phone Number ID</label>
              <input
                type="text"
                placeholder="10492837482910"
                value={settings.whatsapp_phone_number_id}
                onChange={e => handleChange('whatsapp_phone_number_id', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: SMS Gateway (Twilio) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                SMS Provider Configuration (Twilio Compatible)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleTestChannel('sms')}
              disabled={testingChannel === 'sms'}
              className="px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-[11px] hover:bg-purple-100 transition-colors cursor-pointer"
            >
              Test SMS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Account SID</label>
              <input
                type="text"
                placeholder="AC..."
                value={settings.sms_account_sid}
                onChange={e => handleChange('sms_account_sid', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Auth Token</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={settings.sms_auth_token}
                onChange={e => handleChange('sms_auth_token', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Sender Phone / Shortcode</label>
              <input
                type="text"
                placeholder="+15550100"
                value={settings.sms_from_number}
                onChange={e => handleChange('sms_from_number', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 6: App Default Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Default App Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Default Channel</label>
              <select
                value={settings.default_channel}
                onChange={e => handleChange('default_channel', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Default Tone</label>
              <select
                value={settings.default_tone}
                onChange={e => handleChange('default_tone', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Urgent">Urgent</option>
                <option value="Promotional">Promotional</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500">System Timezone</label>
              <select
                value={settings.timezone}
                onChange={e => handleChange('timezone', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
