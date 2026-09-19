/**
 * Date and time utility functions for Daily Work Manager
 * Ensures dynamic local dates and greeting calculations without hardcoded timestamps.
 */

export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString(referenceDate: Date = new Date()): string {
  const d = new Date(referenceDate);
  d.setDate(d.getDate() + 1);
  return getTodayDateString(d);
}

export function getWeekDates(referenceDate: Date | string = new Date()): WeekDayInfo[] {
  let d: Date;
  if (typeof referenceDate === 'string') {
    const parts = referenceDate.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(referenceDate);
    }
  } else {
    d = referenceDate;
  }
  return getWeekDays(d);
}

export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

export function formatDateLong(dateInput: Date | string = new Date()): string {
  let d: Date;
  if (typeof dateInput === 'string') {
    // Avoid UTC shift for YYYY-MM-DD strings
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = dateInput;
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateInput: Date | string = new Date()): string {
  let d: Date;
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = dateInput;
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || '0', 10);
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

export type DayPeriod = 'Morning' | 'Afternoon' | 'Evening';

export function getTaskDayPeriod(dueTime?: string): DayPeriod {
  if (!dueTime) return 'Morning';
  const hour = parseInt(dueTime.split(':')[0], 10);
  if (isNaN(hour)) return 'Morning';

  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export interface WeekDayInfo {
  dayName: string; // 'Monday', 'Tuesday', etc.
  dayShort: string; // 'Mon', 'Tue', etc.
  dateString: string; // 'YYYY-MM-DD'
  dayNumber: number; // 1 to 31
  isToday: boolean;
}

export function getWeekDays(referenceDate: Date = new Date(), weekOffset: number = 0): WeekDayInfo[] {
  const curr = new Date(referenceDate);
  if (weekOffset !== 0) {
    curr.setDate(curr.getDate() + weekOffset * 7);
  }

  // Calculate Monday of this week (1 = Mon, 7 = Sun)
  const day = curr.getDay();
  // If Sunday (0), distance to Monday is -6, else 1 - day
  const diff = curr.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(curr.setDate(diff));

  const todayStr = getTodayDateString(new Date());
  const week: WeekDayInfo[] = [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayShorts = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateString = getTodayDateString(d);

    week.push({
      dayName: dayNames[i],
      dayShort: dayShorts[i],
      dateString,
      dayNumber: d.getDate(),
      isToday: dateString === todayStr,
    });
  }

  return week;
}

export function isTaskOverdue(dueDate: string, dueTime?: string, status?: string): boolean {
  if (status === 'Completed' || status === 'Cancelled') return false;
  const todayStr = getTodayDateString();
  if (dueDate < todayStr) return true;
  if (dueDate === todayStr && dueTime) {
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return dueTime < currentHHMM;
  }
  return false;
}
