import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';

interface DateRangePickerProps {
  /** Currently selected period identifier */
  value: string;
  /** Callback when a new period is selected */
  onChange: (value: string) => void;
}

/**
 * Reusable date range picker that mirrors the style used in the dashboard HeaderBar.
 * It displays a button showing the selected range and a dropdown with preset options.
 */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const now = new Date();

  const formatRange = (range: string) => {
    switch (range) {
      case '7days':
        return `${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case '30days':
        return `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case '90days':
        return `${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'thisyear':
        return `${new Date(now.getFullYear(), 0, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'all':
        return 'All Dates';
      default:
        return value;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-medium bg-card hover:bg-muted border-border transition-colors rounded-md flex items-center gap-2 shadow-xs"
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" strokeWidth={1.5} />
          <span className="text-muted-foreground">{formatRange(value)}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value="all">All Dates</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="7days">Last 7 Days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="30days">Last 30 Days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="90days">Last 90 Days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="thisyear">This Year</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
