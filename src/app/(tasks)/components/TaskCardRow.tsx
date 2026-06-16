'use client'

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useTimerStore } from "@/store/timerStore"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Task } from "@/lib/api/tasks"
import { cn } from "@/lib/utils"
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import DeleteButton from "./DeleteTasks"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"





interface TaskCardRowProps {
  task: Task
  projectTitle?: string | null
  onDelete: (id:number) => void
  onOpenPanel: (taskId: number, taskTitle: string, projectTitle: string | null) => void
  isSelected: boolean
  onToggle: (id: number) => void
}

  // 1.Define Colors if exist 
const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    todo: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
    done: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    delayed: "bg-gray-100 text-gray-700 border-gray-200",
    overdue: "bg-rose-100 text-rose-700 border-rose-200",
  }

  return statusColors[status] || statusColors.delayed
}

const statusDisplay = (status: string) => {
  const displayStatus: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
    cancelled: "Cancelled",
    delayed: "Delayed",
    overdue: "Overdue",
  }
  return displayStatus[status] || displayStatus.todo
}

const getPriorityColor = (priority: string) => {
  const priorityColors: Record<string, string> = {
    low: "bg-green-100/70 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-red-100 text-red-700 border-red-200",
  }
  return priorityColors[priority] || priorityColors.medium
}


  // 2.Define Format Date
const formatDate = (date: Date | string | undefined | null) => {
  if (!date) return "N/A"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return "N/A"
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}



export const TaskCardRow = ({ task, projectTitle, onDelete, onOpenPanel, isSelected, onToggle }: TaskCardRowProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const timer = useTimerStore((state) => state.timers[task.id])

  const title = task.title ?? "Untitled task"

  const handleOpenPanel = (e: React.MouseEvent) => {
    e.preventDefault()
    onOpenPanel(task.id, task.title ?? "Untitled task", task.project?.title ?? null)
  }

  const formatTime = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds))
    if (total === 0) return "0s"
    const hrs = Math.floor(total / 3600)
    const mins = Math.floor((total % 3600) / 60)
    const secs = total % 60
    
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  return (
    <div
      role="group"
      aria-label={`Task row: ${title}`}
      className={cn(
        "flex flex-wrap md:grid md:grid-cols-[40px_1fr_1fr_1fr_110px_110px_100px_110px_40px] gap-4 items-center px-5 py-4 bg-background backdrop-blur-md rounded-xl border border-border/40 hover:shadow-xs transition-all group",
        isSelected ? "bg-primary/5 dark:bg-primary/10 border-primary/50" : "border-border/30 hover:border-border/60"
      )}
    >
      {/* 1. Checkbox */}
      <div className="flex items-center justify-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(task.id)}
          aria-label={`Select task ${task.id}`}
          className="shrink-0 border-slate-300 dark:border-muted-foreground/45 data-[state=checked]:bg-primary"
        />
      </div>
      
      {/* 2. Title */}
      <div className="min-w-0 flex-1 md:flex-none">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/tasks/${task.id}`}
                className="font-semibold truncate hover:text-primary transition-colors block"
                onClick={handleOpenPanel}
              >
                {title}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs break-words">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 3. Project */}
      <div className="w-full md:w-auto text-sm text-muted-foreground truncate hidden md:block">
        <Link
          href={`/projects/${task.projectId}`}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          {projectTitle ?? task.project?.title ?? "No project"}
        </Link>
      </div>

      {/* 4. Assignee (Placeholder for now) */}
      <div className="w-full md:w-auto text-sm text-muted-foreground truncate hidden md:block">
        -
      </div>

      {/* 5. Status */}
      <div className="flex items-center">
        <Badge variant="outline" className={cn("shrink-0 text-xs font-medium w-full md:w-auto justify-center", getStatusColor(task.status))}>
          {statusDisplay(task.status)}
        </Badge>
      </div>

      {/* 6. Priority */}
      <div className="flex items-center">
        <div className={cn("font-semibold text-xs text-center rounded px-2 py-1 w-full md:w-auto", getPriorityColor(task.priority))}>
          {(task.priority ?? "medium").charAt(0).toUpperCase() + (task.priority ?? "medium").slice(1)}
        </div>
      </div>

      {/* 7. Due Date */}
      <div className="text-muted-foreground text-sm hidden md:block">
        <time dateTime={task.deadline ? new Date(task.deadline).toISOString() : undefined}>
          {formatDate(task.deadline)}
        </time>
      </div>

      {/* 8. Timer */}
      <div className="flex items-center justify-end text-sm font-medium text-muted-foreground flex-1 md:flex-none">
        {timer?.elapsedSeconds ? (
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border w-full md:w-auto justify-center", timer.status === 'running' ? "bg-green-100/50 text-green-700 border-green-200" : "bg-secondary/50 border-transparent")}>
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">{formatTime(timer.elapsedSeconds)}</span>
          </div>
        ) : <span className="hidden md:inline text-muted-foreground/50">-</span>}
      </div>

      {/* 9. Actions */}
      <div className="flex justify-end">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`Open actions for ${title}`}
              className={cn("h-8 w-8 rounded-full", isOpen ? "bg-gray-200 text-indigo-600" : "text-gray-400")}
              variant={"ghost"}
              size={"icon"}
            >
              <MoreHorizontal
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen ? "rotate-0 text-indigo-600" : "rotate-90 text-gray-400",
                )}
              />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => onOpenPanel(task.id, task.title ?? "Untitled task", task.project?.title ?? null) }>
              <div className="flex items-center gap-2 cursor-pointer">
                <ExternalLink className="h-4 w-4" />
                View details
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/tasks/${task.id}/edit`} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit task
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <DeleteButton taskId={task.id} taskName={task.title} redirectAfterDelete={false} onDeleted={onDelete}>
                <span className="flex items-center gap-2 text-destructive w-full">
                  <Trash2 className="h-4 w-4" />
                  Delete task
                </span>
              </DeleteButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
