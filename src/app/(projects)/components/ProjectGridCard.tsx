'use client'

import Link from "next/link"
import { Project, updateProject } from "@/lib/api/projects"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Archive, CheckCircle2, Clock, ExternalLink, List, MoreHorizontal, Pencil, Pin, Trash2, ZapIcon, Users } from "lucide-react"
import DeleteButton from "./DeleteProject"
import { ProjectIcon } from "@/components/ui/project-icon"
import { Task } from "@/lib/api/tasks"
import { Client } from "@/lib/api/clients"
import { usePinnedProjectsStore } from "@/store/pinnedProjects"


interface ProjectGridCardProps {
  project: Project
  clientName?: string
  progress?: number
  taskCount?: number
  totalTimeTracked?: number
  onDelete?: (id: number) => void
  onArchive?: (id: number, isArchived: boolean) => void
  onSidePanelOpen: (id: number, project: Project) => void
  onEdit?: (project: Project) => void
  isFocused: boolean
  onToggleFocus: (projectId: number) => void
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    planning: 'badge-status-planning',
    active: 'badge-status-active',
    completed: 'badge-status-completed',
    on_hold: 'badge-status-on_hold',
    cancelled: 'badge-status-cancelled',
  }
  return colors[status] || colors.planning
}

const displayStatus = (status: string) => {
  const map: Record<string, string> = {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    on_hold: 'On Hold',
    cancelled: 'Cancelled',
  }
  return map[status] || 'Planning'
}

export const ProjectGridCard = ({
  project,
  clientName,
  onDelete,
  onArchive,
  onSidePanelOpen,
  onEdit,
  isFocused,
  onToggleFocus
}: ProjectGridCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)

  const { isPinned, togglePin } = usePinnedProjectsStore()
  const pinned = isPinned(project.id)

  const progress = project.progress ?? 0
  const taskCount = project.taskCount ?? project.tasks?.length ?? 0
  const totalHours = project.totalTimeTracked
    ? `${parseFloat((project.totalTimeTracked / 60).toFixed(0))}h`
    : '0h'



  const deadlineBadgeColor = (date: Date | string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!date) return 'text-gray-700'
    const deadlineDate = new Date(date)
    deadlineDate.setHours(0, 0, 0, 0)

    if (deadlineDate < today) return 'text-red-500'
    if (deadlineDate.getTime() === today.getTime()) return 'text-yellow-500'
    return 'text-green-500'
  }

  const handleSidePanelOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSidePanelOpen(project.id, project ?? null)
  }

  const handleArchiveToggle = async () => {
    const newState = !project.isArchived
    setArchiving(true)
    setIsOpen(false)
    try {
      await updateProject(project.id, { isArchived: newState })
      onArchive?.(project.id, newState)
      toast.success(newState ? `"${project.title}" archived` : `"${project.title}" unarchived`)
    } catch (err: any) {
      toast.error(`Failed to archive project: ${err.message || 'Error'}`)
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 p-4 rounded-xl border bg-background backdrop-blur-md transition-all duration-300",
        isFocused
          ? "ring-1 ring-primary shadow-[0_0_20px_-3px_rgba(99,102,241,0.15)] border-primary/40 -translate-y-0.5"
          : "hover:shadow-md hover:border-border/60",
        project.isArchived && !isFocused ? "opacity-60 border-dashed" : "border-border/40"
      )}
    >
      {/* Header: icon + title + menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <ProjectIcon project={project} className="w-10 h-10 rounded-lg shadow-sm shrink-0" iconClassName="h-5 w-5" />
          <div className="min-w-0">
            <Link
              href={`/projects/${project.id}`}
              onClick={handleSidePanelOpen}
              className="font-semibold text-sm truncate hover:text-primary transition-colors block"
            >
              {project.title}
            </Link>
            {project.description && (
              <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5">

          {/* Pin toggle button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePin({ id: project.id, title: project.title, color: project.tags?.[0]?.color, icon: project.tags?.[0]?.icon });
            }}
            aria-label={pinned ? "Unpin project" : "Pin project"}
            title={pinned ? "Unpin project" : "Pin project"}
            className={cn(
              "relative h-7 w-7 rounded-full shrink-0 flex items-center justify-center transition-all duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              pinned
                ? [
                    "text-sky-400 bg-sky-500/15 shadow-[0_0_0_1px_rgba(14,165,233,0.35),0_0_12px_-3px_rgba(14,165,233,0.5)]",
                    "hover:bg-sky-500/20 hover:shadow-[0_0_0_1px_rgba(14,165,233,0.5),0_0_16px_-2px_rgba(14,165,233,0.65)]",
                  ].join(" ")
                : [
                    "text-muted-foreground/40 opacity-0 group-hover:opacity-100",
                    "hover:text-sky-400 hover:bg-sky-500/10 hover:shadow-[0_0_0_1px_rgba(14,165,233,0.2)]",
                  ].join(" ")
            )}
          >
            <Pin
              className={cn(
                "h-3.5 w-3.5 transition-all duration-300",
                pinned
                  ? "fill-sky-400 stroke-sky-400 -rotate-45"
                  : "-rotate-45"
              )}
            />
          </button>

          {/* Focus (Zap) button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFocus?.(project.id)
            }}
            aria-label={isFocused ? "Unfocus Project" : "Focus Project"}
            className={cn(
              "h-7 w-7 rounded-full shrink-0 transition-all",
              isFocused
                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-amber-500/10"
            )}
            title={isFocused ? "Unfocus Project" : "Focus Project"}
          >
            <ZapIcon className={cn("h-3.5 w-3.5", isFocused && "fill-amber-500")} />
          </Button>

          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7 rounded-full shrink-0", isOpen ? "bg-muted text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100")}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => {
                setIsOpen(false)
                handleSidePanelOpen?.(project.id, project)
              }} className="flex items-center gap-2 cursor-pointer">
                <ExternalLink className="h-4 w-4" />
                Open details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit?.(project)} className="flex items-center gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleArchiveToggle} disabled={archiving} className="flex items-center gap-2 cursor-pointer">
                <Archive className="h-4 w-4" />
                {project.isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                <DeleteButton
                  projectId={project.id}
                  projectName={project.title}
                  redirectAfterDelete={false}
                >
                  <span className="flex items-center gap-2 text-destructive cursor-pointer w-full">
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </span>
                </DeleteButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between">
          <div className={cn(
            "inline-flex items-center border px-2 py-0.5 font-medium text-xs rounded-full",
            getStatusColor(project.status),
            project.isArchived ? 'border-dashed border-slate-400/50 text-muted-foreground' : ''
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5" />
            {project.isArchived ? 'Archived' : displayStatus(project.status)}
          </div>
          {project.deadline && (
            <span className={cn("text-xs", deadlineBadgeColor(project.deadline))}>
              {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" indicatorColor={project.tags?.[0]?.color} />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{taskCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{project.membersCount || 1}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{totalHours}</span>
          </div>
        </div>
        
        {/* Client row */}
        {(project.clientId) && (
          <div className="flex items-center gap-2 pt-0 -mt-1">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
              style={{
                backgroundColor: `${project.tags?.[0]?.color || '#6b7280'}33`,
                color: project.tags?.[0]?.color || '#6b7280'
              }}
            >
              {(() => {
                const name = project.client?.name ?? clientName ?? 'N/A';
                if (name === 'N/A') return 'N/A';
                const words = name.trim().split(/\s+/);
                return words.length >= 2
                  ? (words[0][0] + words[1][0]).toUpperCase()
                  : name.substring(0, 2).toUpperCase();
              })()}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {project.client?.name ?? clientName}
            </span>
          </div>
        )}
      </div>
  )
}
