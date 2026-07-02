"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CustomDatePickerProps {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
}

export function CustomDatePicker({
  date,
  onChange,
  placeholder = "Pick a date",
  className,
  triggerClassName,
  disabled = false,
}: CustomDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal gap-2",
            "h-9 bg-muted/20 border-border/40 rounded-xl text-xs",
            "hover:bg-muted/30 hover:border-border/60 transition-all",
            !date && "text-muted-foreground/50",
            triggerClassName
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
          {date ? (
            <span className="font-medium text-foreground">
              {format(date, "MMM d, yyyy")}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-0 rounded-xl border-border/40 shadow-xl backdrop-blur-sm z-[200]",
          className
        )}
        align="start"
        sideOffset={6}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onChange(newDate)
            setOpen(false)
          }}
          className="rounded-xl"
        />
      </PopoverContent>
    </Popover>
  )
}
