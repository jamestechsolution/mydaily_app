/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WorkProvider, useWork } from './context/WorkContext';

// Auth Page
import { LoginPage } from './components/auth/LoginPage';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';

// Modals
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { TaskModal } from './components/work/TaskModal';
import { ReminderModal } from './components/reminders/ReminderModal';
import { AiAssistantModal } from './components/ai/AiAssistantModal';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { WorkView } from './components/work/WorkView';
import { ProjectsView } from './components/projects/ProjectsView';
import { CalendarView } from './components/calendar/CalendarView';
import { RemindersView } from './components/reminders/RemindersView';
import { DailyReportView } from './components/reports/DailyReportView';
import { WeeklyReportView } from './components/reports/WeeklyReportView';
import { MonthlyReportView } from './components/reports/MonthlyReportView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { NotesView } from './components/notes/NotesView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useWork();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Inter'] antialiased overflow-hidden">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky App Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          openAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Scrollable View Area */}
        <main
          id="main-content-scroll"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin pb-24 md:pb-8"
        >
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'work' && <WorkView />}
          {activeTab === 'projects' && <ProjectsView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'reminders' && <RemindersView />}
          {activeTab === 'daily-reports' && <DailyReportView />}
          {activeTab === 'weekly-reports' && <WeeklyReportView />}
          {activeTab === 'monthly-reports' && <MonthlyReportView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'notes' && <NotesView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Navigation & Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Global Modals */}
      <GlobalSearchModal />
      <TaskModal />
      <ReminderModal editingReminderId={null} onClose={() => {}} />
      <AiAssistantModal />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        id="loading-screen"
        className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-['Inter']"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20 animate-pulse">
            W
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-['Outfit']">
            Daily Work Manager
          </span>
        </div>
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 mt-3 font-medium">Preparing workspace...</p>
      </div>
    );
  }

  // Display Login Page first when opened and user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <WorkProvider>
      <MainLayout />
    </WorkProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
