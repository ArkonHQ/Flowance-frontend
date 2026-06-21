'use client'

import { cn } from "@/lib/utils"

export type Priority= 'low' | 'medium' | 'high'

interface PrioritySelectorProps {
  value: Priority
  onChange: (priority: Priority) => void
}

const priorities: {
  value: Priority
  label: string
  color: string
  bg: string
  border: string
  glow: string
}[] = [
  {
    value: 'low',
    label: 'Low',
    color: "text-emerald-500",
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/20'
  },
  {
    value: 'medium',
    label: 'Medium',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-500/20'
  },
  {
    value: 'high',
    label: 'High',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'shadow-rose-500/20'
  },
]

export const PrioritySelector =({value, onChange}: PrioritySelectorProps) => {
  
  return (
    <div className="grid grid-cols-3 gap-2">
      {priorities.map((p) => {
        const isActive = value === p.value
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              'flex items-center justify-center gap-1.5 px-2.5 rounded-xl border text-[11px] font-semibold transition-all',
              isActive 
              ? cn(p.bg, p.color, p.border, p.glow, 'shadow-sm border-current')
              : 'border-border/40 hover:bg-muted/30'
            )}
            >
                {/* Colored dot  */}
                <span className={cn('h-1 w-1 rounded-full', isActive ? 'bg-current' : 'bg-muted-foreground/40' )} />
                {p.label}
            </button>
        )
      } )}
    </div>
  )
}