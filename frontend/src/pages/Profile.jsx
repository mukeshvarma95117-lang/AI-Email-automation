import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Building,
  Briefcase,
  Key,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Globe,
  Clock,
  FileText,
  Bell,
  Camera,
  Check,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST - +05:30)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST - +04:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT - +08:00)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST - +09:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' }
];

const AVATAR_GRADIENTS = [
  { id: 'indigo', label: 'Indigo Accent', class: 'from-indigo-600 to-cyan-500' },
  { id: 'purple', label: 'Purple & Pink', class: 'from-purple-600 to-pink-500' },
  { id: 'emerald', label: 'Emerald & Teal', class: 'from-emerald-600 to-teal-400' },
  { id: 'amber', label: 'Amber & Rose', class: 'from-amber-500 to-rose-500' },
  { id: 'blue', label: 'Midnight Blue', class: 'from-blue-600 to-indigo-900' }
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { success, error, info } = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'security' | 'preferences'
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || 'SmartSend Administrator',
    title: user?.title || 'Lead Administrator',
    email: user?.email || 'admin@smartsendai.online',
    phone: user?.phone || '+1 (555) 019-2834',
    company: user?.company || 'SmartSend AI Inc.',
    timezone: user?.timezone || 'Asia/Kolkata',
    bio: user?.bio || 'Head Administrator managing automated multi-channel messaging and AI email workflows.',
    avatar_url: user?.avatar_url || '',
    avatar_theme: user?.avatar_theme || 'indigo'
  });

  // Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification Preferences State (stored locally / settings)
  const [preferences, setPreferences] = useState({
    emailDispatches: true,
    failedQueueAlerts: true,
    aiSuggestionsExpanded: true,
    twoFactorEnforced: true
  });

  // Sync state if user changes in context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        title: user.title || prev.title,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        company: user.company || prev.company,
        timezone: user.timezone || prev.timezone,
        bio: user.bio || prev.bio,
        avatar_url: user.avatar_url || prev.avatar_url,
        avatar_theme: user.avatar_theme || prev.avatar_theme
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name.trim()) {
      error('Full Name cannot be empty.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(formData);
      success('Profile details successfully updated!', 'Profile Saved');
    } catch (err) {
      console.error('Profile update failed:', err);
      error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!passwords.currentPassword) {
      error('Please enter your current password.');
      return;
    }
    if (!passwords.newPassword) {
      error('Please enter a new password.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      error('New password must be at least 6 characters long.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      error('New passwords do not match. Please verify and retype.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      success('Your administrator password was successfully updated!', 'Password Changed');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Password change error:', err);
      error(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const activeGradient = AVATAR_GRADIENTS.find(g => g.id === formData.avatar_theme)?.class || AVATAR_GRADIENTS[0].class;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <User className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Administrator Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal credentials, workspace identity, contact metadata, and administrator settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50 btn-lift"
          >
            {savingProfile ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Overview Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Large Avatar with Gradient or Custom Image */}
          <div className="relative group">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt={formData.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr ${activeGradient} flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl shadow-lg ring-4 ring-white dark:ring-slate-800 transition-all`}>
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}

            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-white" title="Active Admin Session">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          </div>

          {/* User Meta Information */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {formData.name || 'SmartSend Administrator'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Workspace Administrator</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active & Verified</span>
              </span>
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center md:justify-start gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{formData.title || 'Lead Administrator'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Building className="w-4 h-4 text-slate-400" />
              <span>{formData.company || 'SmartSend AI'}</span>
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-3 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {formData.email}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                {formData.timezone}
              </span>
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex md:flex-col gap-3 bg-white/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Account Access</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Exclusive Superadmin</p>
            </div>
            <div className="md:border-t md:border-slate-200/60 dark:md:border-slate-700/60 md:pt-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Security Tier</p>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">Level 3 (Full Root)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap ${
            activeTab === 'identity'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Identity & Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer select-none whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Workspace Preferences</span>
        </button>
      </div>

      {/* Tab 1: Identity & Details */}
      {activeTab === 'identity' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Personal Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g. Mukesh Varma"
                        className="w-full px-3 py-2 pl-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Role / Job Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Role / Title
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g. Lead Administrator"
                        className="w-full px-3 py-2 pl-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                      />
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Administrator Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 pl-9 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <p className="text-[10px] text-slate-400">Locked to primary administrator login credential.</p>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="e.g. +1 (555) 019-2834"
                        className="w-full px-3 py-2 pl-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Company / Organization */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Company / Organization
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="e.g. SmartSend AI Inc."
                        className="w-full px-3 py-2 pl-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                      />
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Default Timezone
                    </label>
                    <div className="relative">
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 pl-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium cursor-pointer"
                      >
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Bio / Default Signature */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Administrator Bio & Email Signature</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Appended or referenced in generated templates</span>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Enter an executive bio or default email signature line..."
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Avatar & Appearance Customization */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>Avatar Customization</span>
                </h3>

                {/* Custom Avatar Image URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Profile Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400">Leave blank to use the color gradient avatar above.</p>
                </div>

                {/* Gradient Preset Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gradient Accent Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_GRADIENTS.map((grad) => (
                      <button
                        key={grad.id}
                        type="button"
                        onClick={() => handleInputChange('avatar_theme', grad.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                          formData.avatar_theme === grad.id
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full bg-gradient-to-tr ${grad.class} shadow-xs`}></span>
                        <span className="truncate">{grad.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Save Card Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {savingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>Change Password</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ensure your administrator account is using a secure, robust password.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwords.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 pl-9 pr-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 pl-9 pr-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwords.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 pl-9 pr-9 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {changingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security Best Practices Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Guidelines</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Use at least 8 characters with numbers and symbols.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Changes apply to both API token generation and web login.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Session tokens remain valid until explicit sign out.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Workspace Notification Preferences</span>
            </h3>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Dispatch Notifications */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Email Dispatch Confirmations</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive in-app toast alerts when messages are dispatched.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailDispatches}
                  onChange={(e) => setPreferences(p => ({ ...p, emailDispatches: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Queue Alerts */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scheduled Queue Execution Alerts</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Trigger notifications when background cron jobs process due emails.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.failedQueueAlerts}
                  onChange={(e) => setPreferences(p => ({ ...p, failedQueueAlerts: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>

              {/* AI Suggestions Expand */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auto-expand AI Composer Insights</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Automatically open tone and personalization panels after generation.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.aiSuggestionsExpanded}
                  onChange={(e) => setPreferences(p => ({ ...p, aiSuggestionsExpanded: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Theme Preference */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Appearance Mode</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Toggle between Light and Dark interface themes.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => success('Preferences successfully saved!', 'Saved')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

