'use client'

import { useTimerStore } from "@/store/timerStore"
import { useEffect } from "react"


const GlobalTimerUpdater = () => {
  const { status, startTime, totalPausedSeconds } = useTimerStore()

  useEffect(() => {
    if ( status !== 'running' || ! startTime ) return
    const interval = setInterval(() => {
      const now = new Date()
      const rawSeconds = (now.getTime() - startTime.getTime()) / 1000
      const seconds = Math.max(0, rawSeconds - totalPausedSeconds)
      useTimerStore.setState({ elapsedSeconds: seconds })
    }, 1000)
    return () => clearInterval(interval)
  }, [ status, startTime, totalPausedSeconds ])
  
  
  return null
}


export default GlobalTimerUpdater