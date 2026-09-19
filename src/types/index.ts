export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export type ReminderRecurrence = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'custom';

export type ReminderChannel = 'browser' | 'in-app' | 'email' | 'all';

export type ReportType = 'daily' | 'weekly' | 'monthly';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  defaultWorkHours: {
    start: string; // e.g. "09:00"
    end: string;   // e.g. "17:00"
  };
  defaultTaskDuration: number; // minutes, default 60
  defaultReminderTime: number; // minutes before, default 15
  notificationPreferences: {
    browser: boolean;
    inApp: boolean;
    email: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
    soundEnabled: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface TaskItem {
  id: string;
  userId: string;
  projectId?: string;
  categoryId: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  dueDate: string;   // YYYY-MM-DD
  dueTime: string;   // HH:MM
  estimatedMinutes: number;
  actualMinutes: number;
  completedAt?: string;
  reminder?: {
    enabled: boolean;
    remindAt: string; // YYYY-MM-DDTHH:MM
    recurrence: ReminderRecurrence;
  };
  isRecurring?: boolean;
  recurrenceRule?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  attachments?: TaskAttachment[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  color: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderItem {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  remindAt: string; // ISO or YYYY-MM-DDTHH:MM
  recurrence: ReminderRecurrence;
  channel: ReminderChannel;
  isCompleted: boolean;
  isMissed: boolean;
  notes?: string;
  createdAt: string;
}

export interface DailyReportItem {
  id: string;
  userId: string;
  type: 'daily';
  reportDate: string; // YYYY-MM-DD
  title: string;
  plannedTasksCount: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
  productivity: number; // percentage 0-100
  estimatedHours: number;
  actualHours: number;
  challenges: string;
  achievements: string;
  notes: string;
  tasksSnapshot: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    projectName?: string;
    actualMinutes?: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  projectId?: string;
  isPinned: boolean;
  color: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  userId?: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'reminder' | 'deadline' | 'achievement' | 'system';
  read: boolean;
  actionUrl?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'today'
  | 'work'
  | 'tasks'
  | 'calendar'
  | 'planner'
  | 'analytics'
  | 'categories'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'projects'
  | 'reminders'
  | 'daily-reports'
  | 'weekly-reports'
  | 'monthly-reports'
  | 'notes'
  | 'landing';

export interface StopwatchState {
  taskId: string | null;
  status: 'idle' | 'running' | 'paused';
  elapsedSeconds: number;
  lastTickTimestamp: number | null;
}

export interface DailyGoalItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  slotNumber: number; // 1, 2, or 3
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  priority?: Priority;
  taskId?: string; // Optional linked task ID
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
