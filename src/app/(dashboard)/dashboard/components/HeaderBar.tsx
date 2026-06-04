'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth'
import { useState } from 'react'
import { DateRangePicker } from '@/components/ui/date-range-picker'

interface HeaderBarProps {
  onPeriodChange: (period: string) => void
  userName?: string
}

export function HeaderBar({ onPeriodChange, userName = "Freelancer" }: HeaderBarProps) {
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const { data: session } = useSession()
  const displayName = session?.user?.name ?? userName


  const handlePeriodChange = (period: string) => {
    setSelectedDateRange(period)
    onPeriodChange(period)
  }

  const handleResetFilters = () => {
    setSelectedDateRange('all')
    onPeriodChange('all')
  }

  const isFilterActive = selectedDateRange !== 'all'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
    >
      {/* Left side: welcome message */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Command Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{displayName}</span>. Here’s your freelance performance overview.
        </p>
      </div>

      {/* Right side: period selector ONLY */}
      <DateRangePicker value={selectedDateRange} onChange={handlePeriodChange} />


    </motion.div>
  )
}