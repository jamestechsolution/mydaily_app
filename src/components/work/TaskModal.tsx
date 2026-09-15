import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Paperclip,
  Bell,
  Repeat,
  FolderKanban,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { TaskItem, Priority, TaskStatus, ReminderRecurrence } from '../../types';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTaskId,
    setEditingTaskId,
    tasks,
    projects,
    categories,
    addTask,
    updateTask,
    deleteTask,
  } = useWork();

  const todayStr = '2026-09-15';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'cat-work');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('17:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [actualMinutes, setActualMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Reminder fields
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(`${todayStr}T09:00`);
  const [reminderRecurrence, setReminderRecurrence] = useState<ReminderRecurrence>('one-time');

  // Recurring task fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Attachments
  const [attachments, setAttachments] = useState<{ name: string; size: string; type: string }[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Error validation state
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTaskId) {
      const task = tasks.find((t) => t.id === editingTaskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setProjectId(task.projectId || '');
        setCategoryId(task.categoryId || categories[0]?.id || 'cat-work');
        setPriority(task.priority);
        setStatus(task.status);
        setStartDate(task.startDate || todayStr);
        setStartTime(task.startTime || '09:00');
        setDueDate(task.dueDate || todayStr);
        setDueTime(task.dueTime || '17:00');
        setEstimatedMinutes(task.estimatedMinutes || 60);
        setActualMinutes(task.actualMinutes || 0);
        setNotes(task.notes || '');
        setTags(task.tags || []);
        if (task.reminder) {
          setReminderEnabled(task.reminder.enabled);
          setReminderDate(task.reminder.remindAt || `${todayStr}T09:00`);
          setReminderRecurrence(task.reminder.recurrence || 'one-time');
        } else {
          setReminderEnabled(false);
        }
        setIsRecurring(!!task.isRecurring);
        setRecurrenceRule(task.recurrenceRule || 'daily');
        setAttachments(task.attachments || []);
      }
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setCategoryId(categories[0]?.id || 'cat-work');
      setPriority('Medium');
      setStatus('Pending');
      setStartDate(todayStr);
      setStartTime('09:00');
      setDueDate(todayStr);
      setDueTime('17:00');
      setEstimatedMinutes(60);
      setActualMinutes(0);
      setNotes('');
      setTags([]);
      setReminderEnabled(false);
      setReminderDate(`${todayStr}T09:00`);
      setReminderRecurrence('one-time');
      setIsRecurring(false);
      setRecurrenceRule('daily');
      setAttachments([]);
      setError('');
    }
  }, [editingTaskId, isTaskModalOpen, tasks, projects, categories]);

  if (!isTaskModalOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    setAttachments([
      ...attachments,
      {
        name: newAttachmentName.trim(),
        size: '1.2 MB',
        type: 'application/pdf',
      },
    ]);
    setNewAttachmentName('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    const taskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      projectId: projectId || undefined,
      categoryId,
      priority,
      status,
      startDate,
      startTime,
      dueDate,
      dueTime,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      actualMinutes: Number(actualMinutes) || 0,
      notes: notes.trim() || undefined,
      tags,
      reminder: reminderEnabled
        ? {
            enabled: true,
            remindAt: reminderDate,
            recurrence: reminderRecurrence,
          }
        : undefined,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : undefined,
      attachments,
      completedAt: status === 'Completed' ? new Date().toISOString() : undefined,
    };

    if (editingTaskId) {
      await updateTask(editingTaskId, taskPayload);
    } else {
      await addTask(taskPayload);
    }

    setIsTaskModalOpen(false);
    setEditingTaskId(null);
  };

  const handleDelete = async () => {
    if (editingTaskId) {
      await deleteTask(editingTaskId);
      setIsTaskModalOpen(false);
      setEditingTaskId(null);
    }
  };

  return (
    <div
      id="task-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => {
        setIsTaskModalOpen(false);
        setEditingTaskId(null);
      }}
    >
      <div
        id="task-modal-card"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingTaskId ? 'Edit Work Item' : 'New Work Item'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsTaskModalOpen(false);
              setEditingTaskId(null);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Finish database migration & write report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              placeholder="Add details, acceptance criteria, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Project & Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="">No Project (General Work)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Dates and Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Start Date & Time
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Due Date & Time (Deadline)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Durations */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Duration (min)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actual Duration (min)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={actualMinutes}
                onChange={(e) => setActualMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Reminder Section */}
          <div className="p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 cursor-pointer">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Enable Reminder Notification</span>
              </label>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4"
              />
            </div>

            {reminderEnabled && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
                <div>
                  <span className="text-[11px] text-amber-800/80 dark:text-amber-300 block mb-1">
                    Remind at Date & Time
                  </span>
                  <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-amber-800/80 dark:text-amber-300 block mb-1">
                    Recurrence
                  </span>
                  <select
                    value={reminderRecurrence}
                    onChange={(e) => setReminderRecurrence(e.target.value as ReminderRecurrence)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="one-time">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Recurring Task toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recurring Work Item
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isRecurring && (
                <select
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value as any)}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> Attachments
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="File name or document link (e.g. specs.pdf)"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 font-medium"
              >
                Attach
              </button>
            </div>
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-200 dark:border-slate-700 mb-1"
              >
                <span className="truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(i)}
                  className="text-slate-400 hover:text-rose-500 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {editingTaskId ? (
              <button
                id="delete-task-btn"
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setEditingTaskId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                id="save-task-btn"
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-colors"
              >
                {editingTaskId ? 'Save Changes' : 'Create Work Item'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
