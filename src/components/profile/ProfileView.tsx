import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Globe,
  Bell,
  Sun,
  Moon,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Shield,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

const TIMEZONES = [
  'UTC',
  'America/New_York (EST)',
  'America/Chicago (CST)',
  'America/Denver (MST)',
  'America/Los_Angeles (PST)',
  'Europe/London (GMT/BST)',
  'Europe/Paris (CET)',
  'Asia/Tokyo (JST)',
  'Asia/Dubai (GST)',
  'Asia/Kolkata (IST)',
  'Australia/Sydney (AEST)',
];

export const ProfileView: React.FC = () => {
  const { user, profile, updateUserProfile, resetPassword } = useAuth();
  const { theme, setTheme, effectiveTheme } = useTheme();

  const [name, setName] = useState(profile?.name || user?.displayName || 'Productivity User');
  const [email] = useState(profile?.email || user?.email || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'America/Los_Angeles (PST)');

  // Notification preferences
  const [browserNotifs, setBrowserNotifs] = useState(profile?.notificationPreferences?.browser ?? true);
  const [inAppNotifs, setInAppNotifs] = useState(profile?.notificationPreferences?.inApp ?? true);
  const [soundEnabled, setSoundEnabled] = useState(profile?.notificationPreferences?.soundEnabled ?? true);
  const [dailyDigest, setDailyDigest] = useState(profile?.notificationPreferences?.dailyDigest ?? true);

  // Password reset section
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      await updateUserProfile({
        name: name.trim(),
        avatar,
        timezone,
        notificationPreferences: {
          browser: browserNotifs,
          inApp: inAppNotifs,
          email: false,
          dailyDigest,
          weeklyReport: true,
          soundEnabled,
        },
      });
      setMessage({ type: 'success', text: 'Profile details successfully updated.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'No email address registered for this account.' });
      return;
    }
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage({
        type: 'success',
        text: `A password reset link has been dispatched to ${email}.`,
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Unable to send password reset email.',
      });
    }
  };

  return (
    <div id="user-profile-page" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Account Settings</span>
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight mt-1">
            User Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal credentials, timezone preferences, sound effects, and notifications.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card & Avatar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] border-b border-slate-100 dark:border-slate-800 pb-3">
            Personal Information
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-2xl border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden shadow-sm">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 rounded-2xl overflow-hidden border-2 transition-all ${
                      avatar === url
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="profile-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="profile-email-input"
                  value={email}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Primary Timezone
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  id="profile-timezone-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Visual Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'system', label: 'System' },
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      theme === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Audio Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] border-b border-slate-100 dark:border-slate-800 pb-3">
            Notification Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Chime Audio Effects
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Play completion sound chime upon finishing tasks
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  In-App Banners
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Display real-time notification alerts in header
                </span>
              </div>
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={(e) => setInAppNotifs(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Browser Notifications
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send native OS alerts when deadlines approach
                </span>
              </div>
              <input
                type="checkbox"
                checked={browserNotifs}
                onChange={(e) => setBrowserNotifs(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Daily Work Summary
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Compile daily progress and completion reports
                </span>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Security & Password Reset */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                Account Security & Password
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Passwords are encrypted and never stored in plain text.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePasswordReset}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 transition-colors"
            >
              Send Reset Link
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="profile-save-btn"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
