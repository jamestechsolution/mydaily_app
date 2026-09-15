import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { Priority, TaskItem } from '../../types';

export const CalendarView: React.FC = () => {
  const { tasks, reminders, setIsTaskModalOpen, setEditingTaskId } = useWork();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  // Current viewing month: September 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 is September
  const [selectedDay, setSelectedDay] = useState('2026-09-15');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedDay('2026-09-15');
  };

  // Generate days for Month View
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'Urgent':
        return 'bg-rose-500 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-amber-500 text-white';
      case 'Low':
        return 'bg-slate-400 text-white';
    }
  };

  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDay);
  const selectedDayReminders = reminders.filter((r) => r.remindAt.startsWith(selectedDay));

  return (
    <div id="calendar-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize deadlines, work schedules, and reminder triggers across September 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {(['month', 'week', 'day', 'agenda'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  viewMode === m
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setEditingTaskId(null);
              setIsTaskModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Work</span>
          </button>
        </div>
      </div>

      {/* Month Navigator Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Today (Sep 15)
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Render */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Month Grid (3 cols) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
              {daysArray.map((dayNum, index) => {
                if (dayNum === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[90px] bg-slate-50/40 dark:bg-slate-900/30 p-1.5"
                    />
                  );
                }

                const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
                  2,
                  '0'
                )}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = dateString === selectedDay;
                const isToday = dateString === '2026-09-15';
                const dayTasks = tasks.filter((t) => t.dueDate === dateString);
                const dayReminders = reminders.filter((r) => r.remindAt.startsWith(dateString));

                return (
                  <div
                    key={dateString}
                    onClick={() => setSelectedDay(dateString)}
                    className={`min-h-[95px] p-1.5 cursor-pointer transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-500 inset-0'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : isSelected
                            ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayReminders.length > 0 && (
                        <Bell className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                    </div>

                    {/* Task pills inside cell */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTaskId(task.id);
                            setIsTaskModalOpen(true);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${getPriorityColor(
                            task.priority
                          )} hover:opacity-90`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[9px] font-semibold text-slate-400 block px-1">
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>

                    <div className="h-1" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Sidebar (1 col) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {new Date(`${selectedDay}T00:00`).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedDayTasks.length} tasks scheduled
                </span>
              </div>
              <button
                onClick={() => {
                  setEditingTaskId(null);
                  setIsTaskModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                title="Add task for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Scheduled Tasks for Selected Day */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No work scheduled on this date.
                </p>
              ) : (
                selectedDayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setEditingTaskId(t.id);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {t.startTime} - {t.dueTime}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {t.title}
                    </h4>
                  </div>
                ))
              )}

              {/* Day's Reminders */}
              {selectedDayReminders.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1.5">
                    Reminders
                  </span>
                  {selectedDayReminders.map((r) => (
                    <div
                      key={r.id}
                      className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 text-xs text-amber-900 dark:text-amber-200 mb-1"
                    >
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-[10px] text-amber-700/70 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(r.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Week / Day / Agenda view fallback presentations */}
      {viewMode !== 'month' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
            {viewMode} Agenda View
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  setEditingTaskId(task.id);
                  setIsTaskModalOpen(true);
                }}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                      {task.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Due: {task.dueDate} at {task.dueTime}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
