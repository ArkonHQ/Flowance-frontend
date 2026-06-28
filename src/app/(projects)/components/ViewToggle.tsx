'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutGrid, List } from "lucide-react"

export type ViewMode = 'grid' | 'row'


interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string

}


export const ViewToggle = ({ value, onChange, className }: ViewToggleProps) => {

  return (

    <div className={cn('flex items-center gap-1 p-1 bg-muted/50 rounded-md ', className)}>
      <Button
        variant={value === 'grid' ? 'default' : 'ghost'}
        size={'sm'}
        className="h-8 w-8 p-0"
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      <Button
        variant={value === 'row' ? 'default' : 'ghost'}
        size={'sm'}
        className="h-8 w-8 p-0"
        onClick={() => onChange('row')}
        aria-label="Row view"
        >
          <List className="h-4 w-4" />
        </Button>
    </div>
  )
}