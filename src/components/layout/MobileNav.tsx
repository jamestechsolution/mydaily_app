import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  MoreHorizontal,
  FolderKanban,
  Bell,
  BarChart3,
  StickyNote,
  Settings,
  Sparkles,
  X,
  CalendarRange,
  FileSpreadsheet,
  SunMedium,
  CalendarDays,
  Tags,
  User,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { ActiveTab } from '../../types';
import { getTodayDateString } from '../../utils/dateUtils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  openAuthModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, openAuthModal }) => {
  const { activeTab, setActiveTab, tasks, reminders, setIsAiModalOpen } = useWork();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const todayStr = getTodayDateString();
  const pendingCount = tasks.filter(
    (t) => t.dueDate === todayStr && t.status !== 'Completed' && t.status !== 'Cancelled'
  ).length;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
    onClose();
  };

  const moreItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'today', label: "Today's Tasks", icon: SunMedium },
    { id: 'planner', label: 'Weekly Planner', icon: CalendarDays },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'daily-reports', label: 'Daily Reports', icon: FileText },
    { id: 'weekly-reports', label: 'Weekly Reports', icon: CalendarRange },
    { id: 'monthly-reports', label: 'Monthly Reports', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 flex items-center justify-around z-30"
      >
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleSelectTab('work')}
          className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors relative ${
            activeTab === 'work'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span>Work</span>
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </button>

        {/* AI Quick Button in center */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
          title="AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleSelectTab('calendar')}
          className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-medium transition-colors ${
            drawerOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Drawer (Menu & More) */}
      {(isOpen || drawerOpen) && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  DW
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">
                  Daily Work Manager
                </h2>
              </div>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onClose();
                }}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 my-4">
              <button
                onClick={() => handleSelectTab('dashboard')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                <span className="text-xs">Dashboard</span>
              </button>
              <button
                onClick={() => handleSelectTab('work')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition-all ${
                  activeTab === 'work'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckSquare className="w-5 h-5 text-indigo-500" />
                <span className="text-xs">My Work</span>
              </button>
              <button
                onClick={() => handleSelectTab('calendar')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span className="text-xs">Calendar</span>
              </button>
              <button
                onClick={() => handleSelectTab('daily-reports')}
                className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition-all ${
                  activeTab === 'daily-reports'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FileText className="w-5 h-5 text-indigo-500" />
                <span className="text-xs">Daily Reports</span>
              </button>

              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`p-3 rounded-2xl flex items-center gap-3 border text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-slate-500" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  onClose();
                  openAuthModal();
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 py-2"
              >
                Account / Switch Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
