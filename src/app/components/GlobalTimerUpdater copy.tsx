'use client'

import { useTimerStore } from '@/store/timerStore'
import { useEffect } from 'react'


const GlobalTimerUpdater = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const { timers } = useTimerStore.getState()
      const runningIds = Object.values(timers).filter((t) => t.status === 'running')
      if (runningIds.length === 0) return

      console.log(`[GlobalTimerUpdater] ticking ${runningIds.length} timers`)

      useTimerStore.setState((state) => {
        const updated = { ...state.timers }
        for (const t of runningIds) {
          const currentElapsed = state.timers[t.taskId]?.elapsedSeconds || 0
          updated[t.taskId] = { ...updated[t.taskId], elapsedSeconds: currentElapsed + 1 }
        }
        return { timers: updated }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}

export default GlobalTimerUpdater