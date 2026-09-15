import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  TaskItem,
  ProjectItem,
  ReminderItem,
  DailyReportItem,
  NoteItem,
  CategoryItem,
  ActiveTab,
  AppNotification,
  TaskStatus,
  Priority,
  StopwatchState,
} from '../types';
import { WorkStorageService, DEFAULT_CATEGORIES } from '../lib/storage';
import { notificationAudio } from '../lib/audio';

interface FilterOptions {
  search: string;
  status: TaskStatus | 'All';
  priority: Priority | 'All';
  projectId: string | 'All';
  categoryId: string | 'All';
  dateRange: 'all' | 'today' | 'upcoming' | 'overdue';
}

interface WorkContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tasks: TaskItem[];
  projects: ProjectItem[];
  reminders: ReminderItem[];
  notes: NoteItem[];
  reports: DailyReportItem[];
  categories: CategoryItem[];
  notifications: AppNotification[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  // Task operations
  addTask: (task: Omit<TaskItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  // Project operations
  addProject: (proj: Omit<ProjectItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<ProjectItem>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Reminder operations
  addReminder: (rem: Omit<ReminderItem, 'id' | 'userId' | 'createdAt' | 'isCompleted' | 'isMissed'>) => Promise<string>;
  updateReminder: (id: string, updates: Partial<ReminderItem>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminderComplete: (id: string) => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  notificationPermission: NotificationPermission;
  // Report operations
  saveDailyReport: (report: Omit<DailyReportItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  deleteReport: (id: string) => Promise<void>;
  // Note operations
  addNote: (note: Omit<NoteItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNote: (id: string, updates: Partial<NoteItem>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  // Category operations
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Notification operations
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  // Global actions
  clearData: () => Promise<void>;
  // Workflow flags
  showMorningWorkflow: boolean;
  setShowMorningWorkflow: (show: boolean) => void;
  showEveningWorkflow: boolean;
  setShowEveningWorkflow: (show: boolean) => void;
  // Quick creation modal states
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  isReminderModalOpen: boolean;
  setIsReminderModalOpen: (open: boolean) => void;
  isProjectModalOpen: boolean;
  setIsProjectModalOpen: (open: boolean) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  // Stopwatch & Actual Time Tracking
  stopwatch: StopwatchState;
  activeStopwatchTask: TaskItem | null;
  startStopwatch: (taskId?: string) => Promise<void>;
  pauseStopwatch: () => void;
  resumeStopwatch: () => void;
  stopAndSaveStopwatch: (markCompleted?: boolean) => Promise<{ minutesSaved: number; taskTitle: string } | null>;
  resetStopwatch: () => void;
  selectStopwatchTask: (taskId: string | null) => void;
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const userId = user?.uid || 'guest-user';

  const storageService = useMemo(() => new WorkStorageService(userId), [userId]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [reports, setReports] = useState<DailyReportItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Workflow trigger banners
  const [showMorningWorkflow, setShowMorningWorkflow] = useState(false);
  const [showEveningWorkflow, setShowEveningWorkflow] = useState(false);

  // Quick modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'All',
    priority: 'All',
    projectId: 'All',
    categoryId: 'All',
    dateRange: 'all',
  });

  // Persistent Stopwatch State for tracking Actual Time on tasks
  const STOPWATCH_KEY = `dwm_${userId}_stopwatch`;
  const [stopwatch, setStopwatch] = useState<StopwatchState>(() => {
    try {
      const saved = localStorage.getItem(`dwm_${userId}_stopwatch`);
      if (saved) {
        const parsed: StopwatchState = JSON.parse(saved);
        if (parsed.status === 'running' && parsed.lastTickTimestamp) {
          const now = Date.now();
          const delta = Math.max(0, Math.floor((now - parsed.lastTickTimestamp) / 1000));
          return {
            ...parsed,
            elapsedSeconds: parsed.elapsedSeconds + delta,
            lastTickTimestamp: now,
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading stopwatch state', e);
    }
    return {
      taskId: null,
      status: 'idle',
      elapsedSeconds: 0,
      lastTickTimestamp: null,
    };
  });

  // Keep localStorage in sync with stopwatch
  useEffect(() => {
    try {
      localStorage.setItem(STOPWATCH_KEY, JSON.stringify(stopwatch));
    } catch (e) {
      console.warn('Failed to save stopwatch state', e);
    }
  }, [stopwatch, STOPWATCH_KEY]);

  // Stopwatch ticking interval with delta tracking
  useEffect(() => {
    let timer: any = null;
    if (stopwatch.status === 'running') {
      timer = setInterval(() => {
        setStopwatch((prev) => {
          if (prev.status !== 'running') return prev;
          const now = Date.now();
          const delta = prev.lastTickTimestamp
            ? Math.max(1, Math.floor((now - prev.lastTickTimestamp) / 1000))
            : 1;
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + delta,
            lastTickTimestamp: now,
          };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [stopwatch.status]);

  // Subscribe to real-time data collections
  useEffect(() => {
    if (!userId) return;

    // Purge any lingering demo seed markers
    try {
      localStorage.removeItem(`dwm_${userId}_has_seeded`);
      localStorage.removeItem('dwm_demo-user-101_has_seeded');
    } catch {}

    const unsubs = [
      storageService.subscribeCollection<TaskItem>('tasks', (items) => {
        setTasks(items);
      }, 'tasks'),

      storageService.subscribeCollection<ProjectItem>('projects', (items) => {
        setProjects(items);
      }, 'projects'),

      storageService.subscribeCollection<ReminderItem>('reminders', (items) => {
        setReminders(items);
      }, 'reminders'),

      storageService.subscribeCollection<NoteItem>('notes', (items) => {
        setNotes(items);
      }, 'notes'),

      storageService.subscribeCollection<DailyReportItem>('reports', (items) => {
        setReports(items);
      }, 'reports'),

      storageService.subscribeCollection<CategoryItem>('categories', (items) => {
        if (items.length > 0) {
          setCategories(items);
        } else {
          setCategories(DEFAULT_CATEGORIES);
          storageService.initUserCategories();
        }
      }, 'categories'),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [userId, storageService]);

  // Request browser notification permission
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      return perm;
    }
    return 'denied';
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Automated daily workflow logic
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();

    // Morning workflow: between 6:00 and 11:59
    if (hours >= 6 && hours < 12) {
      const dismissed = sessionStorage.getItem('dwm_morning_dismissed');
      if (!dismissed) {
        setShowMorningWorkflow(true);
      }
    }
    // Evening report workflow: 16:00 onwards
    if (hours >= 16) {
      const dismissed = sessionStorage.getItem('dwm_evening_dismissed');
      if (!dismissed) {
        setShowEveningWorkflow(true);
      }
    }
  }, []);

  // Reminder check engine (runs every 20 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nowIso = now.toISOString();

      reminders.forEach((rem) => {
        if (rem.isCompleted) return;

        const remDate = new Date(rem.remindAt);
        const diffMs = remDate.getTime() - now.getTime();

        // If reminder is within 1 minute or just passed within 5 minutes
        if (diffMs <= 60000 && diffMs >= -300000) {
          const alreadyNotified = notifications.some((n) => n.id === `notif-${rem.id}`);
          if (!alreadyNotified) {
            // 1. Play chime if sound enabled
            if (profile?.notificationPreferences?.soundEnabled ?? true) {
              notificationAudio.playChime();
            }

            // 2. Browser notification if allowed
            if (
              (rem.channel === 'browser' || rem.channel === 'all') &&
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification(`Reminder: ${rem.title}`, {
                  body: `Scheduled for ${new Date(rem.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                  icon: '/favicon.ico',
                });
              } catch (err) {
                console.warn('Browser notification error:', err);
              }
            }

            // 3. Add to In-App Notification Center
            const newNotif: AppNotification = {
              id: `notif-${rem.id}`,
              title: `Reminder: ${rem.title}`,
              message: `Scheduled at ${new Date(rem.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              timestamp: nowIso,
              type: 'reminder',
              read: false,
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 20000);
    checkReminders();
    return () => clearInterval(interval);
  }, [reminders, notifications, profile]);

  // Task methods
  const addTask = async (
    taskData: Omit<TaskItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    const newTask: TaskItem = {
      ...taskData,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    await storageService.saveItem('tasks', newTask);

    // If task has a reminder enabled, create reminder item as well
    if (taskData.reminder?.enabled && taskData.reminder.remindAt) {
      await addReminder({
        taskId: id,
        title: taskData.title,
        remindAt: taskData.reminder.remindAt,
        recurrence: taskData.reminder.recurrence,
        channel: 'all',
        notes: taskData.description,
      });
    }

    return id;
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return;

    const updated: TaskItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await storageService.saveItem('tasks', updated);
  };

  const deleteTask = async (id: string) => {
    await storageService.deleteItem('tasks', id);
  };

  const duplicateTask = async (id: string) => {
    const original = tasks.find((t) => t.id === id);
    if (!original) return;

    const idNew = `task-${Date.now()}`;
    const now = new Date().toISOString();
    const duplicated: TaskItem = {
      ...original,
      id: idNew,
      title: `${original.title} (Copy)`,
      status: 'Pending',
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };
    await storageService.saveItem('tasks', duplicated);
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const isNowCompleted = task.status !== 'Completed';
    const now = new Date().toISOString();

    if (isNowCompleted && (profile?.notificationPreferences?.soundEnabled ?? true)) {
      notificationAudio.playSuccess();
    }

    const updated: TaskItem = {
      ...task,
      status: isNowCompleted ? 'Completed' : 'Pending',
      completedAt: isNowCompleted ? now : undefined,
      actualMinutes: isNowCompleted && task.actualMinutes === 0 ? task.estimatedMinutes : task.actualMinutes,
      updatedAt: now,
    };

    await storageService.saveItem('tasks', updated);
  };

  // Project methods
  const addProject = async (
    projData: Omit<ProjectItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const id = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const newProj: ProjectItem = {
      ...projData,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    await storageService.saveItem('projects', newProj);
    return id;
  };

  const updateProject = async (id: string, updates: Partial<ProjectItem>) => {
    const existing = projects.find((p) => p.id === id);
    if (!existing) return;
    const updated: ProjectItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await storageService.saveItem('projects', updated);
  };

  const deleteProject = async (id: string) => {
    await storageService.deleteItem('projects', id);
  };

  // Reminder methods
  const addReminder = async (
    remData: Omit<ReminderItem, 'id' | 'userId' | 'createdAt' | 'isCompleted' | 'isMissed'>
  ): Promise<string> => {
    const id = `rem-${Date.now()}`;
    const now = new Date().toISOString();
    const newRem: ReminderItem = {
      ...remData,
      id,
      userId,
      isCompleted: false,
      isMissed: false,
      createdAt: now,
    };
    await storageService.saveItem('reminders', newRem);
    return id;
  };

  const updateReminder = async (id: string, updates: Partial<ReminderItem>) => {
    const existing = reminders.find((r) => r.id === id);
    if (!existing) return;
    const updated: ReminderItem = {
      ...existing,
      ...updates,
    };
    await storageService.saveItem('reminders', updated);
  };

  const deleteReminder = async (id: string) => {
    await storageService.deleteItem('reminders', id);
  };

  const toggleReminderComplete = async (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    if (!rem) return;
    await updateReminder(id, { isCompleted: !rem.isCompleted });
  };

  // Report methods
  const saveDailyReport = async (
    repData: Omit<DailyReportItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const id = `rep-${Date.now()}`;
    const now = new Date().toISOString();
    const newRep: DailyReportItem = {
      ...repData,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    await storageService.saveItem('reports', newRep);
    return id;
  };

  const deleteReport = async (id: string) => {
    await storageService.deleteItem('reports', id);
  };

  // Note methods
  const addNote = async (
    noteData: Omit<NoteItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...noteData,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    };
    await storageService.saveItem('notes', newNote);
    return id;
  };

  const updateNote = async (id: string, updates: Partial<NoteItem>) => {
    const existing = notes.find((n) => n.id === id);
    if (!existing) return;
    const updated: NoteItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await storageService.saveItem('notes', updated);
  };

  const deleteNote = async (id: string) => {
    await storageService.deleteItem('notes', id);
  };

  const togglePinNote = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await updateNote(id, { isPinned: !note.isPinned });
  };

  // Category methods
  const addCategory = async (name: string, color: string) => {
    const id = `cat-${Date.now()}`;
    const newCat: CategoryItem = { id, userId, name, color, isDefault: false };
    await storageService.saveItem('categories', newCat);
  };

  const deleteCategory = async (id: string) => {
    await storageService.deleteItem('categories', id);
  };

  // Notification methods
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Global operations
  const clearData = async () => {
    await storageService.clearAllData();
    setTasks([]);
    setProjects([]);
    setReminders([]);
    setNotes([]);
    setReports([]);
    setNotifications([]);
  };

  // Stopwatch calculations and handlers
  const activeStopwatchTask = useMemo(() => {
    if (!stopwatch.taskId) return null;
    return tasks.find((t) => t.id === stopwatch.taskId) || null;
  }, [stopwatch.taskId, tasks]);

  const selectStopwatchTask = (taskId: string | null) => {
    setStopwatch((prev) => ({
      ...prev,
      taskId,
    }));
  };

  const startStopwatch = async (taskId?: string) => {
    const targetId = taskId || stopwatch.taskId;
    const now = Date.now();

    if (targetId) {
      const task = tasks.find((t) => t.id === targetId);
      if (task && task.status === 'Pending') {
        // Automatically switch task status to In Progress
        await updateTask(targetId, { status: 'In Progress' });
      }
    }

    setStopwatch((prev) => ({
      taskId: targetId || prev.taskId,
      status: 'running',
      elapsedSeconds: targetId && targetId !== prev.taskId && taskId ? 0 : prev.elapsedSeconds,
      lastTickTimestamp: now,
    }));
  };

  const pauseStopwatch = () => {
    setStopwatch((prev) => ({
      ...prev,
      status: 'paused',
      lastTickTimestamp: null,
    }));
  };

  const resumeStopwatch = () => {
    setStopwatch((prev) => ({
      ...prev,
      status: 'running',
      lastTickTimestamp: Date.now(),
    }));
  };

  const resetStopwatch = () => {
    setStopwatch((prev) => ({
      ...prev,
      status: 'idle',
      elapsedSeconds: 0,
      lastTickTimestamp: null,
    }));
  };

  const stopAndSaveStopwatch = async (markCompleted: boolean = false) => {
    const targetTaskId = stopwatch.taskId;
    const seconds = stopwatch.elapsedSeconds;

    // Reset stopwatch state
    setStopwatch({
      taskId: null,
      status: 'idle',
      elapsedSeconds: 0,
      lastTickTimestamp: null,
    });

    if (!targetTaskId || seconds < 5) {
      return null;
    }

    const task = tasks.find((t) => t.id === targetTaskId);
    if (!task) return null;

    // Calculate actual minutes tracked (at least 1 minute)
    const minutesToAdd = Math.max(1, Math.round(seconds / 60));
    const currentActual = task.actualMinutes || 0;
    const newActualMinutes = currentActual + minutesToAdd;

    const updates: Partial<TaskItem> = {
      actualMinutes: newActualMinutes,
    };

    if (markCompleted) {
      updates.status = 'Completed';
      updates.completedAt = new Date().toISOString();
    }

    await updateTask(targetTaskId, updates);

    // Play chime sound if enabled
    if (profile?.notificationPreferences?.soundEnabled ?? true) {
      notificationAudio.playSuccess();
    }

    // In-app achievement/notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Actual Time Logged',
      message: `Added ${minutesToAdd}m to "${task.title}". Total actual time: ${newActualMinutes}m.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'achievement',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      minutesSaved: minutesToAdd,
      taskTitle: task.title,
    };
  };

  return (
    <WorkContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        projects,
        reminders,
        notes,
        reports,
        categories,
        notifications,
        filters,
        setFilters,
        addTask,
        updateTask,
        deleteTask,
        duplicateTask,
        toggleTaskComplete,
        addProject,
        updateProject,
        deleteProject,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminderComplete,
        requestNotificationPermission,
        notificationPermission,
        saveDailyReport,
        deleteReport,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addCategory,
        deleteCategory,
        markNotificationRead,
        clearAllNotifications,
        clearData,
        showMorningWorkflow,
        setShowMorningWorkflow,
        showEveningWorkflow,
        setShowEveningWorkflow,
        isTaskModalOpen,
        setIsTaskModalOpen,
        editingTaskId,
        setEditingTaskId,
        isReminderModalOpen,
        setIsReminderModalOpen,
        isProjectModalOpen,
        setIsProjectModalOpen,
        isAiModalOpen,
        setIsAiModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        stopwatch,
        activeStopwatchTask,
        startStopwatch,
        pauseStopwatch,
        resumeStopwatch,
        stopAndSaveStopwatch,
        resetStopwatch,
        selectStopwatchTask,
      }}
    >
      {children}
    </WorkContext.Provider>
  );
};

export const useWork = () => {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error('useWork must be used within a WorkProvider');
  }
  return context;
};
