import { create } from 'zustand';

interface TimerState {
  activeTaskId: number | null;
  taskName: string;
  status: 'idle' | 'running' | 'paused';
  startTime: Date | null;
  pausedAt: Date | null;
  totalPausedSeconds: number;
  elapsedSeconds: number;
  
  startTimer: (taskId: number, taskName: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => Promise<void>;
  resetTimer: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export const useTimerStore = create<TimerState>((set, get) => ({
  activeTaskId: null,
  taskName: '',
  status: 'idle',
  startTime: null,
  pausedAt: null,
  totalPausedSeconds: 0,
  elapsedSeconds: 0,

  startTimer: async (taskId, taskName) => {
    set({
      activeTaskId: taskId,
      taskName,
      status: 'running',
      startTime: new Date(),
      pausedAt: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
    });

    try{
    const res = await fetch (`${API_BASE}/tasks/${taskId}/timer/start`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        startTime: new Date().toISOString(),
      })
    })
      if (!res.ok) throw new Error(`Failed to start timer: ${res.status}`)
      console.log(`Started timer for task ${taskId}`)
    } catch (err) {
      console.error(err)
    }
  },

  pauseTimer: () => {
    const { status } = get();
    if (status === 'running') {
      set({ status: 'paused', pausedAt: new Date() });
    }
  },

  resumeTimer: () => {
    const { status, pausedAt, totalPausedSeconds, startTime } = get();
    if (status === 'paused' && pausedAt && startTime) {
      const now = new Date();
      const pauseDuration = (now.getTime() - pausedAt.getTime()) / 1000;
      set({
        status: 'running',
        totalPausedSeconds: totalPausedSeconds + pauseDuration,
        pausedAt: null,
      });
    }
  },

  stopTimer: async () => {
    const { activeTaskId, startTime, totalPausedSeconds, pausedAt, status } = get();
    if (!activeTaskId || !startTime) return;
    
    // Compute total seconds
    const now = new Date();
    let totalPaused = totalPausedSeconds;
    if (status === 'paused' && pausedAt) {
      totalPaused += (now.getTime() - pausedAt.getTime()) / 1000;
    }
    const totalSeconds = (now.getTime() - startTime.getTime()) / 1000 - totalPaused;
    const hours = totalSeconds / 3600;
    if (hours <= 0) return;

    try {
      // Send stop request to backend
      const payload = {
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        manual: false,
      }
      console.log('Stopping timer payload:', payload)
      const res = await fetch(`${API_BASE}/tasks/${activeTaskId}/timer/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const text = await res.text().catch(() => null)
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) { data = null }
      if (!res.ok) {
        console.error('Stop timer failed:', res.status, text)
        throw new Error('Failed to log time')
      }

      const loggedHours = data?.hours ?? hours
      console.log(`Logged ${loggedHours} hours for task ${activeTaskId}`);
      // Notify UI to refresh analytics/dashboard
      try {
        window.dispatchEvent(new CustomEvent('taskTimeLogged', { detail: { taskId: activeTaskId, hours: loggedHours } }))
      } catch (e) {
        // window may be undefined in some environments; ignore
      }

      // Reset timer after successful stop
      get().resetTimer();
    } catch (err) {
      console.error(err);
    }
  },

  resetTimer: () => {
    set({
      activeTaskId: null,
      taskName: '',
      status: 'idle',
      startTime: null,
      pausedAt: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
    });
  },
}));