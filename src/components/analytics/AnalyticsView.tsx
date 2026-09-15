import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

export const AnalyticsView: React.FC = () => {
  const { tasks, projects, categories } = useWork();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const overdueTasks = tasks.filter((t) => t.dueDate < '2026-09-15' && t.status !== 'Completed').length;

  const totalEstMinutes = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
  const totalActMinutes = tasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

  // Completion rate
  const overallRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Day distribution
  const dayPerformance = [
    { day: 'Mon', rate: 78, hours: 6.5 },
    { day: 'Tue', rate: 92, hours: 8.0 },
    { day: 'Wed', rate: 85, hours: 7.2 },
    { day: 'Thu', rate: 70, hours: 6.0 },
    { day: 'Fri', rate: 88, hours: 7.5 },
    { day: 'Sat', rate: 45, hours: 3.0 },
    { day: 'Sun', rate: 50, hours: 3.5 },
  ];

  return (
    <div id="analytics-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Work Analytics & Productivity Insights
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deep dive into work velocity, time estimation precision, and milestone throughput
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          {(['week', 'month', 'quarter'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                timeRange === r
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Global Completion Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {overallRate}%
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider block mb-1">
            Estimated vs Actual Time
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {(totalActMinutes / 60).toFixed(1)}h
            </span>
            <span className="text-xs text-slate-400">/ {(totalEstMinutes / 60).toFixed(1)}h</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-amber-600 font-bold uppercase tracking-wider block mb-1">
            Active Projects
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              {projects.length}
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-rose-600 font-bold uppercase tracking-wider block mb-1">
            Overdue Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-['Outfit']">
              {overdueTasks}
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity by Day of Week */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Throughput by Day of Week</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600">Peak: Tuesdays</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {dayPerformance.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl h-36 flex items-end justify-center p-1.5 overflow-hidden">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      d.day === 'Tue' ? 'bg-indigo-600' : 'bg-indigo-400/80 dark:bg-indigo-700/60'
                    }`}
                    style={{ height: `${d.rate}%` }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {d.day}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{d.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Velocity Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <span>Project Completion Velocity</span>
          </h3>

          <div className="space-y-4 pt-2">
            {projects.map((p) => {
              const pTasks = tasks.filter((t) => t.projectId === p.id);
              const pDone = pTasks.filter((t) => t.status === 'Completed').length;
              const rate = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </span>
                    <span className="font-mono text-slate-500">
                      {pDone}/{pTasks.length} tasks ({rate}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${rate}%`,
                        backgroundColor: p.color || '#6366f1',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Allocation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Category Allocation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((c) => {
            const cTasks = tasks.filter((t) => t.categoryId === c.id);
            return (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {c.name}
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-2">
                  {cTasks.length}
                </p>
                <span className="text-[10px] text-slate-400">Total items assigned</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
