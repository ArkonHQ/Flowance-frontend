'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pause, Play, PlusCircle, Square } from "lucide-react"
import { useTimerStore } from "@/store/timerStore"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

const getJsonHeaders = () => ({
  'Content-Type': 'application/json',
})



interface TaskTimerProps {
  taskId: number
  taskName: string
  onTimeLogged?: () => void
}

const TaskTimer = ({ taskId, taskName, onTimeLogged }: TaskTimerProps) => {
  const [loading, setLoading] = useState(false)
  const [manualHours, setManualHours] = useState<string>('')

  const activeTaskId = useTimerStore((state) => state.activeTaskId)
  const status = useTimerStore((state) => state.status)
  const elapsedSeconds = useTimerStore((state) => state.elapsedSeconds)
  const startTimer = useTimerStore((state) => state.startTimer)
  const pauseTimer = useTimerStore((state) => state.pauseTimer)
  const resumeTimer = useTimerStore((state) => state.resumeTimer)
  const stopTimer = useTimerStore((state) => state.stopTimer)

  const isActiveTask = activeTaskId === taskId
  const otherTaskRunning = activeTaskId !== null && !isActiveTask

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    if (otherTaskRunning) return

    setLoading(true)
    try {
      await startTimer(taskId, taskName)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handlePause = () => {
    if (isActiveTask && status === 'running') {
      pauseTimer()
    }
  }

  const handleResume = () => {
    if (isActiveTask && status === 'paused') {
      resumeTimer()
    }
  }

  const handleStop = async () => {
    if (!isActiveTask) return

    setLoading(true)
    try {
      await stopTimer()
      onTimeLogged?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleManualLog = async () => {
    const hours = parseFloat(manualHours)
    if (isNaN(hours) || hours <= 0) {
      setLoading(false)
      return
    }
    setLoading(true)

    try {
      
      const res = await fetch(`${API_BASE}/tasks/${taskId}/timer/manual`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ hours }),
        credentials: 'include'
      })
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        throw new Error(errorBody?.message || `Failed to log manual time (${res.status})`)
      }
      
      onTimeLogged?.()
      window.dispatchEvent(new CustomEvent('taskTimeLogged', { detail: { taskId, hours } }))
      setManualHours('')

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Status dot color 
  const dotColor = {
    idle: 'bg-gray-400',
    running: 'bg-green-500',
    paused: 'bg-yellow-500',
  }[isActiveTask ? status : 'idle']

  const statusText = isActiveTask
    ? status === 'running'
      ? 'Running'
      : status === 'paused'
      ? 'Paused'
      : 'Stopped'
    : otherTaskRunning
    ? 'Another timer running'
    : 'Stopped'


  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
      {/* Header with status dot and name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-xs font-medium text-gray-500">{statusText}</span>
        </div>
      </div>

      {/* Time Display */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold tracking-wider text-gray-800">
          {formatTime(isActiveTask ? elapsedSeconds : 0)}
        </div>
        <div className="text-sm font-medium text-gray-600 mt-1 truncate">{taskName}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        {!isActiveTask && !otherTaskRunning && (
          <Button size={'sm'} onClick={handleStart} disabled={loading} className="gap-1">
            <Play className="h-4 w-4" /> Start
          </Button>
        )}

        {!isActiveTask && otherTaskRunning && (
          <Button size={'sm'} disabled className="gap-1">
            <Play className="h-4 w-4" /> Start
          </Button>
        )}

        {isActiveTask && status === 'running' && (
          <>
            <Button size={'sm'} onClick={handlePause} disabled={loading} className="gap-1">
              <Pause className="h-4 w-4" /> Pause
            </Button>
            <Button size={'sm'} onClick={handleStop} disabled={loading} className="gap-1">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}

        {isActiveTask && status === 'paused' && (
          <>
            <Button size={'sm'} variant={'default'} onClick={handleResume} disabled={loading} className="gap-1">
              <Play className="h-4 w-4" /> Resume
            </Button>
            <Button size={'sm'} variant={'destructive'} onClick={handleStop} disabled={loading} className="gap-1">
              <Square className="h-4 w-4" /> Stop
            </Button>
          </>
        )}
      </div>

      {/* Manual time entry */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <Input
          type="number"
          step="0.5"
          min="0.5"
          placeholder="Hrs"
          value={manualHours}
          onChange={(e) => setManualHours(e.target.value)}
          className="h-8 text-sm"
          inputMode="decimal"
          aria-label="Manual hours to log"
          disabled={loading}
        />

        <Button
          size={'sm'}
          onClick={handleManualLog}
          disabled={loading || !manualHours || Number(manualHours) <= 0}
          className="gap-1"
        >
          <PlusCircle className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>  
  )
}

export default TaskTimer