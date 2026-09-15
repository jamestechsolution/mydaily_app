import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FolderKanban,
  Bell,
  FileText,
  FileSpreadsheet,
  BarChart3,
  StickyNote,
  Settings,
  Sparkles,
  CalendarRange,
  ChevronRight,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useWork } from '../../context/WorkContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  openAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, openAuthModal }) => {
  const { activeTab, setActiveTab, tasks, reminders, setIsAiModalOpen } = useWork();
  const { user, profile, logout } = useAuth();

  const todayStr = '2026-09-15';
  const pendingTodayCount = tasks.filter(
    (t) => t.dueDate === todayStr && t.status !== 'Completed' && t.status !== 'Cancelled'
  ).length;

  const activeRemindersCount = reminders.filter((r) => !r.isCompleted).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'work',
      label: 'My Work',
      icon: CheckSquare,
      badge: pendingTodayCount > 0 ? pendingTodayCount : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
      badge: activeRemindersCount > 0 ? activeRemindersCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    },
    { id: 'daily-reports', label: 'Daily Reports', icon: FileText },
    { id: 'weekly-reports', label: 'Weekly Reports', icon: CalendarRange },
    { id: 'monthly-reports', label: 'Monthly Reports', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
            <span className="font-['Outfit'] text-lg">DW</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight leading-tight text-base font-['Outfit']">
                Daily Work
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Manager SaaS
              </span>
            </div>
          )}
        </div>

        <button
          id="toggle-sidebar-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${
              collapsed ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* AI Assistant Quick Pill */}
      <div className="p-3">
        <button
          id="sidebar-ai-btn"
          onClick={() => setIsAiModalOpen(true)}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all font-medium text-xs shadow-xs group`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
          {!collapsed && <span>Work AI Assistant</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`}
              />
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge !== undefined && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* PWA Install Promotion in Sidebar when expanded */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <PWAInstallButton compact={false} />
        </div>
      )}

      {/* User Section at bottom */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        {user ? (
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-semibold text-xs shrink-0 border border-indigo-200 dark:border-indigo-800">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {profile?.name || 'My Account'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user.email || 'Cloud Session'}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                id="sidebar-logout-btn"
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            id="sidebar-login-btn"
            onClick={openAuthModal}
            className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors`}
          >
            <UserCheck className="w-4 h-4" />
            {!collapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
