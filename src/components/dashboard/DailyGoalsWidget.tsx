import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  X,
  Check,
  Award,
  ChevronDown,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { Priority, DailyGoalItem } from '../../types';

interface DailyGoalsWidgetProps {
  date?: string;
}

export const DailyGoalsWidget: React.FC<DailyGoalsWidgetProps> = ({ date = '2026-09-15' }) => {
  const {
    dailyGoals,
    setDailyGoal,
    toggleDailyGoalComplete,
    deleteDailyGoal,
    tasks,
  } = useWork();

  // Filter goals for the specified date
  const dateGoals = dailyGoals.filter((g) => g.date === date);
  const completedGoalsCount = dateGoals.filter((g) => g.isCompleted).length;
  const allCompleted = dateGoals.length === 3 && completedGoalsCount === 3;

  // Track which slot is being edited inline (1, 2, or 3)
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [slotText, setSlotText] = useState('');
  const [slotPriority, setSlotPriority] = useState<Priority>('High');
  const [slotTaskId, setSlotTaskId] = useState<string>('');
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Available tasks for today that can be linked
  const todayTasks = tasks.filter((t) => t.dueDate === date);

  const slotLabels = [
    { slot: 1, label: 'Objective 1', tag: 'Top Priority', defaultPriority: 'Urgent' as Priority },
    { slot: 2, label: 'Objective 2', tag: 'High Impact', defaultPriority: 'High' as Priority },
    { slot: 3, label: 'Objective 3', tag: 'Core Outcome', defaultPriority: 'Medium' as Priority },
  ];

  const handleStartEdit = (slot: number, currentGoal?: DailyGoalItem) => {
    setEditingSlot(slot);
    if (currentGoal) {
      setSlotText(currentGoal.title);
      setSlotPriority(currentGoal.priority || 'High');
      setSlotTaskId(currentGoal.taskId || '');
    } else {
      setSlotText('');
      setSlotPriority(slotLabels[slot - 1]?.defaultPriority || 'High');
      setSlotTaskId('');
    }
    setShowTaskSelector(false);
  };

  const handleSaveSlot = async (slot: number) => {
    if (!slotText.trim()) {
      // If empty and goal existed, it's deleted by setDailyGoal
      const existing = dateGoals.find((g) => g.slotNumber === slot);
      if (existing) {
        await deleteDailyGoal(existing.id);
      }
    } else {
      await setDailyGoal(
        slot,
        slotText.trim(),
        date,
        slotPriority,
        slotTaskId || undefined
      );
    }
    setEditingSlot(null);
    setSlotText('');
    setSlotTaskId('');
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setSlotText('');
    setSlotTaskId('');
    setShowTaskSelector(false);
  };

  const handleSelectTask = (task: typeof tasks[0]) => {
    setSlotText(task.title);
    setSlotPriority(task.priority);
    setSlotTaskId(task.id);
    setShowTaskSelector(false);
  };

  const getPriorityStyle = (p?: Priority) => {
    switch (p) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      case 'High':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-900/60';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case 'Low':
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div
      id="daily-goals-widget"
      className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-all"
    >
      {/* Background celebration glow when all 3 completed */}
      {allCompleted && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Daily Goals & High-Impact Focus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                Rule of 3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lock in your top 3 non-negotiable outcomes for today to maximize leverage.
            </p>
          </div>
        </div>

        {/* Progress pill & completion meter */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
              {completedGoalsCount} of 3 Achieved
            </span>
            <span className="text-[10px] text-slate-400">
              {dateGoals.length < 3 ? `${3 - dateGoals.length} slot${3 - dateGoals.length > 1 ? 's' : ''} available` : 'All slots defined'}
            </span>
          </div>
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ${
                allCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${(completedGoalsCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Celebration banner when all 3 completed */}
      {allCompleted && (
        <div
          id="daily-goals-celebration"
          className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Mission accomplished! All 3 high-impact objectives completed for today.
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
            100% Focused
          </span>
        </div>
      )}

      {/* 3 Goal Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {slotLabels.map(({ slot, label, tag }) => {
          const goal = dateGoals.find((g) => g.slotNumber === slot);
          const isEditing = editingSlot === slot;
          const isDone = !!goal?.isCompleted;
          const linkedTask = goal?.taskId ? tasks.find((t) => t.id === goal.taskId) : null;

          if (isEditing) {
            return (
              <div
                key={slot}
                id={`daily-goal-slot-${slot}-editor`}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border-2 border-indigo-500/80 shadow-xs flex flex-col justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Slot {slot} • {tag}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    id={`daily-goal-input-${slot}`}
                    type="text"
                    value={slotText}
                    onChange={(e) => setSlotText(e.target.value)}
                    placeholder={`e.g. ${
                      slot === 1
                        ? 'Finish executive presentation deck'
                        : slot === 2
                        ? 'Resolve critical client bug'
                        : 'Review sprint deliverables'
                    }`}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveSlot(slot);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />

                  {/* Priority and Task linking options */}
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {(['Urgent', 'High', 'Medium'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSlotPriority(p)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors ${
                            slotPriority === p
                              ? getPriorityStyle(p) + ' font-bold'
                              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    {/* Quick Pick from today's tasks button */}
                    {todayTasks.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowTaskSelector(!showTaskSelector)}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          title="Pick from Today's Scheduled Tasks"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Link Task</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {showTaskSelector && (
                          <div className="absolute right-0 bottom-full mb-1 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-1.5 z-20 max-h-48 overflow-y-auto">
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block uppercase">
                              Today's Tasks
                            </span>
                            {todayTasks.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleSelectTask(t)}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 truncate block text-slate-800 dark:text-slate-200"
                              >
                                {t.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save / Cancel buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    id={`daily-goal-save-btn-${slot}`}
                    type="button"
                    onClick={() => handleSaveSlot(slot)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            );
          }

          if (goal) {
            return (
              <div
                key={slot}
                id={`daily-goal-slot-${slot}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                  isDone
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {label} • {tag}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`daily-goal-edit-${slot}`}
                        onClick={() => handleStartEdit(slot, goal)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit objective"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`daily-goal-delete-${slot}`}
                        onClick={() => deleteDailyGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete objective"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Objective title and completion toggle */}
                  <div className="flex items-start gap-2.5 mt-1">
                    <button
                      id={`daily-goal-check-${slot}`}
                      type="button"
                      onClick={() => toggleDailyGoalComplete(goal.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent'
                      }`}
                      title={isDone ? 'Mark as pending' : 'Mark as completed'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold leading-snug break-words ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {goal.title}
                      </p>
                      {linkedTask && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 truncate max-w-full">
                          <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{linkedTask.title}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer status badges */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold border ${getPriorityStyle(
                      goal.priority
                    )}`}
                  >
                    {goal.priority || 'High'}
                  </span>

                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isDone
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                        <span>In Progress</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          }

          // Empty slot card
          return (
            <div
              key={slot}
              id={`daily-goal-empty-slot-${slot}`}
              onClick={() => handleStartEdit(slot)}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 bg-slate-50/40 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[130px]"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 dark:group-hover:text-indigo-400 flex items-center justify-center mb-2 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                + Set {label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
