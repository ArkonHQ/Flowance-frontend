'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth'

interface HeaderBarProps {
  onPeriodChange: (period: string) => void
  userName?: string
}

export function HeaderBar({ onPeriodChange, userName = "Freelancer" }: HeaderBarProps) {
  const { data: session } = useSession()
  const displayName = session?.user?.name ?? userName

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
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-medium bg-card hover:bg-muted border-border transition-colors rounded-md flex items-center gap-2 shadow-xs"
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" strokeWidth={1.5} />
          <span className="text-muted-foreground">
            {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {
              new Date().toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
              })
            }
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.5} />
        </Button>
      </div>
    </motion.div>
  )
}