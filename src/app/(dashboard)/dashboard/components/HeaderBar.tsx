'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'


export function HeaderBar({onPeriodChange}: {onPeriodChange: (period: string) => void}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
    >
      {/* Left side: welcome message */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {/* Small decorative accent line (like your page headers) */}
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Command Center
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-[18px]">
          Welcome back,! Here’s your freelance performance overview.
        </p>
      </div>

      {/* Right side: period selector ONLY */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 text-sm font-medium bg-card/40 backdrop-blur-sm border-border/40 hover:bg-card/60 hover:border-border/60 transition-all duration-200 rounded-xl flex items-center gap-2"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>May 12 – May 19, 2024</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </motion.div>
  )
}