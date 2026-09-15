import React from 'react';
import { Bell, Check, Trash2, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { useWork } from '../../context/WorkContext';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    reminders,
    setActiveTab,
  } = useWork();

  const activeReminders = reminders.filter((r) => !r.isCompleted);

  return (
    <div
      id="notification-center-dropdown"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Notifications & Reminders
          </h3>
        </div>
        {notifications.length > 0 && (
          <button
            id="clear-all-notifs-btn"
            onClick={clearAllNotifications}
            className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto px-3 py-2 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin">
        {/* Active reminders overview */}
        {activeReminders.length > 0 && (
          <div className="pb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              Upcoming ({activeReminders.length})
            </span>
            <div className="space-y-1.5">
              {activeReminders.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-semibold text-amber-900 dark:text-amber-200 truncate">
                      {r.title}
                    </p>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(r.remindAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('reminders');
                      onClose();
                    }}
                    className="text-amber-600 dark:text-amber-400 hover:underline text-[11px] shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time notification logs */}
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Bell className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
            No new alerts or missed reminders.
          </div>
        ) : (
          <div className="pt-2 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              Recent Alerts
            </span>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-2.5 rounded-xl border transition-all text-xs flex items-start justify-between gap-2 ${
                  notif.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200'
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold">{notif.title}</p>
                  <p className="text-[11px] opacity-85 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] opacity-60 mt-1 block font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="p-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
        <button
          onClick={() => {
            setActiveTab('reminders');
            onClose();
          }}
          className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
        >
          <span>Open Reminder Hub</span>
          <ExternalLink className="w-3 h-3" />
        </button>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          Close
        </button>
      </div>
    </div>
  );
};
