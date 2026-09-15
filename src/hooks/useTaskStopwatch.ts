import { useMemo, useCallback } from 'react';
import { useWork } from '../context/WorkContext';
import { TaskItem, StopwatchState } from '../types';

export interface UseTaskStopwatchReturn {
  // State
  stopwatch: StopwatchState;
  activeTask: TaskItem | null;
  isRunning: boolean;
  isPaused: boolean;
  isIdle: boolean;
  elapsedSeconds: number;
  
  // Formatted Time strings
  formattedTime: string; // 'HH:MM:SS'
  hours: string;         // '00'
  minutes: string;       // '00'
  seconds: string;       // '00'

  // Actions
  start: (taskId?: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: (markCompleted?: boolean) => Promise<{ minutesSaved: number; taskTitle: string } | null>;
  reset: () => void;
  selectTask: (taskId: string | null) => void;
}

export function useTaskStopwatch(): UseTaskStopwatchReturn {
  const {
    stopwatch,
    activeStopwatchTask,
    startStopwatch,
    pauseStopwatch,
    resumeStopwatch,
    stopAndSaveStopwatch,
    resetStopwatch,
    selectStopwatchTask,
  } = useWork();

  const isRunning = stopwatch.status === 'running';
  const isPaused = stopwatch.status === 'paused';
  const isIdle = stopwatch.status === 'idle';

  // Compute HH:MM:SS parts
  const { hours, minutes, seconds, formattedTime } = useMemo(() => {
    const totalSecs = stopwatch.elapsedSeconds || 0;
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    return {
      hours: hh,
      minutes: mm,
      seconds: ss,
      formattedTime: `${hh}:${mm}:${ss}`,
    };
  }, [stopwatch.elapsedSeconds]);

  const start = useCallback(
    async (taskId?: string) => {
      await startStopwatch(taskId);
    },
    [startStopwatch]
  );

  const pause = useCallback(() => {
    pauseStopwatch();
  }, [pauseStopwatch]);

  const resume = useCallback(() => {
    resumeStopwatch();
  }, [resumeStopwatch]);

  // Links the active stopwatch time to the 'Actual Time' field of the selected task
  const stop = useCallback(
    async (markCompleted: boolean = false) => {
      return await stopAndSaveStopwatch(markCompleted);
    },
    [stopAndSaveStopwatch]
  );

  const reset = useCallback(() => {
    resetStopwatch();
  }, [resetStopwatch]);

  const selectTask = useCallback(
    (taskId: string | null) => {
      selectStopwatchTask(taskId);
    },
    [selectStopwatchTask]
  );

  return {
    stopwatch,
    activeTask: activeStopwatchTask,
    isRunning,
    isPaused,
    isIdle,
    elapsedSeconds: stopwatch.elapsedSeconds,
    formattedTime,
    hours,
    minutes,
    seconds,
    start,
    pause,
    resume,
    stop,
    reset,
    selectTask,
  };
}
