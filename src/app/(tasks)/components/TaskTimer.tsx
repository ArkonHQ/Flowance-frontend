'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover'
import { Pause, Play, PlusCircle, Square, TimerIcon, Clock, TrendingUp } from 'lucide-react'
import { useTimerStore } from '@/store/timerStore'
import { cn } from '@/lib/utils'
import { getTodaySeconds, addTodaySeconds } from '@/lib/utils/todayHours'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

interface TaskTimerProps {
  taskId: number
  taskName: string
  startTime?: number | string | null
  taskStatus: string
  onTimeLogged?: () => void
}

// Formats raw seconds into HH:MM:SS or MM:SS for the big clock
const formatClock = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds))
  const hrs = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hrs > 0)
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Formats seconds into a human-readable label ex: 2h 35m
const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds))
  if (s === 0) return '0m'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const TaskTimer = ({ taskId, taskName, onTimeLogged, taskStatus, startTime }: TaskTimerProps) => {
  const [loading, setLoading] = useState(false)
  const [manualHours, setManualHours] = useState<string>('')
  const [manualMinutes, setManualMinutes] = useState<string>('')
  const [manualOpen, setManualOpen] = useState(false)


  // Hours
  const [totalSec, setTotalSec] = useState(0)
  const [todaySec, setTodaySec] = useState(0)

  // Hydrate on mount
  useEffect(() => {
    setTodaySec(getTodaySeconds(taskId))
  }, [taskId])

  const fetchHours = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/hours`, { credentials: 'include' })
      if (res.ok) {
        const d = await res.json()
        setTotalSec((Number(d.totalHours) || 0) * 3600)
      }
    } catch { /* None for now */ }
  }, [taskId])

  useEffect(() => { fetchHours() }, [fetchHours])
  useEffect(() => {
    const h = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.taskId === taskId) {
        fetchHours()
        setTodaySec(getTodaySeconds(taskId))
      }
    }
    window.addEventListener('taskTimeLogged', h)
    return () => window.removeEventListener('taskTimeLogged', h)
  }, [taskId, fetchHours])

  const hoursRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => { if (manualOpen) hoursRef.current?.focus() }, [manualOpen])

  const isDone = taskStatus === 'done' || taskStatus === 'cancelled'

  const timer = useTimerStore((s) => s.timers[taskId])
  const sessionLoaded = useTimerStore((s) => s.sessionLoaded)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const stopTimer = useTimerStore((s) => s.stopTimer)

  const status = timer?.status ?? 'idle'
  const elapsedSec = timer?.elapsedSeconds ?? 0
  const pastLoggedSec = timer?.pastLoggedSeconds ?? 0
  const isActive = !!timer

  /* live "today" chunk = running time not yet persisted */
  const liveChunk = status === 'running' ? Math.max(0, elapsedSec - pastLoggedSec) : 0
  const liveTodaySec = todaySec + liveChunk
  const liveTotalSec = Math.max(totalSec, elapsedSec)

  /* startDate for display */
  const parseStart = (val: any): Date | null => {
    if (!val) return null
    if (val instanceof Date) return val
    if (typeof val === 'string') { const d = new Date(val); return isNaN(d.getTime()) ? null : d }
    if (typeof val === 'number') { const ms = val > 1e12 ? val : val * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? null : d }
    return null
  }
  const startDate = parseStart(timer?.startTime) || parseStart(startTime)
  const startLabel = (() => {
    if (!startDate) return taskName
    const now = new Date()
    const timePart = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    return startDate.toDateString() === now.toDateString() ? `Started at ${timePart}` : `Started ${startDate.toLocaleString()}`
  })()

  /* ─ dot / label ──────────────────────────────────────────────── */
  const dotColor =
    taskStatus === 'cancelled' ? 'bg-red-500' :
      taskStatus === 'done' ? 'bg-emerald-400' :
        taskStatus === 'overdue' ? 'bg-rose-500' :
          status === 'running' ? 'bg-green-500 animate-pulse' :
            status === 'paused' ? 'bg-amber-400' : 'bg-muted-foreground/30'

  const statusText =
    taskStatus === 'cancelled' ? 'Cancelled' :
      taskStatus === 'done' ? 'Completed' :
          status === 'running' ? 'Running' :
            status === 'paused' ? 'Paused' : 'Idle'

  /* ─ handlers ─────────────────────────────────────────────────── */
  const handleStart = async () => {
    setLoading(true)
    try {
      await startTimer(taskId, taskName)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  const handlePause = async () => {
    setLoading(true)
    try { 
      await pauseTimer(taskId); onTimeLogged?.() 
    } catch (e) { console.error(e) } 
    finally { setLoading(false) }
  }
  const handleResume = async () => {
    setLoading(true)
    try {
      await resumeTimer(taskId)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  const handleStop = async () => {
    setLoading(true)
    try {
      await stopTimer(taskId); onTimeLogged?.(); fetchHours()
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleManualLog = async () => {
    const h = parseInt(manualHours || '0', 10)
    const m = parseInt(manualMinutes || '0', 10)
    const hours = h + m / 60
    if (isNaN(hours) || hours <= 0) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
        credentials: 'include',
      })
      if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.message || `Error ${res.status}`) }
      addTodaySeconds(taskId, hours * 3600)
      onTimeLogged?.()
      window.dispatchEvent(new CustomEvent('taskTimeLogged', { detail: { taskId, hours } }))
      setManualHours(''); setManualMinutes(''); setManualOpen(false)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const manualPreview = (() => {
    const h = Math.max(0, parseInt(manualHours || '0', 10) || 0)
    const m = Math.max(0, parseInt(manualMinutes || '0', 10) || 0)
    if (h === 0 && m === 0) return 'No time entered'
    return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(' ')
  })()

  const onPopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setManualOpen(false)
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!loading && !(Number(manualHours || 0) === 0 && Number(manualMinutes || 0) === 0)) handleManualLog()
    }
  }

  /* ────────────────────────────────────────────────────────────── */
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card">

      {/* ── accent bar ─── */}
      <div className={cn(
        'h-[2px] w-full transition-all duration-500',
        status === 'running' ? 'bg-linear-to-r from-transparent via-emerald-400 to-transparent'
          : status === 'paused' ? 'bg-linear-to-r from-transparent via-amber-400/70 to-transparent'
            : 'bg-linear-to-r from-transparent via-border to-transparent'
      )} />

      <div className="p-4 space-y-4">
        {/* ── header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Time Tracking</span>
          <div className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', dotColor)} />
            <span className="text-xs font-medium text-muted-foreground">{statusText}</span>
          </div>
        </div>

        {/* ── big clock ────────────────────────────────────────── */}
        <div className="text-center py-2">
          <div className={cn(
            'text-5xl font-mono font-bold tracking-tight tabular-nums transition-colors',
            status === 'running' ? 'text-foreground'
              : status === 'paused' ? 'text-amber-500 dark:text-amber-400'
                : 'text-muted-foreground/50'
          )}>
            {formatClock(elapsedSec)}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 truncate">{startLabel}</p>
        </div>

        {/* ── stat row: Today · Total ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Today</span>
            </div>
            <span className="text-base font-bold tabular-nums">{formatDuration(liveTodaySec)}</span>
          </div>
          <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg bg-violet-500/5 border border-violet-500/10">
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Total</span>
            </div>
            <span className="text-base font-bold tabular-nums">{formatDuration(liveTotalSec)}</span>
          </div>
        </div>

        {/* ── control buttons ──────────────────────────────────── */}
        <div className="flex justify-center gap-3">
          {!sessionLoaded ? (
            <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
          ) : isDone ? (
            <Button size="sm" disabled className="h-10 w-36 gap-1.5 rounded-lg opacity-60">
              <Square className="h-4 w-4" />
              {taskStatus === 'cancelled' ? 'Cancelled' : 'Completed'}
            </Button>
          ) : (
            <>
              {(!isActive || status === 'idle') && (
                <Button size="sm" onClick={handleStart} disabled={loading}
                  className="h-10 w-36 gap-1.5 rounded-lg bg-primary hover:bg-primary/90 shadow-sm">
                  <Play className="h-4 w-4 fill-current" /> Start
                </Button>
              )}
              {isActive && status === 'running' && (
                <>
                  <Button size="sm" onClick={handlePause} disabled={loading}
                    className="h-10 gap-1.5 px-5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white border-0">
                    <Pause className="h-4 w-4 fill-white" /> Pause
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleStop} disabled={loading}
                    className="h-10 px-4 rounded-lg">
                    <Square className="h-4 w-4 fill-white" />
                  </Button>
                </>
              )}
              {isActive && status === 'paused' && (
                <>
                  <Button size="sm" onClick={handleResume} disabled={loading}
                    className="h-10 gap-1.5 px-5 rounded-lg bg-primary hover:bg-primary/90 shadow-sm">
                    <Play className="h-4 w-4 fill-current" /> Resume
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleStop} disabled={loading}
                    className="h-10 px-4 rounded-lg">
                    <Square className="h-4 w-4 fill-white" />
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* ── manual time ──────────────────────────────────────── */}
        <div className="pt-1 border-t border-border/40">
          <Popover open={manualOpen} onOpenChange={setManualOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={loading || isDone}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-40"
              >
                <TimerIcon className="h-4 w-4" />
                Add manual time
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px]" onKeyDown={onPopoverKeyDown}>
              <PopoverHeader>
                <PopoverTitle>Manual time entry</PopoverTitle>
                <PopoverDescription>Enter hours and minutes to log time.</PopoverDescription>
              </PopoverHeader>

              <div className="grid gap-3 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Hours</label>
                    <Input ref={hoursRef} type="number" min="0" placeholder="0"
                      value={manualHours} onChange={(e) => setManualHours(e.target.value)}
                      className="h-10 text-center" disabled={loading} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Minutes</label>
                    <Input type="number" min="0" max="59" placeholder="0"
                      value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)}
                      className="h-10 text-center" disabled={loading} />
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground text-center font-medium">
                  {manualPreview}
                </div>

                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setManualOpen(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleManualLog}
                    disabled={loading || (Number(manualHours || 0) === 0 && Number(manualMinutes || 0) === 0)}>
                    Add time
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export default TaskTimer
