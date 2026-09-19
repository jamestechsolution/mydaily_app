import React, { useState, useMemo } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  FolderKanban,
  CheckCircle2,
  Clock,
  Palette,
  AlertCircle,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { CategoryItem } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

const COLOR_PRESETS = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const CategoriesView: React.FC = () => {
  const { categories, tasks, addCategory, deleteCategory } = useWork();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [catToDelete, setCatToDelete] = useState<CategoryItem | null>(null);

  // Calculate task counts per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; pending: number }> = {};
    categories.forEach((cat) => {
      stats[cat.id] = { total: 0, completed: 0, pending: 0 };
    });

    tasks.forEach((task) => {
      if (task.categoryId && stats[task.categoryId]) {
        stats[task.categoryId].total += 1;
        if (task.status === 'Completed') {
          stats[task.categoryId].completed += 1;
        } else {
          stats[task.categoryId].pending += 1;
        }
      }
    });

    return stats;
  }, [categories, tasks]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setError('Please enter a category name');
      return;
    }

    // Check duplicate
    if (categories.some((c) => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setError('A category with this name already exists');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await addCategory(newCatName.trim(), newCatColor);
      setNewCatName('');
    } catch (err: any) {
      setError(err?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCategory = selectedCatId
    ? categories.find((c) => c.id === selectedCatId) || categories[0]
    : null;

  const activeCategoryTasks = activeCategory
    ? tasks.filter((t) => t.categoryId === activeCategory.id)
    : [];

  return (
    <div id="categories-page" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Workspace Taxonomy</span>
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight mt-1">
            Task Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize tasks into high-level categories such as Work, Study, Personal, Development, Meetings, Projects, and Health.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Categories List & Create Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create New Custom Category Card */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Create Custom Category</span>
            </h2>

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    id="new-category-name-input"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Design System, Fitness, Clients..."
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Color swatch picker */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_PRESETS.slice(0, 8).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-7 h-7 rounded-xl transition-all ${
                        newCatColor === color
                          ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  id="create-category-submit-btn"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {categories.map((cat) => {
              const stat = categoryStats[cat.id] || { total: 0, completed: 0, pending: 0 };
              const isSelected = selectedCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(isSelected ? null : cat.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                        {cat.name}
                      </span>
                    </div>

                    {!cat.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCatToDelete(cat);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{stat.total} tasks total</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {stat.completed} completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Filtered Category Details & Tasks */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {activeCategory ? (
            <div>
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: activeCategory.color }}
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {activeCategory.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {activeCategoryTasks.length} task{activeCategoryTasks.length !== 1 ? 's' : ''} assigned
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {activeCategoryTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No tasks currently categorized under {activeCategory.name}.
                  </p>
                ) : (
                  activeCategoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            task.status === 'Completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {task.dueDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span>{task.priority}</span>
                        <span>•</span>
                        <span>{task.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Tag className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Select a category
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                Click any category on the left to inspect its active tasks and distribution.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!catToDelete}
        title="Delete Category"
        message="Are you sure you want to delete this custom category? Associated tasks will be preserved with uncategorized status."
        itemTitle={catToDelete?.name}
        onConfirm={async () => {
          if (catToDelete) {
            await deleteCategory(catToDelete.id);
            setCatToDelete(null);
            if (selectedCatId === catToDelete.id) {
              setSelectedCatId(null);
            }
          }
        }}
        onClose={() => setCatToDelete(null)}
      />
    </div>
  );
};
