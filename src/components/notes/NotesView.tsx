import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Search,
  Tag,
  Save,
  X,
  FolderKanban,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { NoteItem } from '../../types';

export const NotesView: React.FC = () => {
  const { notes, projects, addNote, updateNote, deleteNote } = useWork();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Daily' | 'Meeting' | 'Project' | 'Idea' | 'General'>('General');
  const [projectId, setProjectId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  const filteredNotes = notes.filter((n) => {
    if (
      searchQuery &&
      !n.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !n.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedCategory !== 'all' && n.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const handleOpenEditor = (note?: NoteItem) => {
    if (note) {
      setEditingNoteId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setProjectId(note.projectId || '');
      setTags(note.tags || []);
      setIsPinned(note.isPinned);
    } else {
      setEditingNoteId(null);
      setTitle('');
      setContent('');
      setCategory('General');
      setProjectId('');
      setTags([]);
      setIsPinned(false);
    }
    setIsEditing(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) return;

    if (editingNoteId) {
      await updateNote(editingNoteId, {
        title: title.trim(),
        content: content.trim(),
        category,
        projectId: projectId || undefined,
        tags,
        isPinned,
      });
    } else {
      await addNote({
        title: title.trim(),
        content: content.trim(),
        category,
        projectId: projectId || undefined,
        tags,
        isPinned,
      });
    }

    setIsEditing(false);
    setEditingNoteId(null);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
    }
    setTagInput('');
  };

  const togglePinNote = async (note: NoteItem) => {
    await updateNote(note.id, { isPinned: !note.isPinned });
  };

  return (
    <div id="notes-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Work Notes & Scratchpad
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture spontaneous thoughts, sprint retrospectives, and client meeting memos
          </p>
        </div>

        <button
          onClick={() => handleOpenEditor()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes content or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="all">All Notes</option>
            <option value="Daily">Daily</option>
            <option value="Meeting">Meeting</option>
            <option value="Project">Project</option>
            <option value="Idea">Idea</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Note Editor Drawer / Modal */}
      {isEditing && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500/50 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-indigo-600" />
              <span>{editingNoteId ? 'Edit Note' : 'Create New Note'}</span>
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              >
                <option value="General">General</option>
                <option value="Daily">Daily Note</option>
                <option value="Meeting">Meeting Minutes</option>
                <option value="Project">Project Memo</option>
                <option value="Idea">Product Idea</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Content
            </label>
            <textarea
              rows={6}
              placeholder="Write Markdown, action items, or notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span>Pin to top</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Notes Grid */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" />
            <span>Pinned Notes</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/20 border-2 border-indigo-200/80 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {note.title}
                    </h4>
                    <button
                      onClick={() => togglePinNote(note)}
                      className="text-indigo-600 dark:text-indigo-400"
                      title="Unpin"
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditor(note)}
                      className="p-1 hover:text-indigo-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes Grid */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Other Notes
          </h3>
        )}

        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No notes created yet. Click "New Note" to record your thoughts.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {note.title}
                    </h4>
                    <button
                      onClick={() => togglePinNote(note)}
                      className="text-slate-300 hover:text-indigo-600"
                      title="Pin note"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditor(note)}
                      className="p-1 hover:text-indigo-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
