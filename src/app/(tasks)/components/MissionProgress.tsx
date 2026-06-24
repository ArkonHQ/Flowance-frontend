'use client'

import { CircularProgress, CircularProgressIndicator, CircularProgressRange, CircularProgressTrack, CircularProgressValueText } from "@/components/ui/circular-progress"
import { useEffect, useState } from "react"

interface MissionProgressProps {
  completed: number
  total: number
  animate?: boolean
  size?: number
}

export const MissionProgress = ({completed, total, animate = true, size = 120}: MissionProgressProps) => {

  const targetPercentage = total > 0 ? (completed / total) * 100 : 0
  const [percentage, setpercentage] = useState(0)


  
  useEffect(() => {
    if (!animate) {
      setpercentage(targetPercentage)
      return
    }

    setpercentage(0)
    const step = 2
    const interval = setInterval(() => {
      setpercentage(prev => {
        const next = prev + step
        if (next >= targetPercentage ){
          clearInterval(interval)
          return targetPercentage
        }
        return next
      })
    }, 16)
    return () => clearInterval(interval)
  }, [targetPercentage, animate])


  return (

    <CircularProgress value={percentage} size={size}>
      <CircularProgressIndicator>
        <CircularProgressTrack />
        <CircularProgressRange />
      </CircularProgressIndicator>
      <CircularProgressValueText>
        {completed}/{total}
      </CircularProgressValueText>
    </CircularProgress>
  )
}