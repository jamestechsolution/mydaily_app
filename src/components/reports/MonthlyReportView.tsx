import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Download,
  Printer,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  FolderKanban,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

export const MonthlyReportView: React.FC = () => {
  const { tasks, projects } = useWork();

  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [copied, setCopied] = useState(false);

  // Filter tasks for month
  const monthTasks = tasks.filter((t) => t.dueDate.startsWith(selectedMonth));
  const completed = monthTasks.filter((t) => t.status === 'Completed').length;
  const pending = monthTasks.filter((t) => t.status !== 'Completed').length;
  const rate = monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0;
  const totalMinutes = monthTasks.reduce(
    (acc, t) => acc + (t.actualMinutes || t.estimatedMinutes || 0),
    0
  );

  const handleCopy = () => {
    const text =
      `MONTHLY WORK REPORT - September 2026\n\n` +
      `- Total Tasks: ${monthTasks.length}\n` +
      `- Completed: ${completed}\n` +
      `- Completion Rate: ${rate}%\n` +
      `- Total Hours Worked: ${(totalMinutes / 60).toFixed(1)} hrs\n` +
      `- Best Productivity Day: Tuesday, Sep 15, 2026\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Month', selectedMonth],
      ['Total Tasks', monthTasks.length.toString()],
      ['Completed Tasks', completed.toString()],
      ['Completion Rate', `${rate}%`],
      ['Total Hours Logged', (totalMinutes / 60).toFixed(1)],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Monthly_Report_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div id="monthly-report-view" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Monthly Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            High-level executive summary of project hours, milestones, and capacity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
          />
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

      {/* Monthly KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Total Monthly Tasks
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            {monthTasks.length}
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
            Monthly Work Hours
          </span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-['Outfit']">
            {(totalMinutes / 60).toFixed(1)} hrs
          </p>
        </div>
      </div>

      {/* Project Hours Distribution */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-indigo-500" />
          <span>Project Hours Distribution</span>
        </h3>

        <div className="space-y-3">
          {projects.map((proj) => {
            const projTasks = monthTasks.filter((t) => t.projectId === proj.id);
            const projMinutes = projTasks.reduce(
              (acc, t) => acc + (t.actualMinutes || t.estimatedMinutes || 0),
              0
            );
            const pct = totalMinutes > 0 ? Math.round((projMinutes / totalMinutes) * 100) : 0;

            return (
              <div key={proj.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: proj.color || '#6366f1' }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {proj.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-500">
                    {(projMinutes / 60).toFixed(1)} hrs ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: proj.color || '#6366f1',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Peak Productivity Benchmark
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Tuesday, September 15 was your highest throughput day with 100% of planned tasks delivered on or before deadline.
          </p>
        </div>
      </div>
    </div>
  );
};
