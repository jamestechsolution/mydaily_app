import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Tag,
  Check,
  CalendarRange,
  RotateCcw,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { TaskItem, Priority } from '../../types';
import { getWeekDays, formatTime12h, formatDateShort, getTodayDateString } from '../../utils/dateUtils';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const WeeklyPlannerView: React.FC = () => {
  const {
    tasks,
    categories,
    toggleTaskComplete,
    deleteTask,
    setIsTaskModalOpen,
    setEditingTaskId,
  } = useWork();

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  const weekDays = useMemo(() => {
    return getWeekDays(new Date(), weekOffset);
  }, [weekOffset]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return '';
    const start = formatDateShort(weekDays[0].dateString);
    const end = formatDateShort(weekDays[6].dateString);
    return `${start} – ${end}`;
  }, [weekDays]);

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'High':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getCategory = (catId?: string) => {
    return categories.find((c) => c.id === catId);
  };

  return (
    <div id="weekly-planner-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Weekly Work Planner</span>
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight mt-1">
            {weekRangeLabel}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map out your schedule from Monday through Sunday. Add, prioritize, and track completions by day.
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>This Week</span>
            </button>
          )}

          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <button
              id="planner-prev-week"
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xs transition-all"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              {weekOffset === 0 ? 'Current Week' : weekOffset > 0 ? `+${weekOffset} wks` : `${weekOffset} wks`}
            </span>
            <button
              id="planner-next-week"
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xs transition-all"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTaskId(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* 7 Days Grid (Monday through Sunday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter((t) => t.dueDate === day.dateString);
          const completedDayCount = dayTasks.filter((t) => t.status === 'Completed').length;
          const dayPercent =
            dayTasks.length > 0 ? Math.round((completedDayCount / dayTasks.length) * 100) : 0;

          return (
            <div
              key={day.dateString}
              id={`planner-day-${day.dayShort.toLowerCase()}`}
              className={`rounded-3xl border flex flex-col justify-between transition-all min-h-[360px] p-4 ${
                day.isToday
                  ? 'bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          day.isToday
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      {day.isToday && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-600 text-white">
                          TODAY
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] block leading-tight">
                      {day.dayNumber}
                    </span>
                  </div>

                  {/* Day Completion Percentage Badge */}
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        dayPercent === 100 && dayTasks.length > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {dayPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {completedDayCount}/{dayTasks.length} done
                    </span>
                  </div>
                </div>

                {/* Progress bar per day */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      dayPercent === 100 && dayTasks.length > 0
                        ? 'bg-emerald-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${dayPercent}%` }}
                  />
                </div>

                {/* Task Items List */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-thin">
                  {dayTasks.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 dark:text-slate-600">
                      <p className="text-[11px]">No tasks</p>
                    </div>
                  ) : (
                    dayTasks.map((task) => {
                      const isDone = task.status === 'Completed';
                      const cat = getCategory(task.categoryId);

                      return (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-xl border text-left transition-all relative group ${
                            isDone
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                              : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() => toggleTaskComplete(task.id)}
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[11px] font-bold leading-tight truncate ${
                                  isDone
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {task.title}
                              </p>

                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {task.dueTime && (
                                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{formatTime12h(task.dueTime)}</span>
                                  </span>
                                )}

                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${getPriorityBadge(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Add button at bottom of day card */}
              <button
                type="button"
                onClick={() => {
                  setEditingTaskId(null);
                  setIsTaskModalOpen(true);
                }}
                className="mt-3 w-full py-1.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add for {day.dayShort}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This cannot be undone."
        itemTitle={taskToDelete?.title}
        onConfirm={async () => {
          if (taskToDelete) {
            await deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
};
