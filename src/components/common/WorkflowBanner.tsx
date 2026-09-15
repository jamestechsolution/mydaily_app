import React from 'react';
import { Sun, Moon, ArrowRight, X, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { useWork } from '../../context/WorkContext';

export const WorkflowBanner: React.FC = () => {
  const {
    showMorningWorkflow,
    setShowMorningWorkflow,
    showEveningWorkflow,
    setShowEveningWorkflow,
    setActiveTab,
    tasks,
  } = useWork();

  const todayStr = '2026-09-15';
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'Completed').length;
  const pendingToday = todayTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled').length;

  const dismissMorning = () => {
    setShowMorningWorkflow(false);
    sessionStorage.setItem('dwm_morning_dismissed', 'true');
  };

  const dismissEvening = () => {
    setShowEveningWorkflow(false);
    sessionStorage.setItem('dwm_evening_dismissed', 'true');
  };

  if (showMorningWorkflow) {
    return (
      <div
        id="workflow-morning-banner"
        className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/20 dark:border-amber-400/20 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Sun className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Good morning! Here is your plan for today.
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                You have <strong className="text-amber-600 dark:text-amber-400">{pendingToday} tasks</strong> scheduled for today. Review your priorities to maintain flow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                setActiveTab('work');
                dismissMorning();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>View Today's Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={dismissMorning}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Dismiss for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showEveningWorkflow) {
    return (
      <div
        id="workflow-evening-banner"
        className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-transparent border border-indigo-500/25 dark:border-indigo-400/25 relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Your day is almost complete. Would you like to create today's report?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Completed <strong className="text-indigo-600 dark:text-indigo-400">{completedToday} of {todayTasks.length} tasks</strong> today. Record accomplishments & challenges now.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                setActiveTab('daily-reports');
                dismissEvening();
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Compile Daily Report</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={dismissEvening}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Dismiss for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
