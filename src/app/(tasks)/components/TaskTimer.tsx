'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pause, Play, PlusCircle, Square } from 'lucide-react'
import { useTimerStore } from '@/store/timerStore'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

interface TaskTimerProps {
  taskId: number 
  taskName: string
  taskStatus: string
  onTimeLogged?: () => void

}

const TaskTimer = ({ taskId, taskName, onTimeLogged, taskStatus }: TaskTimerProps) => {
  const [loading, setLoading] = useState(false)
  const [manualHours, setManualHours] = useState<string>('')
  const [manualMinutes, setManualMinutes] = useState<string>('')

  const isDone = taskStatus === 'done' || taskStatus === 'cancelled'
  


  // Subscribe only to this task's timer slot
  const timer = useTimerStore((state) => state.timers[taskId])
  const startTimer = useTimerStore((state) => state.startTimer)
  const pauseTimer = useTimerStore((state) => state.pauseTimer)
  const resumeTimer = useTimerStore((state) => state.resumeTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)

  const status = timer?.status ?? 'idle'
  const elapsedSeconds = timer?.elapsedSeconds ?? 0
  const isActive = !!timer

  const formatTime = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds))
    const hrs = Math.floor(total / 3600)
    const mins = Math.floor((total % 3600) / 60)
    const secs = total % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

  const handlePause = () => pauseTimer(taskId)
  const handleResume = () => resumeTimer(taskId)

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
    const hours = h + (m / 60)
    
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
    : 'bg-gray-400'

  const statusText = isDone
    ? 'Completed'
    : status === 'running'
    ? 'Running'
    : status === 'paused'
    ? 'Paused'
    : 'Stopped'

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-md border border-gray-200 dark:border-zinc-700 space-y-3">
      <h1 className='font-semibold text-lg'>Time Tracking</h1>
      <div className='border-b p-20 bg-secondary/10 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 space-y-3'>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{statusText}</span>
        </div>
      </div>

      {/* Time Display */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold tracking-wider text-gray-800 dark:text-zinc-100">
          {formatTime(elapsedSeconds)}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-zinc-400 mt-1 truncate">
          {taskName}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        {isDone ? (
          <Button size="sm" disabled className="gap-1">
            <Square className="h-4 w-4" /> Completed
          </Button>
        ) : (
          !isActive && status !== 'running' && status !== 'paused' && (
            <Button size="sm" onClick={handleStart} className="gap-1">
              <Play className="h-4 w-4" /> Start
            </Button>
          )
        )}

        {isActive && status === 'running' && (
          <>
            <Button size="sm" onClick={handlePause} disabled={loading} className="gap-1">
              <Pause className="h-4 w-4" /> Pause
            </Button>
            <Button size="sm" onClick={handleStop} disabled={loading} className="gap-1">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}

        {isActive && status === 'paused' && (
          <>
            <Button size="sm" variant="default" onClick={handleResume} disabled={loading} className="gap-1">
              <Play className="h-4 w-4" /> Resume
            </Button>
            <Button size="sm" variant="destructive" onClick={handleStop} disabled={loading} className="gap-1">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
      </div>

      {/* Manual time entry */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 flex-1">
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={manualHours}
            onChange={(e) => setManualHours(e.target.value)}
            className="h-8 w-14 text-center text-sm px-1"
            disabled={loading}
          />
          <span className="text-xs font-medium text-gray-500">h</span>
          <Input
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={manualMinutes}
            onChange={(e) => setManualMinutes(e.target.value)}
            className="h-8 w-14 text-center text-sm px-1"
            disabled={loading}
          />
          <span className="text-xs font-medium text-gray-500">m</span>
        </div>
        <Button
          size="sm"
          onClick={handleManualLog}
          disabled={
            loading || 
            (!manualHours && !manualMinutes) || 
            (Number(manualHours || 0) === 0 && Number(manualMinutes || 0) === 0)
          }
          className="gap-1"
        >
          <PlusCircle className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  </div>
  )
}

export default TaskTimer