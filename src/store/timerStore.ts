import { create } from 'zustand';
import { addTodaySeconds } from '@/lib/utils/todayHours';

export interface SingleTimer {
  taskId: number;
  taskName: string;
  status: 'running' | 'paused' | 'idle'
  startTime: Date;
  pausedAt: Date | null;
  totalPausedSeconds: number;
  elapsedSeconds: number;

  /* Total hours already logged to DB for this task */
  pastLoggedSeconds: number;
}

interface MultiTimerState {
  timers: Record<number, SingleTimer>;
  /*
    false until loadSession() finishes backend reconciliation.
    Use this in TaskTimer to show a skeleton instead of the Start button
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
const fetchPastLoggedSeconds = async (taskId: number): Promise<number> => {
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
const serializeTimers = (timers: Record<number, SingleTimer>) => {
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
const deserializeTimers = (raw: Record<string, any>): Record<number, SingleTimer> => {
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
  const loadFromLocalStorage = (): Record<number, SingleTimer> => {
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
  activeTimers: () => Object.values(get().timers).filter(t => t.status === 'running' || t.status === 'paused'),

  _saveToLocalStorage: () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(serializeTimers(get().timers)));
    } catch { /* ignore */ }
  },

  _clearLocalStorage: () => {
    try { localStorage.removeItem(LS_KEY); } catch { /* None */ }
  },

  // ─── Start ─────────────────────────────────────────────────────────────────
  //  Fetches pastLoggedSeconds so the timer continues from the total already logged.
  startTimer: async (taskId, taskName) => {
    const existing = get().timers[taskId]
    if(existing && existing.status === 'running') return
    
    const now = new Date();

    if (existing && existing.status === 'idle') {
      set((state) => ({
        timers: {
          ...state.timers,
          [taskId]: {
            ...existing,
            status: 'running',
            startTime: now,
            pausedAt: null,
            totalPausedSeconds: 0,
            elapsedSeconds: existing.pastLoggedSeconds,
          },
        },
        activeTimerId: taskId,
      }))
      get()._saveToLocalStorage()

      try{
        await fetch(`${API_BASE}/tasks/${taskId}/timer/start`, {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          credentials: 'include',
          body: JSON.stringify({ startTime: now.toISOString() })
        })
      }catch(err) {
        console.error(err)
      }
      return
    }



    const pastLoggedSeconds = await fetchPastLoggedSeconds(taskId);

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
        addTodaySeconds(taskId, loggedHours * 3600);
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

    const now = new Date();

    // If already paused just mark as idle
    if (timer.status === 'paused') {
      set((state) => ({
        timers:{
          ...state.timers,
          [taskId]: {
            ...timer,
            status: 'idle',
            elapsedSeconds: timer.pastLoggedSeconds,
          },
        },
        activeTimerId: null,
      }))
      get()._saveToLocalStorage()
      await get().deleteSession()

      // Dispatch event so dashboard & task-page stats refresh
      try {
        window.dispatchEvent(
          new CustomEvent('taskTimeLogged', { detail: { taskId, hours: 0 } })
        );
      } catch { /* SSR */ }

      return
    }

    const totalSeconds = (now.getTime() - timer.startTime.getTime()) / 1000 - timer.totalPausedSeconds

    const hours = totalSeconds / 3600

    if(hours <= 0){
      set((state) => ({
        timers:{
          ...state.timers,
          [taskId]:{
            ...timer,
            status: 'idle',
            elapsedSeconds: timer.pastLoggedSeconds,
          },
        },
        activeTimerId: null,
      }))

      get()._saveToLocalStorage()
      await get().deleteSession()
      return 
    }

    try{
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/stop`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          startTime: timer.startTime.toISOString(),
          hours: hours,
        }),
        credentials: 'include'
      })
      const data = await res.json()
      const loggedHours = data?.hours ?? hours
      const loggedSeconds = loggedHours * 3600
      const newPast = timer.pastLoggedSeconds + loggedSeconds

      set((state) => ({
        timers:{
          ...state.timers,
          [taskId]: {
            ...timer,
            status: 'idle',
            pastLoggedSeconds: newPast,
            elapsedSeconds: newPast,
            startTime: new Date(),
            pausedAt: null,
            totalPausedSeconds: 0,
          },
        },
        activeTimerId: null
      }))

      get()._saveToLocalStorage()
      addTodaySeconds(taskId, loggedSeconds)
      window.dispatchEvent(new CustomEvent('taskTimeLogged', {detail: {taskId, hours: loggedHours}}))
    }catch (err) {
      console.error('[Timer] stopTimer error:', err)
    }finally{
      await get().deleteSession()
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
  //   4.  Fetch fresh pastLoggedSeconds to ensure cumulative total.
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
        //  Fresh fetch for pastLoggedSeconds (important for accumulative timer)
        const pastLoggedSeconds = await fetchPastLoggedSeconds(s.taskId);

        set((state) => ({
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
        }));
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
//  Reduced from 50ms to 1000ms for performance.
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
  }, 100);
}