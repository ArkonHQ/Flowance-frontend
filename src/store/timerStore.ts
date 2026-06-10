import { create } from 'zustand';

export interface SingleTimer {
  taskId: number;
  taskName: string;
  status: 'running' | 'paused' | 'stopped';
  startTime: Date;
  pausedAt: Date | null;
  totalPausedSeconds: number;
  elapsedSeconds: number;

  /* Total hours already logged to DB for this task (from previous chunks) */
  pastLoggedSeconds: number;
}

interface MultiTimerState {
  timers: Record<number, SingleTimer>;
  /*
    false until loadSession() finishes backend reconciliation.
    Use this in TaskTimer to show a skeleton instead of the Start button1
    while the first network call is in flight.
   */
  sessionLoaded: boolean;

  startTimer: (taskId: number, taskName: string) => Promise<void>;
  pauseTimer: (taskId: number) => Promise<void>;
  resumeTimer: (taskId: number) => Promise<void>;
  stopTimer: (taskId: number) => Promise<void>;
  loadSession: () => Promise<void>;
  getTimer: (taskId: number) => SingleTimer | undefined;
  activeTimers: () => SingleTimer[];

  _saveToLocalStorage: () => void;
  _clearLocalStorage: () => void;
  saveSession: () => Promise<void>;
  deleteSession: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api';
const LS_KEY = 'fcc_timer_cache';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/* Fetch total past logged hours for a task and return as seconds */
async function fetchPastLoggedSeconds(taskId: number): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/hours`, {
      credentials: 'include',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return (Number(data.totalHours) || 0) * 3600;
  } catch {
    return 0;
  }
}

/* Serialize timers to plain JSON (Dates → ISO strings) for localStorage */
function serializeTimers(timers: Record<number, SingleTimer>) {
  const out: Record<string, any> = {};
  for (const key in timers) {
    const t = timers[key];
    out[key] = {
      ...t,
      startTime: t.startTime instanceof Date ? t.startTime.toISOString() : t.startTime,
      pausedAt: t.pausedAt instanceof Date ? t.pausedAt.toISOString() : t.pausedAt,
    };
  }
  return out;
}

/* Deserialize timers from localStorage (ISO strings → Dates) */
function deserializeTimers(raw: Record<string, any>): Record<number, SingleTimer> {
  const out: Record<number, SingleTimer> = {};
  for (const key in raw) {
    const t = raw[key];
    out[Number(key)] = {
      ...t,
      startTime: new Date(t.startTime),
      pausedAt: t.pausedAt ? new Date(t.pausedAt) : null,
    };
  }
  return out;
}

/*
  Read localStorage SYNCHRONOUSLY — called before the store is created so
  the initial 'timers' state is already populated. The component sees the
  correct timer on its very first render; no useEffect delay, no "Start"
  button flash.
 */
function loadFromLocalStorage(): Record<number, SingleTimer> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? deserializeTimers(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTimerStore = create<MultiTimerState>((set, get) => ({
  // Pre-populated synchronously from localStorage → component sees correct
  // state on first render without waiting for any effect/fetch.
  timers: loadFromLocalStorage(),
  sessionLoaded: false,

  getTimer: (taskId) => get().timers[taskId],
  activeTimers: () => Object.values(get().timers),

  _saveToLocalStorage: () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(serializeTimers(get().timers)));
    } catch { /* ignore */ }
  },

  _clearLocalStorage: () => {
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  },

  // ─── Start ─────────────────────────────────────────────────────────────────
  startTimer: async (taskId, taskName) => {
    if (get().timers[taskId]) return;

    const now = new Date();
    const pastLoggedSeconds = 0; // Always start from zero for a new session

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
          elapsedSeconds: pastLoggedSeconds,
          pastLoggedSeconds,
        },
      },
    }));
    get()._saveToLocalStorage();

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ startTime: now.toISOString() }),
      });
      if (!res.ok) throw new Error(`Failed to start timer: ${res.status}`);
      await get().saveSession();
      console.log(`[Timer] Started task ${taskId}`);
    } catch (err) {
      console.error('[Timer] startTimer error:', err);
    }
  },

  // ─── Pause ─────────────────────────────────────────────────────────────────
  pauseTimer: async (taskId) => {
    const timer = get().timers[taskId];
    if (!timer || timer.status !== 'running') return;

    const now = new Date();
    const currentChunkSeconds =
      (now.getTime() - new Date(timer.startTime).getTime()) / 1000 - timer.totalPausedSeconds;

    // instantly switch to paused state so UI responds
    const estimatedLoggedHours = currentChunkSeconds / 3600;
    const optimisticPastLoggedSeconds = timer.pastLoggedSeconds + estimatedLoggedHours * 3600;

    set((state) => ({
      timers: {
        ...state.timers,
        [taskId]: {
          ...timer,
          status: 'paused',
          pausedAt: now,
          startTime: now,
          totalPausedSeconds: 0,
          elapsedSeconds: optimisticPastLoggedSeconds,
          pastLoggedSeconds: optimisticPastLoggedSeconds,
        },
      },
    }));
    get()._saveToLocalStorage();

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          startTime: timer.startTime.toISOString(),
          totalPausedSeconds: timer.totalPausedSeconds,
        }),
      });
      if (!res.ok) throw new Error(`Failed to pause timer: ${res.status}`);
      const data = await res.json();

      const loggedHours = data?.hours ?? estimatedLoggedHours;
      const actualPastLoggedSeconds = timer.pastLoggedSeconds + loggedHours * 3600;

      set((state) => {
        const currentTimer = state.timers[taskId];
        if (currentTimer && currentTimer.status === 'paused') {
          return {
            timers: {
              ...state.timers,
              [taskId]: {
                ...currentTimer,
                elapsedSeconds: actualPastLoggedSeconds,
                pastLoggedSeconds: actualPastLoggedSeconds,
              }
            }
          };
        }
        return state;
      });
      get()._saveToLocalStorage();

      try {
        window.dispatchEvent(
          new CustomEvent('taskTimeLogged', { detail: { taskId, hours: loggedHours } })
        );
      } catch { /* SSR */ }

      console.log(`[Timer] Paused task ${taskId}, logged ${loggedHours.toFixed(4)}h`);
    } catch (err) {
      console.error('[Timer] pauseTimer error:', err);
      // We optimistically paused the UI, so log the error but don't revert.
      // The user is not stuck.
    }
  },

  // ─── Resume ────────────────────────────────────────────────────────────────
  resumeTimer: async (taskId) => {
    const timer = get().timers[taskId];
    if (!timer || timer.status !== 'paused') return;

    const now = new Date();

    set((state) => ({
      timers: {
        ...state.timers,
        [taskId]: {
          ...timer,
          status: 'running',
          startTime: now,
          pausedAt: null,
          totalPausedSeconds: 0,
          elapsedSeconds: timer.pastLoggedSeconds,
        },
      },
    }));
    get()._saveToLocalStorage();

    try {
      await fetch(`${API_BASE}/tasks/${taskId}/timer/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ startTime: now.toISOString() }),
      });
      await get().saveSession();
      console.log(`[Timer] Resumed task ${taskId}`);
    } catch (err) {
      console.error('[Timer] resumeTimer error:', err);
    }
  },

  // ─── Stop ──────────────────────────────────────────────────────────────────
  stopTimer: async (taskId) => {
    const timer = get().timers[taskId];
    if (!timer) return;

    const previousTimer = { ...timer };
    const now = new Date();

    const removeTimer = () => {
      set((state) => {
        const nextTimers = { ...state.timers };
        delete nextTimers[taskId];
        return { timers: nextTimers };
      });
      get()._saveToLocalStorage();
    };

    const restoreTimer = () => {
      set((state) => ({
        timers: {
          ...state.timers,
          [taskId]: previousTimer,
        },
      }));
      get()._saveToLocalStorage();
    };

    if (timer.status === 'paused') {
      removeTimer();
      await get().deleteSession();
      return;
    }

    const totalSeconds =
      (now.getTime() - new Date(timer.startTime).getTime()) / 1000 - timer.totalPausedSeconds;
    const hours = totalSeconds / 3600;

    if (totalSeconds <= 0) {
      console.warn(`[Timer] Task ${taskId} had 0 seconds — skipping log.`);
      removeTimer();
      await get().deleteSession();
      return;
    }

    removeTimer();

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          startTime: timer.startTime.toISOString(),
          endTime: now.toISOString(),
          hours,
          manual: false,
        }),
      });

      const text = await res.text().catch(() => null);
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }

      if (!res.ok) {
        console.error('[Timer] Stop failed:', res.status, text);
        throw new Error('Failed to log time');
      }

      const loggedHours = data?.hours ?? hours;
      console.log(`[Timer] Stopped task ${taskId}, logged ${loggedHours.toFixed(4)}h`);

      try {
        window.dispatchEvent(
          new CustomEvent('taskTimeLogged', { detail: { taskId, hours: loggedHours } })
        );
      } catch { /* SSR */ }
    } catch (err) {
      console.error('[Timer] stopTimer error:', err);
      restoreTimer();
    } finally {
      await get().deleteSession();
    }
  },

  // ─── Load Session (reconcile with backend on page load) ────────────────────
  //
  // localStorage was already loaded synchronously at store creation so the
  // component sees the correct state on its very first render — no "Start"
  // button flash. This function only hits the backend to:
  //   1. Confirm the running session's authoritative startTime.
  //   2. Clear any stale 'running' timers if the backend has no session.
  //   3. Set sessionLoaded = true so the TaskTimer can stop showing skeleton UI.
  //
  loadSession: async () => {
    try {
      const res = await fetch(`${API_BASE}/timer/session`, { credentials: 'include' });

      if (!res.ok) {
        // Backend unreachable — trust localStorage, unblock UI
        set({ sessionLoaded: true });
        return;
      }

      const data = await res.json();

      if (data?.session) {
        const s = data.session;
        set((state) => {
          const existingTimer = state.timers[s.taskId];
          const pastLoggedSeconds = existingTimer ? existingTimer.pastLoggedSeconds : 0;

          return {
            sessionLoaded: true,
            timers: {
              ...state.timers,
              [s.taskId]: {
                taskId: s.taskId,
                taskName: s.taskName,
                status: 'running',
                startTime: new Date(s.startTime),
                pausedAt: null,
                totalPausedSeconds: s.totalPausedSeconds,
                elapsedSeconds: pastLoggedSeconds,
                pastLoggedSeconds,
              },
            },
          };
        });
        get()._saveToLocalStorage();
        console.log(`[Timer] Backend confirmed running session for task ${s.taskId}`);
      } else {
        // No active backend session — keep 'paused' timers (they have no backend
        // session by design), but clear any stale 'running' ones.
        let changed = false;
        set((state) => {
          const next = { ...state.timers };
          for (const key in next) {
            if (next[Number(key)].status === 'running') {
              delete next[Number(key)];
              changed = true;
            }
          }
          return { timers: next, sessionLoaded: true };
        });
        if (changed) get()._saveToLocalStorage();
      }
    } catch (e) {
      console.error('[Timer] loadSession backend error:', e);
      // Network error — keep localStorage state; still unblock the UI
      set({ sessionLoaded: true });
    }
  },

  // ─── Backend session persistence ───────────────────────────────────────────
  saveSession: async () => {
    try {
      const t = Object.values(get().timers).find((t) => t.status === 'running');
      if (!t) return;

      await fetch(`${API_BASE}/timer/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: t.taskId,
          taskName: t.taskName,
          status: t.status,
          startTime: t.startTime.toISOString(),
          totalPausedSeconds: t.totalPausedSeconds,
        }),
        credentials: 'include',
      });
    } catch (e) {
      console.error('[Timer] saveSession error:', e);
    }
  },

  deleteSession: async () => {
    try {
      await fetch(`${API_BASE}/timer/session`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (e) {
      console.error('[Timer] deleteSession error:', e);
    }
  },
}));

// ─── 1-second tick — only updates running timers ──────────────────────────────
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useTimerStore.getState();
    const running = Object.values(state.timers).filter((t) => t.status === 'running');
    if (running.length === 0) return;

    const now = new Date();
    useTimerStore.setState((prev) => {
      const updated = { ...prev.timers };
      for (const t of running) {
        const chunkSeconds = Math.max(
          0,
          (now.getTime() - new Date(t.startTime).getTime()) / 1000 - t.totalPausedSeconds
        );
        updated[t.taskId] = {
          ...updated[t.taskId],
          // Display = past logged chunks + current running chunk
          elapsedSeconds: t.pastLoggedSeconds + chunkSeconds,
        };
      }
      return { timers: updated };
    });
  }, 50);
}