import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu'

interface CardPeriodSelectorProps {
  selectPeriod?: string
  onPeriodChange?: (period: string) => void
  periodLabel: string
}

export const CardPeriodSelector = ({ selectPeriod, onPeriodChange, periodLabel }: CardPeriodSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 rounded-lg shrink-0 border-border/40 bg-card/30">
          {periodLabel} <ChevronDown className="h-2.5 w-2.5 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={selectPeriod || 'all'} onValueChange={(val) => onPeriodChange?.(val)}>
          <DropdownMenuRadioItem value="all">All Dates</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="7days">Last 7 Days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="30days">Last 30 Days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="90days">Last 90 Days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="thisyear">This Year</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
