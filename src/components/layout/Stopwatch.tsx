import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  CheckCircle2,
  ChevronDown,
  Timer,
  X,
  Sparkles,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useTaskStopwatch } from '../../hooks/useTaskStopwatch';
import { Priority, TaskItem } from '../../types';

export const Stopwatch: React.FC = () => {
  const { tasks, setIsTaskModalOpen } = useWork();
  const {
    stopwatch,
    activeTask,
    isRunning,
    isPaused,
    isIdle,
    formattedTime,
    hours,
    minutes,
    seconds,
    start,
    pause,
    resume,
    stop,
    reset,
    selectTask,
  } = useTaskStopwatch();

  const [isOpen, setIsOpen] = useState(false);
  const [markCompleteOnStop, setMarkCompleteOnStop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Tasks available to track (non-completed tasks)
  const availableTasks = tasks.filter(
    (t) =>
      t.status !== 'Completed' &&
      (searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Stop the timer and link active time to the 'Actual Time' field of the task
  const handleStopAndSave = async () => {
    const res = await stop(markCompleteOnStop);
    if (res) {
      setNotificationBanner(`Logged +${res.minutesSaved}m Actual Time to "${res.taskTitle}"`);
      setTimeout(() => setNotificationBanner(null), 4000);
    }
    setIsOpen(false);
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch (p) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
      case 'High':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Stopwatch Pill Widget with Pulse Animations and HH:MM:SS */}
      <div
        id="header-stopwatch-widget"
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-300 select-none cursor-pointer ${
          isRunning
            ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 dark:border-emerald-700/60 shadow-xs ring-2 ring-emerald-500/20 dark:ring-emerald-500/20'
            : isPaused
            ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 dark:border-amber-700/60'
            : 'bg-slate-100/90 dark:bg-slate-800/80 border-slate-200 dark:border-slate-750 hover:bg-slate-200/70 dark:hover:bg-slate-750'
        }`}
        title="Stopwatch • Track Actual Time on Tasks"
      >
        {/* Subtle Pulse Animation Aura when actively running */}
        {isRunning && (
          <span className="absolute -inset-0.5 rounded-2xl bg-emerald-500/15 dark:bg-emerald-400/10 animate-pulse pointer-events-none" />
        )}

        {/* Live Status Icon / Pulsing Beacon */}
        <div className="relative flex items-center justify-center shrink-0">
          {isRunning ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm" />
            </span>
          ) : isPaused ? (
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          ) : (
            <Timer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform group-hover:scale-110" />
          )}
        </div>

        {/* HH:MM:SS Digital Time Display with Smooth Monospace Transition */}
        <div
          id="stopwatch-display-hhmmss"
          className={`font-mono font-bold text-xs tracking-wider tabular-nums transition-colors duration-200 flex items-center ${
            isRunning
              ? 'text-emerald-700 dark:text-emerald-300'
              : isPaused
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="transition-all duration-150">{hours}</span>
          <span className={`mx-0.5 ${isRunning ? 'animate-pulse text-emerald-500' : 'text-slate-400'}`}>
            :
          </span>
          <span className="transition-all duration-150">{minutes}</span>
          <span className={`mx-0.5 ${isRunning ? 'animate-pulse text-emerald-500' : 'text-slate-400'}`}>
            :
          </span>
          <span className="transition-all duration-150">{seconds}</span>
        </div>

        {/* Truncated Active Task Title or "Actual Time" */}
        <span className="hidden lg:inline-block max-w-[120px] truncate text-[11px] font-medium text-slate-600 dark:text-slate-400">
          {activeTask ? activeTask.title : 'Actual Time'}
        </span>

        {/* Direct Action Controls inside the header pill */}
        {isRunning ? (
          <button
            id="stopwatch-quick-pause"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              pause();
            }}
            className="p-1 rounded-lg hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-colors"
            title="Pause stopwatch"
          >
            <Pause className="w-3 h-3" />
          </button>
        ) : isPaused ? (
          <button
            id="stopwatch-quick-resume"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resume();
            }}
            className="p-1 rounded-lg hover:bg-amber-200/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 transition-colors"
            title="Resume stopwatch"
          >
            <Play className="w-3 h-3 fill-current" />
          </button>
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        )}

        {/* Direct Stop & Link to Actual Time Button */}
        {!isIdle && (
          <button
            id="stopwatch-quick-stop"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStopAndSave();
            }}
            className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors"
            title="Stop & Log Time to Task's Actual Time"
          >
            <Square className="w-2.5 h-2.5 fill-current" />
          </button>
        )}
      </div>

      {/* Floating Detailed Stopwatch Panel / Popover */}
      {isOpen && (
        <div
          id="stopwatch-full-popover"
          className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Task Stopwatch
                </h4>
                <p className="text-[10px] text-slate-400">
                  Track actual time worked and link directly to task
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Banner when Actual Time is linked */}
          {notificationBanner && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="font-medium">{notificationBanner}</span>
            </div>
          )}

          {/* Big Digital Clock Card with Pulse Indicator */}
          <div className="relative overflow-hidden py-5 px-4 bg-slate-50 dark:bg-slate-850/70 rounded-2xl border border-slate-100 dark:border-slate-800 text-center mb-4">
            {isRunning && (
              <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Recording</span>
              </div>
            )}

            {/* HH:MM:SS with split transitions */}
            <div className="text-4xl sm:text-5xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wider tabular-nums flex items-center justify-center">
              <span className="px-1">{hours}</span>
              <span className={`text-slate-300 dark:text-slate-600 ${isRunning ? 'animate-pulse text-emerald-500' : ''}`}>
                :
              </span>
              <span className="px-1">{minutes}</span>
              <span className={`text-slate-300 dark:text-slate-600 ${isRunning ? 'animate-pulse text-emerald-500' : ''}`}>
                :
              </span>
              <span className="px-1 text-indigo-600 dark:text-indigo-400">{seconds}</span>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isRunning
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-400/40'
                    : isPaused
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 ring-1 ring-amber-400/40'
                    : 'bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isRunning ? 'Active Running' : isPaused ? 'Paused' : 'Ready'}
              </span>
              {stopwatch.elapsedSeconds > 0 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  ≈ {Math.max(1, Math.round(stopwatch.elapsedSeconds / 60))} min(s) to add
                </span>
              )}
            </div>
          </div>

          {/* Core Controls: Start, Stop, Pause, Resume, Reset */}
          <div className="flex items-center gap-2 mb-4">
            {isRunning ? (
              <button
                id="stopwatch-control-pause"
                onClick={pause}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : isPaused ? (
              <button
                id="stopwatch-control-resume"
                onClick={resume}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                id="stopwatch-control-start"
                onClick={() => start()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Timer</span>
              </button>
            )}

            {!isIdle && (
              <button
                id="stopwatch-control-stop"
                onClick={handleStopAndSave}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                title="Stop and save actual time to task"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Save</span>
              </button>
            )}

            {!isIdle && (
              <button
                id="stopwatch-control-reset"
                onClick={reset}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset stopwatch time to 00:00:00 without saving"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Checkbox: Mark completed when saving */}
          {!isIdle && activeTask && (
            <label className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={markCompleteOnStop}
                onChange={(e) => setMarkCompleteOnStop(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                Mark "{activeTask.title}" as Completed on stop
              </span>
            </label>
          )}

          {/* Active Target Task Card */}
          {activeTask ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 mb-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Target Task
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadgeColor(
                    activeTask.priority
                  )}`}
                >
                  {activeTask.priority}
                </span>
              </div>
              <h5 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                {activeTask.title}
              </h5>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-indigo-100/70 dark:border-indigo-900/40">
                <span>
                  Estimated: <strong>{activeTask.estimatedMinutes}m</strong>
                </span>
                <span>
                  Current Actual:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {activeTask.actualMinutes || 0}m
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-300 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Select an active task below to link tracked time directly to it.</span>
            </div>
          )}

          {/* Task Selector & Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Active Task
              </label>
              {activeTask && (
                <button
                  type="button"
                  onClick={() => selectTask(null)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Deselect
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Filter active tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {availableTasks.length > 0 ? (
                availableTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      selectTask(t.id);
                      if (isIdle) {
                        start(t.id);
                      }
                    }}
                    className={`p-2 rounded-xl text-left transition-colors cursor-pointer flex items-center justify-between gap-2 text-xs border ${
                      stopwatch.taskId === t.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                        : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Est: {t.estimatedMinutes}m</span>
                        <span>•</span>
                        <span>Act: {t.actualMinutes || 0}m</span>
                      </div>
                    </div>
                    {stopwatch.taskId === t.id && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-slate-400 text-xs">
                  No active tasks found.{' '}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsTaskModalOpen(true);
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Create one
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
