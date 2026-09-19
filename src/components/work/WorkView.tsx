import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  FolderKanban,
  MoreVertical,
  Check,
  Play,
  Pause,
  Square,
  Trash2,
  Edit2,
  Copy,
  Bell,
  Kanban,
  List as ListIcon,
  Tag,
  AlertTriangle,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Priority, TaskStatus, TaskItem } from '../../types';

export const WorkView: React.FC = () => {
  const {
    tasks,
    projects,
    categories,
    toggleTaskComplete,
    deleteTask,
    addTask,
    updateTask,
    setIsTaskModalOpen,
    setEditingTaskId,
    setIsReminderModalOpen,
    stopwatch,
    startStopwatch,
    pauseStopwatch,
    stopAndSaveStopwatch,
  } = useWork();

  const { isOnline, queueLength, isSyncing, triggerSync } = useOfflineSync();

  const todayStr = '2026-09-15';

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week' | 'overdue'>('today');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'created'>('dueDate');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search query
        if (
          searchQuery &&
          !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Date filter
        if (dateFilter === 'today' && t.dueDate !== todayStr) return false;
        if (dateFilter === 'tomorrow' && t.dueDate !== '2026-09-16') return false;
        if (dateFilter === 'overdue' && (t.dueDate >= todayStr || t.status === 'Completed')) return false;
        if (dateFilter === 'week') {
          // Check if between 2026-09-14 and 2026-09-20
          if (t.dueDate < '2026-09-14' || t.dueDate > '2026-09-20') return false;
        }

        // Project filter
        if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

        // Status filter
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          const dComp = a.dueDate.localeCompare(b.dueDate);
          if (dComp !== 0) return dComp;
          return (a.dueTime || '').localeCompare(b.dueTime || '');
        }
        if (sortBy === 'priority') {
          const weight: Record<Priority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [
    tasks,
    searchQuery,
    dateFilter,
    projectFilter,
    categoryFilter,
    statusFilter,
    priorityFilter,
    sortBy,
    todayStr,
  ]);

  const handleDuplicate = async (task: TaskItem) => {
    const { id, createdAt, updatedAt, ...rest } = task;
    await addTask({
      ...rest,
      title: `${rest.title} (Copy)`,
      status: 'Pending',
    });
  };

  const handleToggleTimer = async (taskId: string) => {
    if (stopwatch.taskId === taskId) {
      if (stopwatch.status === 'running') {
        pauseStopwatch();
      } else if (stopwatch.status === 'paused') {
        await startStopwatch(taskId);
      } else {
        await startStopwatch(taskId);
      }
    } else {
      if (stopwatch.status !== 'idle' && stopwatch.elapsedSeconds >= 5) {
        await stopAndSaveStopwatch();
      }
      await startStopwatch(taskId);
    }
  };

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

  const getProjectInfo = (projId?: string) => {
    if (!projId) return null;
    return projects.find((p) => p.id === projId) || null;
  };

  const boardColumns: TaskStatus[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <div id="work-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            My Work
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plan, execute, time-track, and organize all your work items
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <button
            id="create-new-task-main-btn"
            onClick={() => {
              setEditingTaskId(null);
              setIsTaskModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by work title, description, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'week', label: 'This Week' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'all', label: 'All Dates' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  dateFilter === d.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Project:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Count Strip */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredTasks.length}</strong> work items
        </span>
        {stopwatch.status !== 'idle' && (
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Stopwatch {stopwatch.status === 'running' ? 'running' : 'paused'} ({Math.floor(stopwatch.elapsedSeconds / 60)}m {stopwatch.elapsedSeconds % 60}s)
            </span>
          </div>
        )}
      </div>

      {/* Offline Status & Local Cache Synchronization Notice */}
      {!isOnline && (
        <div
          id="workview-offline-alert"
          className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-200/60 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Offline Workspace Active</p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                You can create, edit, reorder, and complete tasks seamlessly. All actions are cached locally and will auto-sync when online.
                {queueLength > 0 && ` (${queueLength} changes queued)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {isOnline && queueLength > 0 && (
        <div
          id="workview-sync-alert"
          className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-850 flex items-center justify-between gap-3 text-xs text-indigo-800 dark:text-indigo-200"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-200/60 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="font-bold">Online Connection Restored</p>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                {queueLength} task change{queueLength === 1 ? '' : 's'} recorded offline ready to sync with your Firestore database.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerSync()}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      )}

      {/* Content: List or Board */}
      {viewMode === 'list' ? (
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No work items found
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing your filters or create a new task to get started.
              </p>
              <button
                onClick={() => {
                  setEditingTaskId(null);
                  setIsTaskModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                + New Work Item
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'Completed';
              const proj = getProjectInfo(task.projectId);
              const isTimerRunning = stopwatch.taskId === task.id && stopwatch.status === 'running';
              const isTimerPaused = stopwatch.taskId === task.id && stopwatch.status === 'paused';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'border-slate-200/60 dark:border-slate-800/60 opacity-75 bg-slate-50/50'
                      : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 rounded-lg border mt-0.5 sm:mt-0 flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold text-slate-900 dark:text-white ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        {proj && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${proj.color || '#6366f1'}15`,
                              color: proj.color || '#6366f1',
                            }}
                          >
                            {proj.name}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate} {task.dueTime}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est: {task.estimatedMinutes}m | Act: {task.actualMinutes || 0}m
                        </span>
                        {task.reminder?.enabled && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Bell className="w-3 h-3" />
                            Reminder set
                          </span>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {task.tags.map((t) => `#${t}`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions right side */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Time Tracking Button */}
                    <button
                      onClick={() => handleToggleTimer(task.id)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isTimerRunning
                          ? 'bg-rose-500 text-white shadow-xs animate-pulse'
                          : isTimerPaused
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                      }`}
                      title={
                        isTimerRunning
                          ? 'Pause stopwatch for this task'
                          : isTimerPaused
                          ? 'Resume stopwatch for this task'
                          : 'Start stopwatch for this task'
                      }
                    >
                      {isTimerRunning ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>
                        {isTimerRunning
                          ? `Pause (${Math.floor(stopwatch.elapsedSeconds / 60)}:${(stopwatch.elapsedSeconds % 60).toString().padStart(2, '0')})`
                          : isTimerPaused
                          ? `Resume (${Math.floor(stopwatch.elapsedSeconds / 60)}:${(stopwatch.elapsedSeconds % 60).toString().padStart(2, '0')})`
                          : 'Track'}
                      </span>
                    </button>

                    {(isTimerRunning || isTimerPaused) && (
                      <button
                        onClick={async () => {
                          await stopAndSaveStopwatch();
                        }}
                        className="p-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition-colors"
                        title="Stop & Log Time to Task's Actual Time"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop & Save</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Board / Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {boardColumns.map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div
                key={colStatus}
                className="bg-slate-100/70 dark:bg-slate-900/60 p-3.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {colStatus}
                    </h3>
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTaskId(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const proj = getProjectInfo(task.projectId);
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setIsTaskModalOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                          {task.title}
                        </h4>

                        {proj && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: proj.color || '#6366f1' }}
                            />
                            <span className="truncate">{proj.name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
