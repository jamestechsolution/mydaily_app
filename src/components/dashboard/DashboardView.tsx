import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Plus,
  Bell,
  FolderPlus,
  FilePlus,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useAuth } from '../../context/AuthContext';
import { WorkflowBanner } from '../common/WorkflowBanner';
import { TaskItem, Priority } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    projects,
    reminders,
    setActiveTab,
    setIsTaskModalOpen,
    setEditingTaskId,
    setIsReminderModalOpen,
    setIsProjectModalOpen,
    toggleTaskComplete,
  } = useWork();

  const { profile } = useAuth();
  const todayStr = '2026-09-15';

  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Filter tasks for today and upcoming
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const upcomingTasks = tasks
    .filter((t) => t.dueDate > todayStr && t.status !== 'Completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const completedToday = todayTasks.filter((t) => t.status === 'Completed').length;
  const inProgressToday = todayTasks.filter((t) => t.status === 'In Progress').length;
  const pendingToday = todayTasks.filter((t) => t.status === 'Pending').length;
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'Completed');

  const completionRate =
    todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 100;

  // Next upcoming reminder
  const nextReminder = reminders
    .filter((r) => !r.isCompleted && r.remindAt >= `${todayStr}T00:00`)
    .sort((a, b) => a.remindAt.localeCompare(b.remindAt))[0];

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'Low':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getProjectName = (projId?: string) => {
    if (!projId) return null;
    const p = projects.find((x) => x.id === projId);
    return p ? p.name : null;
  };

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Workflow Banner (Morning plan or Evening Report offer) */}
      <WorkflowBanner />

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Good Morning, {profile?.name ? profile.name.split(' ')[0] : 'User'} 👋
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Tuesday, September 15, 2026
            </span>
            <span>•</span>
            <span className="italic text-indigo-600 dark:text-indigo-400">
              "Focus on high-impact objectives today and celebrate small milestones."
            </span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-add-work-btn"
            onClick={() => {
              setEditingTaskId(null);
              setIsTaskModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work</span>
          </button>
          <button
            id="dash-create-reminder-btn"
            onClick={() => setIsReminderModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Create Reminder</span>
          </button>
          <button
            id="dash-create-proj-btn"
            onClick={() => setIsProjectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
          <button
            id="dash-create-report-btn"
            onClick={() => setActiveTab('daily-reports')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Create Daily Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Today's Tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Today's Tasks
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {todayTasks.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Planned</span>
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Completed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
              {completedToday}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            In Progress
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-['Outfit']">
              {inProgressToday}
            </span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
            Pending
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-['Outfit']">
              {pendingToday}
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
            Overdue
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-['Outfit']">
              {overdueTasks.length}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            Completion Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {completionRate}%
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Progress & Next Reminder Hero Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress Bar & Breakdown Card */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Today's Progress
              </h3>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {completionRate}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{
                  width: `${todayTasks.length > 0 ? (completedToday / todayTasks.length) * 100 : 0}%`,
                }}
              />
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{
                  width: `${todayTasks.length > 0 ? (inProgressToday / todayTasks.length) * 100 : 0}%`,
                }}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{
                  width: `${todayTasks.length > 0 ? (pendingToday / todayTasks.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>{todayTasks.length}</strong> Planned
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>{completedToday}</strong> Completed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>{inProgressToday}</strong> In Progress
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>{pendingToday}</strong> Pending
              </span>
            </div>
          </div>
        </div>

        {/* Next Reminder Box */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Bell className="w-3.5 h-3.5" /> Next Reminder
            </span>
            {nextReminder ? (
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {nextReminder.title}
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Today at{' '}
                  {new Date(nextReminder.remindAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {nextReminder.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {nextReminder.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No pending reminders for today.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('reminders')}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 mt-3 self-start"
          >
            <span>View all reminders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Today's Work & Upcoming Work Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks List (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">
              Today's Work
            </h3>
            <button
              onClick={() => setActiveTab('work')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage all tasks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs text-slate-500">No work scheduled for today.</p>
              <button
                onClick={() => {
                  setEditingTaskId(null);
                  setIsTaskModalOpen(true);
                }}
                className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
              >
                + Add Your First Task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => {
                const isDone = task.status === 'Completed';
                const projName = getProjectName(task.projectId);
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'border-slate-200/60 dark:border-slate-800/60 opacity-70 bg-slate-50/50'
                        : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {/* Checkbox */}
                      <button
                        id={`task-check-${task.id}`}
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                        title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="truncate">
                        <span
                          className={`text-xs font-semibold text-slate-900 dark:text-white block truncate ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {projName && (
                            <span className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                              {projName}
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.startTime} - {task.dueTime}
                          </span>
                          {task.reminder?.enabled && (
                            <span title="Reminder enabled">
                              <Bell className="w-3 h-3 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setIsTaskModalOpen(true);
                        }}
                        className="text-xs text-slate-400 hover:text-indigo-600 p-1"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Work & Productivity Mini Chart (1 col) */}
        <div className="space-y-6">
          {/* Upcoming Work */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Upcoming Work
              </h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Calendar
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-300 transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>Due: {task.dueDate}</span>
                      <span
                        className={`font-semibold px-1.5 py-0.2 rounded ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini Productivity Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Productivity Trend
              </h3>
              <div className="flex gap-1 text-[10px]">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      chartPeriod === p
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1">
              {[
                { label: 'Mon', val: 75 },
                { label: 'Tue', val: 88 },
                { label: 'Wed', val: 92 },
                { label: 'Thu', val: 65 },
                { label: 'Fri', val: 95 },
                { label: 'Sat', val: 40 },
                { label: 'Sun', val: 60 },
              ].map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-20 flex items-end justify-center overflow-hidden">
                    <div
                      className={`w-full transition-all duration-500 ${
                        day.label === 'Tue' ? 'bg-indigo-600' : 'bg-indigo-300 dark:bg-indigo-800/60'
                      }`}
                      style={{ height: `${day.val}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{day.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 text-[11px]">Avg Daily Output:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">82.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
