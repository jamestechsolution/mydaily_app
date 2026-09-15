import React, { useState } from 'react';
import {
  CalendarRange,
  Copy,
  Download,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

export const WeeklyReportView: React.FC = () => {
  const { tasks, projects } = useWork();

  // Current selected week: Sep 14 - Sep 20, 2026
  const [weekStartDate, setWeekStartDate] = useState('2026-09-14');
  const [copied, setCopied] = useState(false);

  // Compute week range dates
  const weekDays = [
    { day: 'Mon', date: '2026-09-14' },
    { day: 'Tue', date: '2026-09-15' },
    { day: 'Wed', date: '2026-09-16' },
    { day: 'Thu', date: '2026-09-17' },
    { day: 'Fri', date: '2026-09-18' },
    { day: 'Sat', date: '2026-09-19' },
    { day: 'Sun', date: '2026-09-20' },
  ];

  const weekTasks = tasks.filter(
    (t) => t.dueDate >= '2026-09-14' && t.dueDate <= '2026-09-20'
  );

  const completed = weekTasks.filter((t) => t.status === 'Completed').length;
  const inProgress = weekTasks.filter((t) => t.status === 'In Progress').length;
  const pending = weekTasks.filter((t) => t.status === 'Pending').length;
  const rate = weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0;
  const totalMinutes = weekTasks.reduce(
    (acc, t) => acc + (t.actualMinutes || t.estimatedMinutes || 0),
    0
  );

  const handleCopy = () => {
    const text =
      `WEEKLY WORK REPORT (Sep 14 - Sep 20, 2026)\n\n` +
      `Summary:\n` +
      `- Total Tasks: ${weekTasks.length}\n` +
      `- Completed: ${completed}\n` +
      `- Completion Rate: ${rate}%\n` +
      `- Logged Hours: ${(totalMinutes / 60).toFixed(1)} hrs\n\n` +
      `Highlights:\n` +
      weekTasks
        .filter((t) => t.status === 'Completed')
        .map((t) => `• ${t.title}`)
        .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Week Range', '2026-09-14 to 2026-09-20'],
      ['Total Tasks', weekTasks.length.toString()],
      ['Completed Tasks', completed.toString()],
      ['Completion Rate', `${rate}%`],
      ['Total Work Hours', (totalMinutes / 60).toFixed(1)],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Weekly_Report_Sep14_Sep20_2026.csv`;
    link.click();
  };

  return (
    <div id="weekly-report-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Weekly Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate 7-day performance, sprint throughput, and team accountability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarRange className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Week 38: September 14 – September 20, 2026
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400">Q3 SPRINT</span>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Weekly Tasks
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {weekTasks.length}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">
            Completed
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-['Outfit']">
            {completed}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider block mb-1">
            Completion Rate
          </span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-['Outfit']">
            {rate}%
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-amber-600 font-bold uppercase tracking-wider block mb-1">
            Total Hours
          </span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-['Outfit']">
            {(totalMinutes / 60).toFixed(1)} hrs
          </p>
        </div>
      </div>

      {/* Day-by-day throughput bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Daily Output Distribution
        </h3>
        <div className="grid grid-cols-7 gap-2 pt-2">
          {weekDays.map((d) => {
            const dTasks = tasks.filter((t) => t.dueDate === d.date);
            const dDone = dTasks.filter((t) => t.status === 'Completed').length;
            const pct = dTasks.length > 0 ? (dDone / dTasks.length) * 100 : 0;
            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-24 flex items-end justify-center p-1">
                  <div
                    className="w-full bg-indigo-600 rounded-lg transition-all"
                    style={{ height: `${Math.max(15, pct)}%` }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {d.day}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dDone}/{dTasks.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Accomplishments and Next Week Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Key Accomplishments This Week</span>
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
            <li>Refactored state management architecture with zero regression bugs.</li>
            <li>Maintained average daily productivity rating above 80%.</li>
            <li>Configured secure user roles & Firestore permissions across collections.</li>
            <li>Met target milestones for the Client SaaS Portal project sprint.</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Target Commitments for Next Week</span>
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
            <li>Finalize end-to-end integration testing for all reporting exports.</li>
            <li>Conduct UX review with product stakeholders.</li>
            <li>Implement automated daily digest triggers for evening workflows.</li>
            <li>Complete documentation and onboarding flow for new workspace team members.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
