import { create } from 'zustand';

export interface SingleTimer {
  taskId: number;
  taskName: string;
  status: 'running' | 'paused';
  startTime: Date;
  pausedAt: Date | null;
  totalPausedSeconds: number;
  elapsedSeconds: number;
}

interface MultiTimerState {
  timers: Record<number, SingleTimer>;

  startTimer: (taskId: number, taskName: string) => Promise<void>;
  pauseTimer: (taskId: number) => void;
  resumeTimer: (taskId: number) => void;
  stopTimer: (taskId: number) => Promise<void>;
  getTimer: (taskId: number) => SingleTimer | undefined;


  /** Convenience: list of all currently running/paused timers */
  activeTimers: () => SingleTimer[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api';

export const useTimerStore = create<MultiTimerState>((set, get) => ({
  timers: {},

  getTimer: (taskId) => get().timers[taskId],

  activeTimers: () => Object.values(get().timers),

  startTimer: async (taskId, taskName) => {
    const now = new Date();

    // If already running/paused for this task, do nothing
    if (get().timers[taskId]) return;

    set((state) => ({
      timers: {
        ...state.timers,
        [taskId]: {
          taskId,
          taskName,
          status: 'running',
          startTime: now,
          pausedAt: null,
          totalPausedSeconds: 0,
          elapsedSeconds: 0,
        },
      },
    }));

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ startTime: now.toISOString() }),
      });
      if (!res.ok) throw new Error(`Failed to start timer: ${res.status}`);
      console.log(`[MultiTimer] Started timer for task ${taskId}`);
    } catch (err) {
      console.error('[MultiTimer] startTimer error:', err);
    }
  },

  pauseTimer: (taskId) => {
    const timer = get().timers[taskId];
    if (!timer || timer.status !== 'running') return;

    set((state) => ({
      timers: {
        ...state.timers,
        [taskId]: { ...timer, status: 'paused', pausedAt: new Date() },
      },
    }));
  },

  resumeTimer: (taskId) => {
    const timer = get().timers[taskId];
    if (!timer || timer.status !== 'paused' || !timer.pausedAt) return;

    const now = new Date();
    const pauseDuration = (now.getTime() - new Date(timer.pausedAt).getTime()) / 1000;

    set((state) => ({
      timers: {
        ...state.timers,
        [taskId]: {
          ...timer,
          status: 'running',
          pausedAt: null,
          totalPausedSeconds: timer.totalPausedSeconds + pauseDuration,
        },
      },
    }));
  },

  stopTimer: async (taskId) => {
    const timer = get().timers[taskId];
    if (!timer) return;

    const now = new Date();
    let totalPaused = timer.totalPausedSeconds;
    if (timer.status === 'paused' && timer.pausedAt) {
      totalPaused += (now.getTime() - new Date(timer.pausedAt).getTime()) / 1000;
    }

    const totalSeconds =
      (now.getTime() - new Date(timer.startTime).getTime()) / 1000 - totalPaused;
    const hours = totalSeconds / 3600;

    if (totalSeconds <= 0) {
      console.warn(`[MultiTimer] Task ${taskId} had 0 or negative seconds — skipping log.`);
      set((state) => {
        const next = { ...state.timers };
        delete next[taskId];
        return { timers: next };
      });
      return;
    }

    try {
      const payload = {
        startTime: timer.startTime.toISOString(),
        endTime: now.toISOString(),
        hours: hours,
        manual: false,
      };
      console.log(`[MultiTimer] Stopping task ${taskId}:`, payload);

      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => null);
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }

      if (!res.ok) {
        console.error('[MultiTimer] Stop timer failed:', res.status, text);
        throw new Error('Failed to log time');
      }

      const loggedHours = data?.hours ?? hours;
      console.log(`[MultiTimer] Logged ${loggedHours}h for task ${taskId}`);

      try {
        window.dispatchEvent(
          new CustomEvent('taskTimeLogged', {
            detail: { taskId, hours: loggedHours },
          })
        );
      } catch { /* SSR safety */ }
    } catch (err) {
      console.error('[MultiTimer] stopTimer error:', err);
    } finally {
      // Always remove from map after stop attempt
      set((state) => {
        const next = { ...state.timers };
        delete next[taskId];
        return { timers: next };
      });
    }
  },
}));

if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useTimerStore.getState();
    const runningIds = Object.values(state.timers).filter((t) => t.status === 'running');
    if (runningIds.length === 0) return;

    const now = new Date();
    useTimerStore.setState((prev) => {
      const updated = { ...prev.timers };
      for (const t of runningIds) {
        const elapsed = Math.max(
          0,
          (now.getTime() - new Date(t.startTime).getTime()) / 1000 - t.totalPausedSeconds
        );
        updated[t.taskId] = { ...updated[t.taskId], elapsedSeconds: elapsed };
      }
      return { timers: updated };
    });
  }, 1000);
}