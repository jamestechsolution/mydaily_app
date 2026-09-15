import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ReminderRecurrence, ReminderChannel } from '../../types';

interface ReminderModalProps {
  editingReminderId?: string | null;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ editingReminderId, onClose }) => {
  const {
    isReminderModalOpen,
    setIsReminderModalOpen,
    reminders,
    tasks,
    addReminder,
    updateReminder,
    requestNotificationPermission,
    notificationPermission,
  } = useWork();

  const todayStr = '2026-09-15';
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('14:00');
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>('one-time');
  const [channel, setChannel] = useState<ReminderChannel>('all');
  const [taskId, setTaskId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingReminderId) {
      const rem = reminders.find((r) => r.id === editingReminderId);
      if (rem) {
        setTitle(rem.title);
        const [d, t] = rem.remindAt.includes('T') ? rem.remindAt.split('T') : [rem.remindAt.split(' ')[0], '14:00'];
        setDate(d || todayStr);
        setTime(t ? t.slice(0, 5) : '14:00');
        setRecurrence(rem.recurrence);
        setChannel(rem.channel);
        setTaskId(rem.taskId || '');
        setNotes(rem.notes || '');
      }
    } else {
      setTitle('');
      setDate(todayStr);
      setTime('14:00');
      setRecurrence('one-time');
      setChannel('all');
      setTaskId('');
      setNotes('');
      setError('');
    }
  }, [editingReminderId, isReminderModalOpen, reminders]);

  if (!isReminderModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a reminder title.');
      return;
    }

    // If channel requires browser notifications, prompt permission if needed
    if ((channel === 'browser' || channel === 'all') && notificationPermission !== 'granted') {
      await requestNotificationPermission();
    }

    const remindAt = `${date}T${time}:00`;

    if (editingReminderId) {
      await updateReminder(editingReminderId, {
        title: title.trim(),
        remindAt,
        recurrence,
        channel,
        taskId: taskId || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addReminder({
        title: title.trim(),
        remindAt,
        recurrence,
        channel,
        taskId: taskId || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setIsReminderModalOpen(false);
    onClose();
  };

  return (
    <div
      id="reminder-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => {
        setIsReminderModalOpen(false);
        onClose();
      }}
    >
      <div
        id="reminder-modal-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingReminderId ? 'Edit Reminder' : 'Set Reminder'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsReminderModalOpen(false);
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reminder Title *
            </label>
            <input
              type="text"
              required
              placeholder='e.g. "Work on website", "Follow up with client"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as ReminderRecurrence)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              >
                <option value="one-time">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ReminderChannel)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              >
                <option value="all">All Channels (In-App + Browser)</option>
                <option value="in-app">In-App Notification Only</option>
                <option value="browser">Browser Push Notification</option>
                <option value="email">Email Notification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link to Work Item (Optional)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="">None (Independent Reminder)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reminder Notes
            </label>
            <textarea
              rows={2}
              placeholder="Checklist, links, or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsReminderModalOpen(false);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
            >
              {editingReminderId ? 'Save Reminder' : 'Set Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
