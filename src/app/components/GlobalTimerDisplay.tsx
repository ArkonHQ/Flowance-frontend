'use client'

import { Button } from "@/components/ui/button"
import { useTimerStore } from "@/store/timerStore"
import { Pause, Play, Square } from "lucide-react"
import { useEffect } from "react"


const GlobalTimerDisplay = () => {
  const { activeTaskId, status, elapsedSeconds, pauseTimer, resetTimer, stopTimer, resumeTimer, taskName, } = useTimerStore()

  if (!activeTaskId) return null

  const formatTime = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds))
    const hrs = Math.floor(total / 3600)
    const mins = Math.floor((total % 3600) / 60)
    const secs = total % 60
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }


  return(
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-3 z-50">
      <div className="text-sm font-medium">{taskName}</div>
      <div className="font-mono text-lg">{formatTime(elapsedSeconds)}</div>
      {status === 'running' && (
        <Button size={'sm'} variant={'outline'} onClick={pauseTimer}>
          <Pause className="h-4 w-4" />
        </Button>
      )}
      {status === 'paused' && (
        <Button size={'sm'} variant={'outline'} onClick={resumeTimer}>
          <Play className="h-4 w-4" />
        </Button>
      )}
      <Button size={'sm'} variant={'outline'} onClick={stopTimer}>
        <Square className="h-4 w-4" />
      </Button>
    </div>
  )

}

export default GlobalTimerDisplay