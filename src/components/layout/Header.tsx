import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Menu,
  CheckCircle2,
  Calendar,
  FolderPlus,
  FilePlus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../common/NotificationCenter';
import { Stopwatch } from './Stopwatch';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { OfflineSyncBar } from '../common/OfflineSyncBar';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  openAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, openAuthModal }) => {
  const {
    notifications,
    setIsSearchModalOpen,
    setIsTaskModalOpen,
    setIsReminderModalOpen,
    setIsProjectModalOpen,
    setIsAiModalOpen,
    setActiveTab,
    setEditingTaskId,
  } = useWork();

  const { effectiveTheme, toggleTheme } = useTheme();
  const { user, profile, updateUserProfile } = useAuth();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('Tuesday, September 15, 2026');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const soundEnabled = profile?.notificationPreferences?.soundEnabled ?? true;

  const toggleSound = () => {
    updateUserProfile({
      notificationPreferences: {
        ...(profile?.notificationPreferences || {
          browser: true,
          inApp: true,
          email: false,
          dailyDigest: true,
          weeklyReport: true,
          soundEnabled: true,
        }),
        soundEnabled: !soundEnabled,
      },
    });
  };

  return (
    <header
      id="main-header"
      className="h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Left side: Mobile menu & Date/Clock */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
            {currentDate}
          </span>
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-medium">
            {currentTime || '09:00:00 AM'}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <button
          id="header-search-trigger"
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-normal transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search tasks, projects, notes...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Stopwatch & Action Controls */}
      <div className="flex items-center gap-2">
        {/* Offline Caching & Cloud Synchronization Indicator */}
        <OfflineSyncBar />

        {/* Persistent Task Stopwatch with HH:MM:SS and Pulse Animation */}
        <Stopwatch />

        {/* PWA Install Button */}
        <PWAInstallButton compact={true} />

        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            id="quick-add-btn"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {showQuickAdd && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onClick={() => setShowQuickAdd(false)}
            >
              <button
                id="quick-add-task-btn"
                onClick={() => {
                  setEditingTaskId(null);
                  setIsTaskModalOpen(true);
                }}
                className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                <span>New Work Item</span>
              </button>
              <button
                id="quick-add-reminder-btn"
                onClick={() => setIsReminderModalOpen(true)}
                className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Create Reminder</span>
              </button>
              <button
                id="quick-add-project-btn"
                onClick={() => setIsProjectModalOpen(true)}
                className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <FolderPlus className="w-4 h-4 text-emerald-500" />
                <span>Create Project</span>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
              <button
                id="quick-add-report-btn"
                onClick={() => setActiveTab('daily-reports')}
                className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <FilePlus className="w-4 h-4 text-blue-500" />
                <span>Create Daily Report</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          id="header-ai-btn"
          onClick={() => setIsAiModalOpen(true)}
          className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          title="Open AI Work Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          id="header-sound-btn"
          onClick={toggleSound}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={soundEnabled ? 'Chime sound enabled' : 'Sound muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {effectiveTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
