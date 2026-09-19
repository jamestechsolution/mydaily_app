import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCheck,
  Volume2,
  VolumeX,
  ShieldCheck,
  Trash2,
  Info,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useAuth } from '../../context/AuthContext';
import { getTodayDateString, formatDateLong, formatTime12h, isTaskOverdue } from '../../utils/dateUtils';

export const NotificationsView: React.FC = () => {
  const {
    tasks,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setActiveTab,
  } = useWork();
  const { profile, updateUserProfile } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'due' | 'overdue' | 'completed' | 'reminders'>('all');
  const [browserPermissionStatus, setBrowserPermissionStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const todayStr = getTodayDateString();

  // Dynamic status-categorized tasks
  const dueTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr && t.status !== 'Completed');
  }, [tasks, todayStr]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => isTaskOverdue(t.dueDate, t.dueTime, t.status));
  }, [tasks]);

  const completedTodayTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'Completed' && (t.dueDate === todayStr || t.updatedAt?.startsWith(todayStr)));
  }, [tasks, todayStr]);

  const upcomingReminders = useMemo(() => {
    return tasks.filter((t) => t.reminder?.enabled && t.status !== 'Completed');
  }, [tasks]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserPermissionStatus(permission);
        if (permission === 'granted') {
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
              browser: true,
            },
          });
        }
      } catch (err) {
        console.warn('Error requesting notification permission', err);
      }
    }
  };

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
    <div id="notifications-page" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Notification Center</span>
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight mt-1">
            Activity & Reminders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time feed of due items, overdue deadlines, and scheduled task notifications.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleSound}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Chime Active' : 'Muted'}</span>
          </button>

          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsAsRead}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-indigo-500" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={clearAllNotifications}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Browser Notification Opt-In Card (Polite & Explicit, Never Forced!) */}
      {browserPermissionStatus !== 'granted' && browserPermissionStatus !== 'unsupported' && (
        <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                Enable Native Browser Notifications
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive instant reminder alerts on desktop and mobile even when the browser tab is minimized.
              </p>
            </div>
          </div>
          <button
            onClick={handleRequestBrowserPermission}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all shrink-0"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Overview Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveFilter('due')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'due'
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Due Today</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {dueTasks.length}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('overdue')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'overdue'
              ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 ring-2 ring-rose-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {overdueTasks.length}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('reminders')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'reminders'
              ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 ring-2 ring-indigo-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reminders</span>
            <Bell className="w-4 h-4" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {upcomingReminders.length}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('completed')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'completed'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            {completedTodayTasks.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'due', label: 'Due Today' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'reminders', label: 'Reminders' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Feed */}
      <div className="space-y-3">
        {/* Render Overdue Tasks if filter matches */}
        {(activeFilter === 'all' || activeFilter === 'overdue') && overdueTasks.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 px-1 block">
              Overdue Tasks ({overdueTasks.length})
            </span>
            {overdueTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{t.title}</h4>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400">
                      Due date was {t.dueDate} {t.dueTime ? `at ${formatTime12h(t.dueTime)}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('today')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render Due Today Tasks */}
        {(activeFilter === 'all' || activeFilter === 'due') && dueTasks.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 px-1 block">
              Due Today ({dueTasks.length})
            </span>
            {dueTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{t.title}</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Scheduled today {t.dueTime ? `at ${formatTime12h(t.dueTime)}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('today')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render In-App Notifications List */}
        {(activeFilter === 'all' || activeFilter === 'reminders') && notifications.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 block">
              Alerts & Notifications
            </span>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer text-xs ${
                  !n.read
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                      {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {overdueTasks.length === 0 && dueTasks.length === 0 && notifications.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
              You're all caught up!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              No overdue items or pending alerts. Continue working productively through your schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
