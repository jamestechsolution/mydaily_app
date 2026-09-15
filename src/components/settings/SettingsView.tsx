import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Clock,
  Palette,
  Database,
  Save,
  Download,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWork } from '../../context/WorkContext';

export const SettingsView: React.FC = () => {
  const { user, profile, updateUserProfile } = useAuth();
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { categories, addCategory, tasks, projects, reminders, reports, notes } = useWork();

  // Profile form
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(user?.email || profile?.email || '');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');

  // Sync state if profile loads asynchronously
  React.useEffect(() => {
    if (profile?.name && !name) setName(profile.name);
    if (user?.email && !email) setEmail(user.email);
    else if (profile?.email && !email) setEmail(profile.email);
  }, [profile, user]);

  // Work preferences
  const [workStartTime, setWorkStartTime] = useState(profile?.workPreferences?.workStartTime || '09:00');
  const [workEndTime, setWorkEndTime] = useState(profile?.workPreferences?.workEndTime || '17:00');
  const [dailyTaskGoal, setDailyTaskGoal] = useState(profile?.workPreferences?.dailyTaskGoal || 5);
  const [weeklyHoursTarget, setWeeklyHoursTarget] = useState(profile?.workPreferences?.weeklyHoursTarget || 40);

  // Notification preferences
  const [soundEnabled, setSoundEnabled] = useState(profile?.notificationPreferences?.soundEnabled ?? true);
  const [dailyDigest, setDailyDigest] = useState(profile?.notificationPreferences?.dailyDigest ?? true);
  const [weeklyReport, setWeeklyReport] = useState(profile?.notificationPreferences?.weeklyReport ?? true);
  const [browserNotifs, setBrowserNotifs] = useState(profile?.notificationPreferences?.browser ?? true);

  // Category creation
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = () => {
    updateUserProfile({
      name,
      workPreferences: {
        workStartTime,
        workEndTime,
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        dailyTaskGoal: Number(dailyTaskGoal),
        weeklyHoursTarget: Number(weeklyHoursTarget),
      },
      notificationPreferences: {
        browser: browserNotifs,
        inApp: true,
        email: false,
        dailyDigest,
        weeklyReport,
        soundEnabled,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory({
      name: newCatName.trim(),
      color: newCatColor,
    });
    setNewCatName('');
  };

  const handleExportFullBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      user: profile,
      tasks,
      projects,
      reminders,
      reports,
      notes,
      categories,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DailyWorkManager_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="settings-view" className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Account & Workspace Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalize your workflow schedule, audio chimes, notifications, and data persistence
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{savedSuccess ? 'Saved Preferences!' : 'Save Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Workspace preferences updated and synced across sessions.</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span>User Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Your email"
              disabled
              value={email}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Title / Role
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company / Team
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering Team"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Work Preferences & Capacity Targets */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Work Hours & Targets</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Standard Shift Start Time
            </label>
            <input
              type="time"
              value={workStartTime}
              onChange={(e) => setWorkStartTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Standard Shift End Time
            </label>
            <input
              type="time"
              value={workEndTime}
              onChange={(e) => setWorkEndTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Task Goal
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={dailyTaskGoal}
              onChange={(e) => setDailyTaskGoal(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Weekly Target Hours
            </label>
            <input
              type="number"
              min="10"
              max="80"
              value={weeklyHoursTarget}
              onChange={(e) => setWeeklyHoursTarget(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notifications & Audio Tone Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Notification & Audio Routine</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Audio Chimes on Reminders & Completed Tasks
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Play a gentle pleasant Web Audio harmonic chime when reminders trigger
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Morning Plan Notification (09:00 AM)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Deliver daily schedule overview and priorities upon workspace launch
              </span>
            </div>
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Evening Daily Report Prompt (17:00 PM)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Prompt to auto-compile your daily accomplishments before closing work
              </span>
            </div>
            <input
              type="checkbox"
              checked={weeklyReport}
              onChange={(e) => setWeeklyReport(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
          </label>
        </div>
      </div>

      {/* Theme Appearance */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-500" />
          <span>Interface Appearance</span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <span className="text-xs">Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
            <span className="text-xs">Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-center transition-all ${
              theme === 'system'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <SettingsIcon className="w-5 h-5 mx-auto mb-1 text-slate-400" />
            <span className="text-xs">System</span>
          </button>
        </div>
      </div>

      {/* Database Backup & Export */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Database & Backup Storage</span>
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your workspace records are synced in real-time with Google Cloud Firestore and locally cached for instant offline loading. You can download a complete offline JSON snapshot at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportFullBackup}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Database (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
