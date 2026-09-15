import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  CheckSquare,
  FolderKanban,
  FileText,
  StickyNote,
  Bell,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    tasks,
    projects,
    notes,
    reports,
    reminders,
    setActiveTab,
    setEditingTaskId,
    setIsTaskModalOpen,
  } = useWork();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tasks' | 'projects' | 'notes' | 'reports' | 'reminders'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && filterType === 'all' && filterPriority === 'all') return [];

    const matchedTasks = (filterType === 'all' || filterType === 'tasks')
      ? tasks.filter((t) => {
          const matchQuery = !q || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
          const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
          return matchQuery && matchPriority;
        }).map((t) => ({ type: 'task' as const, id: t.id, title: t.title, subtitle: `Task • ${t.priority} • Due: ${t.dueDate}`, item: t }))
      : [];

    const matchedProjects = (filterType === 'all' || filterType === 'projects')
      ? projects.filter((p) => {
          const matchQuery = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
          const matchPriority = filterPriority === 'all' || p.priority === filterPriority;
          return matchQuery && matchPriority;
        }).map((p) => ({ type: 'project' as const, id: p.id, title: p.name, subtitle: `Project • ${p.status} • Ends: ${p.endDate}`, item: p }))
      : [];

    const matchedNotes = (filterType === 'all' || filterType === 'notes')
      ? notes.filter((n) => {
          return !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        }).map((n) => ({ type: 'note' as const, id: n.id, title: n.title, subtitle: `Note • Category: ${n.category}`, item: n }))
      : [];

    const matchedReports = (filterType === 'all' || filterType === 'reports')
      ? reports.filter((r) => {
          return !q || r.title.toLowerCase().includes(q) || r.achievements.toLowerCase().includes(q) || r.challenges.toLowerCase().includes(q);
        }).map((r) => ({ type: 'report' as const, id: r.id, title: r.title, subtitle: `Daily Report • ${r.productivity}% Productivity`, item: r }))
      : [];

    const matchedReminders = (filterType === 'all' || filterType === 'reminders')
      ? reminders.filter((rem) => {
          return !q || rem.title.toLowerCase().includes(q);
        }).map((rem) => ({ type: 'reminder' as const, id: rem.id, title: rem.title, subtitle: `Reminder • ${new Date(rem.remindAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`, item: rem }))
      : [];

    return [...matchedTasks, ...matchedProjects, ...matchedNotes, ...matchedReports, ...matchedReminders];
  }, [searchQuery, filterType, filterPriority, tasks, projects, notes, reports, reminders]);

  if (!isSearchModalOpen) return null;

  const handleSelect = (res: (typeof results)[0]) => {
    setIsSearchModalOpen(false);
    if (res.type === 'task') {
      setEditingTaskId(res.id);
      setIsTaskModalOpen(true);
    } else if (res.type === 'project') {
      setActiveTab('projects');
    } else if (res.type === 'note') {
      setActiveTab('notes');
    } else if (res.type === 'report') {
      setActiveTab('daily-reports');
    } else if (res.type === 'reminder') {
      setActiveTab('reminders');
    }
  };

  return (
    <div
      id="global-search-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-20"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        id="global-search-container"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            autoFocus
            placeholder="Search across all tasks, projects, notes, reports, and reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['all', 'tasks', 'projects', 'notes', 'reports', 'reminders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-2 py-0.5 text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="all">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              {searchQuery ? 'No matching work items found.' : 'Type to search or select a category filter above.'}
            </div>
          ) : (
            results.map((res) => (
              <button
                key={`${res.type}-${res.id}`}
                onClick={() => handleSelect(res)}
                className="w-full p-3 rounded-2xl flex items-center justify-between text-left hover:bg-indigo-50/70 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 transition-colors">
                    {res.type === 'task' && <CheckSquare className="w-4 h-4" />}
                    {res.type === 'project' && <FolderKanban className="w-4 h-4" />}
                    {res.type === 'note' && <StickyNote className="w-4 h-4" />}
                    {res.type === 'report' && <FileText className="w-4 h-4" />}
                    {res.type === 'reminder' && <Bell className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {res.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {res.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
