import React, { useState } from 'react';
import {
  FolderPlus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  MoreVertical,
  Check,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ProjectModal } from './ProjectModal';
import { Priority, ProjectStatus } from '../../types';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    tasks,
    deleteProject,
    setIsProjectModalOpen,
    setIsTaskModalOpen,
    setEditingTaskId,
    setActiveTab,
  } = useWork();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !(p.description || '').toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Low':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div id="projects-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Group your daily work into strategic initiatives, roadmaps, and client goals
          </p>
        </div>

        <button
          id="create-project-btn"
          onClick={() => {
            setEditingProjectId(null);
            setIsProjectModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const completedTasks = projectTasks.filter((t) => t.status === 'Completed').length;
          const progressPercent =
            projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

          const totalEstimatedMinutes = projectTasks.reduce(
            (acc, t) => acc + (t.estimatedMinutes || 0),
            0
          );
          const totalActualMinutes = projectTasks.reduce(
            (acc, t) => acc + (t.actualMinutes || 0),
            0
          );

          return (
            <div
              key={project.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {project.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadge(
                      project.priority
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="my-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Progress</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: project.color || '#6366f1',
                      }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {completedTasks}/{projectTasks.length} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {(totalActualMinutes / 60).toFixed(1)} /{' '}
                      {(totalEstimatedMinutes / 60).toFixed(1)} hrs
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Target End: {project.endDate}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingTaskId(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingProjectId(project.id);
                      setIsProjectModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                    title="Edit project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Modal */}
      <ProjectModal
        editingProjectId={editingProjectId}
        onClose={() => setEditingProjectId(null)}
      />
    </div>
  );
};
