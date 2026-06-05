'use client'

import React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useTimerStore, SingleTimer } from '@/store/timerStore'
import { useSidebar } from '@/components/ui/sidebar'
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '@/components/ui/popover'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

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

const TimerRow = ({ timer }: { timer: SingleTimer }) => {
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resumeTimer = useTimerStore((s) => s.resumeTimer)
  const stopTimer = useTimerStore((s) => s.stopTimer)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0 border-b border-border/30 last:border-0 cursor-pointer">
        <div className='flex p-1'>
            <Button className={cn('bg-primary rounded-full text-xs', timer.status === 'paused' ? 'block' : 'hidden')} onClick={() => resumeTimer(timer.taskId)}>
              ▶ 
            </Button>
          <span className=" text-lg font-mono font-bold text-foreground ml-2">
              {formatTime(timer.elapsedSeconds)}
            </span>
            </div>
          <div className="flex items-center justify-between">
           
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                  timer.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="text-[11px] font-semibold truncate text-muted-foreground"
                    aria-label={timer.taskName}
                  >
                    {timer.taskName}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{timer.taskName}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>{timer.taskName}</PopoverTitle>
        </PopoverHeader>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{timer.status === 'running' ? 'Running' : 'Paused'}</div>
          <div className="font-mono font-bold">{formatTime(timer.elapsedSeconds)}</div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          {timer.status === 'running' ? (
            <button
              onClick={() => pauseTimer(timer.taskId)}
              className="p-1 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={() => resumeTimer(timer.taskId)}
              className="p-1 hover:bg-background rounded transition-colors text-muted-foreground hover:text-foreground"
            >
              Resume
            </button>
          )}

          <button
            onClick={() => stopTimer(timer.taskId)}
            className="p-1 hover:bg-destructive/10 rounded text-red-500 transition-colors"
          >
            Stop & Log
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const GlobalTimerDisplay = () => {
  const timers = useTimerStore((s) => s.timers)
  const { open } = useSidebar()

  const activeTimers = Object.values(timers)

  // Show ONLY when sidebar is open and at least one timer is running
  if (!open || activeTimers.length === 0) return null

  return (
    <div className="p-3 mx-3 mb-4 bg-secondary/10 shadow-lg rounded-xl border border-border/50 backdrop-blur-sm rounded-l-none hover:-translate-y-1 transform-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className='-left-0.5 top-0 absolute h-full w-0.5 bg-primary/80'/>
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
          {activeTimers.length}
        </span>
      </div>
      <div className="flex flex-col">
        {activeTimers.map((timer) => (
          <TimerRow key={timer.taskId} timer={timer} />
        ))}
      </div>
    </div>
  )
}
