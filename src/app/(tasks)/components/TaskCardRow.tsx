'use client'

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useTimerStore } from "@/store/timerStore"
import { Clock, Star } from "lucide-react"
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
import { ExternalLink, MoreHorizontal, Pencil, Trash2, ArrowDown, ArrowUp, Minus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import DeleteButton from "./DeleteTasks"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { IconRenderer } from "@/components/ui/icon-picker"
import { ProjectIcon } from "@/components/ui/project-icon"
import { Project } from "@/lib/api/projects"
import { MissionProgress } from "./MissionProgress"





interface TaskCardRowProps {
  task: Task
  projectTitle?: string | null
  onDelete: (id:number) => void
  onOpenPanel: (taskId: number, taskTitle: string, project: Project | null) => void
  isSelected: boolean
  onToggle: (id: number) => void
  onEdit?: () => void
  onToggleFocus: (taskId: number) => void
  isFocused: boolean
}

  // 1.Define Colors if exist 
const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    todo: "badge-status-todo",
    in_progress: "badge-status-in_progress",
    done: "badge-status-done",
    cancelled: "badge-status-cancelled",
    delayed: "badge-status-delayed",
    overdue: "badge-status-overdue",
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
    low: "badge-priority-low",
    medium: "badge-priority-medium",
    high: "badge-priority-high",
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



export const TaskCardRow = ({ task, isFocused,onToggleFocus, onDelete, onOpenPanel, isSelected, onToggle, onEdit }: TaskCardRowProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const timer = useTimerStore((state) => state.timers[task.id])


  const title = task.title ?? "Untitled task"

  const handleOpenPanel = (e: React.MouseEvent) => {
    e.preventDefault()
    onOpenPanel(task.id, task.title ?? "Untitled task", task.project ?? null)
  }

  const missionTotal = task.missions?.length || 0
  const completedMissions = task.missions?.filter(mis => mis.completed)?.length || 0

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

  const getDueDateStatus = () => {
    if (['done', 'cancelled'].includes(task.status)) return 'normal';
    if (task.status === 'overdue') return 'overdue';
    if (!task.deadline) return 'normal';

    const timeRemaining = new Date(task.deadline).getTime() - Date.now();
    if (timeRemaining < 0) return 'overdue';
    if (timeRemaining <= 24 * 60 * 60 * 1000) return 'soon';
    
    return 'normal';
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div
      role="group"
      aria-label={`Task row: ${title}`}
      className={cn(
        "flex flex-wrap md:grid md:grid-cols-[40px_minmax(200px,350px)_140px_110px_110px_130px_100px_110px_40px] gap-4 items-center px-5 py-4 bg-background backdrop-blur-md rounded-xl border border-border/40 hover:shadow-xs transition-all group",
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
      <div className="min-w-0 flex-1 md:flex-none flex flex-col gap-1.5 justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/tasks/${task.id}`}
                  className="font-semibold truncate hover:text-primary transition-colors block text-sm"
                  onClick={handleOpenPanel}
                >
                  {title}
                </Link>
                
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs wrap-break-words">
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
                  onClick={(e) => {
                     onToggleFocus(task.id) 
                     e.stopPropagation()
                    }}
                  className="p-1 hover:text-amber-400 transition-colors"
                  title= {isFocused ? 'Unfocus' : 'Focus'}
                  >
                    <Star className={`h-4 w-4 ${
                      isFocused
                        ? "fill-amber-400 text-amber-400"
                        : 'text-muted-foreground'
                    }`}
                    />
                  </button>
        </div>
        <span className="text-muted-foreground/90 text-xs w-full line-clamp-1">{task.summary}</span>
      </div>

      {/* 3. Project / Tags */}
      <div className="md:w-auto text-sm text-muted-foreground truncate flex flex-wrap gap-1">
        {task.tags.map(tag => (
          <Badge 
            key={tag.id}
            style={{ 
              backgroundColor: `${tag.color || '#6b7280'}40`,
              color: tag.color || '#6b7280'
            }}
            className="px-2 py-0.5 text-[10px] rounded-md font-medium border border-transparent shadow-none hover:bg-opacity-80 transition-colors"
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      {/* 4. Priority */}
      <div className="flex items-center">
        <div className={cn("inline-flex items-center gap-1 border px-2 py-0.5 font-medium transition-colors shrink-0 text-xs w-full md:w-auto justify-center rounded-full", getPriorityColor(task.priority))}>
          {task.priority === "high" ? <ArrowUp className="w-3 h-3" /> : task.priority === "low" ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {(task.priority ?? "medium").charAt(0).toUpperCase() + (task.priority ?? "medium").slice(1)}
        </div>
      </div>

      {/* 5. Due Date */}
      <div className={cn(
        "text-sm hidden md:flex items-center gap-1.5 flex-wrap",
        dueDateStatus === 'overdue' ? "text-red-600 dark:text-red-400 font-medium" :
        dueDateStatus === 'soon' ? "text-amber-600 dark:text-amber-500 font-medium" :
        "text-muted-foreground"
      )}>
        <time dateTime={task.deadline ? new Date(task.deadline).toISOString() : undefined}>
          {!task.deadline ? "-" : formatDate(task.deadline)}
        </time>
        {dueDateStatus === 'overdue' && (
          <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            Overdue
          </span>
        )}
      </div>

      {/* 6. Assignee (Placeholder for now) */}
      <div className="w-full md:w-auto text-sm text-muted-foreground truncate hidden md:block">
        <MissionProgress completed={completedMissions} total={missionTotal} animate={false} size={40}/>
      </div>

      {/* 7. Timer */}
      <div className="flex items-center justify-center text-sm font-medium text-muted-foreground flex-1 md:flex-none">
        {timer?.elapsedSeconds ? (
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border w-full md:w-auto justify-center", timer.status === 'running' ? "bg-green-100/50 dark:bg-green-300/20 text-green-700 border-green-200" : "bg-secondary/50 border-transparent")}>
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">{formatTime(timer.elapsedSeconds)}</span>
          </div>
        ) : <span className="hidden md:inline text-muted-foreground/50">-</span>}
      </div>

      {/* 8. Status */}
      <div className="flex items-center">
        <div className={cn("inline-flex items-center border px-2 py-0.5 font-medium transition-colors shrink-0 text-xs w-full md:w-auto justify-center rounded-full", getStatusColor(task.status))}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5" aria-hidden="true" />
          {statusDisplay(task.status)}
        </div>
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
            <DropdownMenuItem onSelect={() => onOpenPanel(task.id, task.title ?? "Untitled task", task.project ?? null) }>
              <div className="flex items-center gap-2 cursor-pointer">
                <ExternalLink className="h-4 w-4" />
                View details
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={onEdit}>
              <div className="flex items-center gap-2 cursor-pointer w-full">
                <Pencil className="h-4 w-4" />
                Edit task
              </div>
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
