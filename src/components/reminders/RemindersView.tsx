import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Volume2,
  Calendar,
  AlertCircle,
  Repeat,
  Check,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ReminderModal } from './ReminderModal';
import { playReminderChime } from '../../lib/audio';

export const RemindersView: React.FC = () => {
  const {
    reminders,
    tasks,
    deleteReminder,
    completeReminder,
    setIsReminderModalOpen,
    requestNotificationPermission,
    notificationPermission,
  } = useWork();

  const todayStr = '2026-09-15';
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  const todayReminders = activeReminders.filter((r) => r.remindAt.startsWith(todayStr));
  const upcomingReminders = activeReminders.filter((r) => !r.remindAt.startsWith(todayStr));

  const handleTestChime = () => {
    playReminderChime();
  };

  return (
    <div id="reminders-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Reminders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Never miss a meeting, deadline, or workflow routine with multi-channel alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestChime}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Play test audio chime"
          >
            <Volume2 className="w-4 h-4" />
            <span>Test Chime</span>
          </button>

          <button
            id="create-reminder-btn"
            onClick={() => {
              setEditingReminderId(null);
              setIsReminderModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Permission helper if not granted */}
      {notificationPermission !== 'granted' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Browser notifications are currently {notificationPermission}. Enable them to receive background reminders when this tab isn't active.
            </span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Today's Reminders */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>Today's Reminders ({todayReminders.length})</span>
        </h3>

        {todayReminders.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No active reminders scheduled for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayReminders.map((rem) => {
              const linkedTask = rem.taskId ? tasks.find((t) => t.id === rem.taskId) : null;
              return (
                <div
                  key={rem.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 truncate">
                    <button
                      onClick={() => completeReminder(rem.id)}
                      className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center text-transparent hover:text-emerald-500 transition-colors mt-0.5 shrink-0"
                      title="Mark reminder as completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {rem.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(rem.remindAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{rem.recurrence}</span>
                        <span>•</span>
                        <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 font-semibold">
                          {rem.channel}
                        </span>
                      </div>
                      {linkedTask && (
                        <p className="text-[10px] text-slate-400 truncate mt-1">
                          Linked to: {linkedTask.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingReminderId(rem.id);
                        setIsReminderModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Reminders */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>Upcoming Reminders ({upcomingReminders.length})</span>
        </h3>

        {upcomingReminders.length === 0 ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No future reminders queued.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingReminders.map((rem) => (
              <div
                key={rem.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 truncate">
                  <button
                    onClick={() => completeReminder(rem.id)}
                    className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center text-transparent hover:text-emerald-500 transition-colors mt-0.5 shrink-0"
                    title="Mark reminder as completed"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {rem.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(rem.remindAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(rem.remindAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{rem.recurrence}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingReminderId(rem.id);
                      setIsReminderModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Reminders Archive */}
      {completedReminders.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Completed Reminders ({completedReminders.length})</span>
          </h3>

          <div className="space-y-2 opacity-75">
            {completedReminders.map((rem) => (
              <div
                key={rem.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="line-through text-slate-500">{rem.title}</span>
                </div>
                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <ReminderModal
        editingReminderId={editingReminderId}
        onClose={() => setEditingReminderId(null)}
      />
    </div>
  );
};
