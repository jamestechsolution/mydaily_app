import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { Priority } from '../../types';

export const StopwatchWidget: React.FC = () => {
  const {
    tasks,
    stopwatch,
    activeStopwatchTask,
    startStopwatch,
    pauseStopwatch,
    resumeStopwatch,
    stopAndSaveStopwatch,
    resetStopwatch,
    selectStopwatchTask,
    setIsTaskModalOpen,
  } = useWork();

  const [isOpen, setIsOpen] = useState(false);
  const [markCompleteOnStop, setMarkCompleteOnStop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter pending/in-progress tasks for the selector
  const availableTasks = tasks.filter(
    (t) =>
      t.status !== 'Completed' &&
      (searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStopAndSave = async () => {
    const res = await stopAndSaveStopwatch(markCompleteOnStop);
    if (res) {
      setSavedBanner(`Logged ${res.minutesSaved}m to "${res.taskTitle}"`);
      setTimeout(() => setSavedBanner(null), 3500);
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
      {/* Header Pill Trigger */}
      <div
        id="stopwatch-pill-trigger"
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border transition-all select-none cursor-pointer ${
          stopwatch.status === 'running'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
            : stopwatch.status === 'paused'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80'
            : 'bg-slate-100/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-750 hover:bg-slate-200/60 dark:hover:bg-slate-750'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="Task Stopwatch & Actual Time Tracker"
      >
        {/* Status indicator / Icon */}
        <div className="relative flex items-center justify-center">
          {stopwatch.status === 'running' ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          ) : stopwatch.status === 'paused' ? (
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          ) : (
            <Timer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          )}
        </div>

        {/* Formatted Timer Display */}
        <span
          className={`font-mono font-bold text-xs tabular-nums tracking-tight ${
            stopwatch.status === 'running'
              ? 'text-emerald-700 dark:text-emerald-400'
              : stopwatch.status === 'paused'
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {formatTime(stopwatch.elapsedSeconds)}
        </span>

        {/* Truncated Task Title or "Stopwatch" */}
        <span className="hidden xl:inline-block max-w-[110px] truncate text-[11px] font-medium text-slate-600 dark:text-slate-400">
          {activeStopwatchTask ? activeStopwatchTask.title : 'Actual Time'}
        </span>

        {/* Inline Quick Play / Pause Button */}
        {stopwatch.status === 'running' ? (
          <button
            id="stopwatch-inline-pause-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              pauseStopwatch();
            }}
            className="p-1 rounded-lg hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-colors"
            title="Pause stopwatch"
          >
            <Pause className="w-3 h-3" />
          </button>
        ) : stopwatch.status === 'paused' ? (
          <button
            id="stopwatch-inline-resume-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resumeStopwatch();
            }}
            className="p-1 rounded-lg hover:bg-amber-200/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 transition-colors"
            title="Resume stopwatch"
          >
            <Play className="w-3 h-3 fill-current" />
          </button>
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-400" />
        )}

        {/* Inline Quick Stop/Save Button if timer has time */}
        {stopwatch.status !== 'idle' && (
          <button
            id="stopwatch-inline-save-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStopAndSave();
            }}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Stop & Log Time to Task"
          >
            <Square className="w-2.5 h-2.5 fill-current text-rose-500" />
          </button>
        )}
      </div>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          id="stopwatch-popover-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Task Stopwatch
                </h4>
                <p className="text-[10px] text-slate-400">
                  Track actual time worked and sync with reports
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner notification if time was just saved */}
          {savedBanner && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{savedBanner}</span>
            </div>
          )}

          {/* Big Digital Clock Display */}
          <div className="text-center py-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
              {formatTime(stopwatch.elapsedSeconds)}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  stopwatch.status === 'running'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : stopwatch.status === 'paused'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {stopwatch.status === 'running'
                  ? 'Recording'
                  : stopwatch.status === 'paused'
                  ? 'Paused'
                  : 'Ready'}
              </span>
              {stopwatch.elapsedSeconds > 0 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  ≈ {Math.max(1, Math.round(stopwatch.elapsedSeconds / 60))} min(s) to log
                </span>
              )}
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {stopwatch.status === 'running' ? (
              <button
                id="stopwatch-modal-pause-btn"
                onClick={pauseStopwatch}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : stopwatch.status === 'paused' ? (
              <button
                id="stopwatch-modal-resume-btn"
                onClick={resumeStopwatch}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                id="stopwatch-modal-start-btn"
                onClick={() => startStopwatch()}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Timer</span>
              </button>
            )}

            {stopwatch.status !== 'idle' && (
              <button
                id="stopwatch-modal-save-btn"
                onClick={handleStopAndSave}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Save</span>
              </button>
            )}

            {stopwatch.status !== 'idle' && (
              <button
                onClick={resetStopwatch}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset stopwatch without saving"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mark completed checkbox */}
          {stopwatch.status !== 'idle' && activeStopwatchTask && (
            <label className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 cursor-pointer">
              <input
                type="checkbox"
                checked={markCompleteOnStop}
                onChange={(e) => setMarkCompleteOnStop(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                Mark "{activeStopwatchTask.title}" as Completed when stopping
              </span>
            </label>
          )}

          {/* Active Task Info Card */}
          {activeStopwatchTask ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 mb-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Target Task
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadgeColor(
                    activeStopwatchTask.priority
                  )}`}
                >
                  {activeStopwatchTask.priority}
                </span>
              </div>
              <h5 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                {activeStopwatchTask.title}
              </h5>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-indigo-100/70 dark:border-indigo-900/40">
                <span>
                  Estimated: <strong>{activeStopwatchTask.estimatedMinutes}m</strong>
                </span>
                <span>
                  Actual Logged:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {activeStopwatchTask.actualMinutes || 0}m
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-300 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Select a task below to bind tracked time directly to it.</span>
            </div>
          )}

          {/* Task Selector & Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assign / Switch Task
              </label>
              {activeStopwatchTask && (
                <button
                  type="button"
                  onClick={() => selectStopwatchTask(null)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Deselect
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Search active tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {availableTasks.length > 0 ? (
                availableTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      selectStopwatchTask(t.id);
                      if (stopwatch.status === 'idle') {
                        startStopwatch(t.id);
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

export { Stopwatch } from './Stopwatch';
