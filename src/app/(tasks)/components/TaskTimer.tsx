'use client'

import { useState, useRef, useEffect } from 'react'
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
import { Pause, Play, PlusCircle, Square, TimerIcon } from 'lucide-react'
import { useTimerStore } from '@/store/timerStore'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

interface TaskTimerProps {
  taskId: number
  taskName: string
  startTime?: number | string | null
  taskStatus: string
  onTimeLogged?: () => void
}

const TaskTimer = ({ taskId, taskName, onTimeLogged, taskStatus, startTime }: TaskTimerProps) => {
  const [loading, setLoading] = useState(false)
  const [manualHours, setManualHours] = useState<string>('')
  const [manualMinutes, setManualMinutes] = useState<string>('')
  const [manualOpen, setManualOpen] = useState(false)

  const hoursRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (manualOpen) hoursRef.current?.focus()
  }, [manualOpen])

  const isDone = taskStatus === 'done' || taskStatus === 'cancelled'

  // Subscribe only to this task's timer slot
  const timer = useTimerStore((state) => state.timers[taskId])
  const sessionLoaded = useTimerStore((state) => state.sessionLoaded)
  const startTimer = useTimerStore((state) => state.startTimer)
  const pauseTimer = useTimerStore((state) => state.pauseTimer)
  const resumeTimer = useTimerStore((state) => state.resumeTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)

  const startFromTimer = timer?.startTime ?? null
  const startFromProp = startTime ?? null

  const parseStart = (val: any): Date | null => {
    if (!val) return null
    if (val instanceof Date) return val
    if (typeof val === 'string') {
      const d = new Date(val)
      return isNaN(d.getTime()) ? null : d
    }
    if (typeof val === 'number') {
      // if timestamp looks like seconds, convert to ms
      const maybeMs = val > 1e12 ? val : val * 1000
      const d = new Date(maybeMs)
      return isNaN(d.getTime()) ? null : d
    }
    return null
  }

  const startDate = parseStart(startFromTimer) || parseStart(startFromProp)

  const formatStartDisplay = (d: Date | null) => {
    if (!d) return taskName
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const timePart = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    if (isToday) return `Started At ${timePart}`
    return `Started At ${d.toLocaleString()}`
  }

  const status = timer?.status ?? 'idle'
  const elapsedSeconds = timer?.elapsedSeconds ?? 0
  const isActive = !!timer

  const formatTime = (seconds: number, status?: string) => {
    const total = Math.max(0, Math.floor(seconds))
    const hrs = Math.floor(total / 3600)
    const mins = Math.floor((total % 3600) / 60)
    const secs = total % 60
    
    let msNode = null
    if (status === 'running') {
      const ms = Math.floor((seconds - total) * 100)
      msNode = <span className="text-xl text-muted-foreground ml-1">.{ms.toString().padStart(2, '0')}</span>
    }

    const mainStr = hrs > 0 
      ? `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

    return (
      <>
        {mainStr}
        {msNode}
      </>
    )
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      await startTimer(taskId, taskName)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async () => {
    setLoading(true)
    try {
      await pauseTimer(taskId)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async () => {
    setLoading(true)
    try {
      await resumeTimer(taskId)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await stopTimer(taskId)
      onTimeLogged?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
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
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        throw new Error(errorBody?.message || `Failed to log manual time (${res.status})`)
      }
      onTimeLogged?.()
      window.dispatchEvent(new CustomEvent('taskTimeLogged', { detail: { taskId, hours } }))
      setManualHours('')
      setManualMinutes('')
      setManualOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const dotColor = isDone
    ? 'bg-gray-400'
    : status === 'running'
    ? 'bg-green-500 animate-pulse'
    : status === 'paused'
    ? 'bg-yellow-500'
    : status === 'stopped'
    ? 'bg-gray-500'
    : 'bg-gray-400'

  const statusText = isDone
    ? 'Completed'
    : status === 'running'
    ? 'Running'
    : status === 'paused'
    ? 'Paused'
    : status === 'stopped'
    ? 'Stopped'
    : 'Stopped'

  const formatManualPreview = (hStr: string, mStr: string) => {
    const h = Math.max(0, parseInt(hStr || '0', 10) || 0)
    const m = Math.max(0, parseInt(mStr || '0', 10) || 0)
    if (h === 0 && m === 0) return 'No time entered'
    const parts: string[] = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    return parts.join(' ')
  }

  const manualPreview = formatManualPreview(manualHours, manualMinutes)

  const onPopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setManualOpen(false)
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!loading && !(Number(manualHours || 0) === 0 && Number(manualMinutes || 0) === 0)) {
        handleManualLog()
      }
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-md border border-gray-200 dark:border-zinc-700 space-y-3">
        <h1 className="font-semibold text-lg">Time Tracking</h1>
      <div className="border-b p-4 bg-secondary/10 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{statusText}</span>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold tracking-wider text-gray-800 dark:text-zinc-100 min-w-[150px]">
            {formatTime(elapsedSeconds, status)}
          </div>
          <div className="text-sm font-medium text-muted-foreground dark:text-zinc-400 mt-1 truncate">
            {formatStartDisplay(startDate)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          {/* While session is reconciling with backend, show nothing (localStorage
              already shows the correct timer state above) */}
          {!sessionLoaded ? (
            <div className="h-11 w-28 rounded-md bg-muted animate-pulse" />
          ) : isDone ? (
            <Button size="lg" disabled className="h-11 w-28 gap-1">
              <Square className="h-4 w-4" /> Completed
            </Button>
          ) : (
            (!isActive || status === 'stopped') && (
              <Button size="lg" onClick={handleStart} disabled={loading} className="h-11 w-28 gap-1">
                <Play className="h-4 w-4" /> Start
              </Button>
            )
          )}

          {sessionLoaded && isActive && status === 'running' && (
            <>
              <Button size="lg" onClick={handlePause} disabled={loading} className="h-11 w-28 gap-1">
                <Pause className="h-4 w-4" /> Pause
              </Button>
              <Button size="lg" variant="destructive" onClick={handleStop} disabled={loading} className="h-11 w-28 gap-1">
                <Square className="h-4 w-4" /> Stop
              </Button>
            </>
          )}

          {sessionLoaded && isActive && status === 'paused' && (
            <>
              <Button size="lg" variant="default" onClick={handleResume} disabled={loading} className="h-11 w-28 gap-1">
                <Play className="h-4 w-4" /> Resume
              </Button>
              <Button size="lg" variant="destructive" onClick={handleStop} disabled={loading} className="h-11 w-28 gap-1">
                <Square className="h-4 w-4" /> Stop
              </Button>
            </>
          )}

          {sessionLoaded && isActive && status === 'stopped' && (
            <Button size="lg" onClick={handleStart} disabled={loading} className="h-11 w-28 gap-1">
              <Play className="h-4 w-4" /> Start
            </Button>
          )}
        </div>

        {/* Manual time entry (popover) */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <Popover open={manualOpen} onOpenChange={setManualOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-white dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                disabled={loading || isDone}
              >
                <TimerIcon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                <span className="text-sm font-medium text-primary">Add manual time</span>
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-[320px] max-w-[90vw]" onKeyDown={onPopoverKeyDown}>
              <PopoverHeader>
                <PopoverTitle>Manual time entry</PopoverTitle>
                <PopoverDescription>Enter hours and minutes to log time quickly.</PopoverDescription>
              </PopoverHeader>

              <div className="grid gap-3 pt-3">
                <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-zinc-950">
                  <span className="text-sm text-slate-500 dark:text-zinc-500">Hours</span>
                  <Input
                    ref={hoursRef}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    className="h-11 w-full rounded-lg border-slate-200 bg-white text-center text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-zinc-950">
                  <span className="text-sm text-slate-500 dark:text-zinc-500">Minutes</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    className="h-11 w-full rounded-lg border-slate-200 bg-white text-center text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-700"
                    disabled={loading}
                  />
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-zinc-950 dark:text-zinc-400">
                  {manualPreview}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="ghost" onClick={() => setManualOpen(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleManualLog}
                    disabled={loading || (Number(manualHours || 0) === 0 && Number(manualMinutes || 0) === 0)}
                  >
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
