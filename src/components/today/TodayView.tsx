import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Sunrise,
  Sun,
  Sunset,
  Tag,
  FolderKanban,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { TaskItem, Priority, TaskStatus } from '../../types';
import {
  getTodayDateString,
  formatDateLong,
  formatTime12h,
  getTaskDayPeriod,
  DayPeriod,
} from '../../utils/dateUtils';
import { DailyGoalsWidget } from '../dashboard/DailyGoalsWidget';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const TodayView: React.FC = () => {
  const {
    tasks,
    categories,
    projects,
    toggleTaskComplete,
    deleteTask,
    setIsTaskModalOpen,
    setEditingTaskId,
  } = useWork();

  const todayStr = getTodayDateString();
  const todayFormatted = formatDateLong(todayStr);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // Filter tasks strictly due or scheduled for today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr || t.startDate === todayStr);
  }, [tasks, todayStr]);

  const filteredTasks = useMemo(() => {
    if (filterStatus === 'all') return todayTasks;
    if (filterStatus === 'completed') return todayTasks.filter((t) => t.status === 'Completed');
    if (filterStatus === 'pending')
      return todayTasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress');
    return todayTasks;
  }, [todayTasks, filterStatus]);

  const completedCount = todayTasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0;

  // Group tasks by Morning, Afternoon, Evening
  const groupedTasks: Record<DayPeriod, TaskItem[]> = useMemo(() => {
    const groups: Record<DayPeriod, TaskItem[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };

    filteredTasks.forEach((task) => {
      const period = getTaskDayPeriod(task.dueTime || task.startTime);
      groups[period].push(task);
    });

    // Sort each group by time
    Object.keys(groups).forEach((key) => {
      groups[key as DayPeriod].sort((a, b) => {
        const timeA = a.dueTime || a.startTime || '23:59';
        const timeB = b.dueTime || b.startTime || '23:59';
        return timeA.localeCompare(timeB);
      });
    });

    return groups;
  }, [filteredTasks]);

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

  const periodConfig: {
    period: DayPeriod;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      period: 'Morning',
      label: 'Morning Tasks',
      sublabel: 'Before 12:00 PM • Peak focus & kickoff items',
      icon: Sunrise,
      accentColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    },
    {
      period: 'Afternoon',
      label: 'Afternoon Tasks',
      sublabel: '12:00 PM – 5:00 PM • Execution & meetings',
      icon: Sun,
      accentColor: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60',
    },
    {
      period: 'Evening',
      label: 'Evening Tasks',
      sublabel: 'After 5:00 PM • Review & wrap-up items',
      icon: Sunset,
      accentColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
    },
  ];

  return (
    <div id="today-tasks-page" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              Today's Schedule
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} scheduled
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight mt-1">
            {todayFormatted}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your time-blocked milestones for today and mark tasks complete as you progress.
          </p>
        </div>

        {/* Action Controls & Progress */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/70 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {completedCount}/{todayTasks.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            id="today-add-task-btn"
            onClick={() => {
              setEditingTaskId(null);
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Today's Task</span>
          </button>
        </div>
      </div>

      {/* Embedded Daily Rule-of-3 Goals Widget */}
      <DailyGoalsWidget date={todayStr} />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All Tasks', count: todayTasks.length },
            {
              id: 'pending',
              label: 'To Do',
              count: todayTasks.filter((t) => t.status !== 'Completed').length,
            },
            { id: 'completed', label: 'Completed', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State when no tasks for today at all */}
      {todayTasks.length === 0 && (
        <div
          id="today-empty-state"
          className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center shadow-xs"
        >
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
            No tasks scheduled for today
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Enjoy your free schedule, or plan out your daily objectives to ensure consistent productivity.
          </p>
          <button
            onClick={() => {
              setEditingTaskId(null);
              setIsTaskModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Task</span>
          </button>
        </div>
      )}

      {/* 3 Day Periods: Morning, Afternoon, Evening */}
      {todayTasks.length > 0 && (
        <div className="space-y-6">
          {periodConfig.map(({ period, label, sublabel, icon: Icon, accentColor }) => {
            const periodItems = groupedTasks[period];

            return (
              <div
                key={period}
                id={`period-section-${period.toLowerCase()}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 ${accentColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                          {label}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {periodItems.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {sublabel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                {periodItems.length === 0 ? (
                  <div className="py-6 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/40">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      No {period.toLowerCase()} tasks scheduled.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {periodItems.map((task) => {
                      const isCompleted = task.status === 'Completed';
                      const cat = getCategory(task.categoryId);

                      return (
                        <div
                          key={task.id}
                          id={`today-task-${task.id}`}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                            isCompleted
                              ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Complete Toggle Button */}
                            <button
                              type="button"
                              id={`today-check-${task.id}`}
                              onClick={() => toggleTaskComplete(task.id)}
                              className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent'
                              }`}
                              title={isCompleted ? 'Mark pending' : 'Mark completed'}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`text-xs font-bold leading-tight ${
                                    isCompleted
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {task.title}
                                </h4>

                                {cat && (
                                  <span
                                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1"
                                    style={{
                                      backgroundColor: `${cat.color}15`,
                                      borderColor: `${cat.color}35`,
                                      color: cat.color,
                                    }}
                                  >
                                    <Tag className="w-2.5 h-2.5" />
                                    <span>{cat.name}</span>
                                  </span>
                                )}

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityBadge(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </div>

                              {task.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Time & Quick Actions */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span>
                                {task.dueTime ? formatTime12h(task.dueTime) : 'All Day'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingTaskId(task.id);
                                  setIsTaskModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setTaskToDelete(task)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
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
