'use client'
import { Badge } from "@/components/ui/badge";
import { IconRenderer } from "@/components/ui/icon-picker";
import Link from "next/link";
import { Project, updateProject } from "@/lib/api/projects";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Archive, ExternalLink, MoreHorizontal, Pencil, Trash2, ZapIcon } from "lucide-react";
import DeleteButton from "./DeleteProject"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectIcon } from "@/components/ui/project-icon";


interface ProjectRowProps {
  project: Project
  clientName?: string
  onDelete: (id: number) => void
  onArchive?: (id: number, isArchived: boolean) => void
  isSelecetd: boolean
  onToggle: (id: number) => void
  onSidePanelOpen?: (id: number, project: Project) => void
  onEdit?: (project: Project) => void
  isFocused?: boolean
  onToggleFocus?: (id: number) => void
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    planning: 'badge-status-planning',
    active: 'badge-status-active',
    completed: 'badge-status-completed',
    on_hold: 'badge-status-on_hold',
    cancelled: 'badge-status-cancelled',
  };
  return colors[status] || colors.planning;
};

const displayStatus = (status: string) => {
  const statusDisplay: Record<string, string> = {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    on_hold: 'On Hold',
    cancelled: 'Cancelled',
  };
  return statusDisplay[status] || statusDisplay.planning;
};

const clientStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: "bg-green-500 text-green-100",
    inactive: "bg-gray-500 text-gray-100",
    atRisk: "bg-rose-500 text-rose-100",
    vip: "bg-indigo-500 text-indigo-100",
    internal: "bg-blue-500 text-blue-100",
  }
  return colors[status] || colors.inactive;
};

const clientDisplayStatus = (status: string) => {
  const statusDisplay: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    atRisk: 'At Risk',
    vip: 'VIP',
    internal: 'Internal',
  }
  return statusDisplay[status] || statusDisplay.inactive;
};

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

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const ProjectRow = ({ project, clientName, onDelete, onArchive, isSelecetd, onToggle, onSidePanelOpen, onEdit, isFocused, onToggleFocus }: ProjectRowProps) => {

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [archiving, setArchiving] = useState<boolean>(false)

  const handleArchiveToggle = async () => {
    const newArchivedState = !project.isArchived
    setArchiving(true)
    setIsOpen(false)
    try {
      await updateProject(project.id, { isArchived: newArchivedState })
      onArchive?.(project.id, newArchivedState)
      toast.success(newArchivedState ? `"${project.title}" archived` : `"${project.title}" unarchived`)
    } catch (err: any) {
      toast.error(`Failed to archive project: ${err.message || 'Error'}`)
    } finally {
      setArchiving(false)
    }
  }

  const totalHours = project.totalTimeTracked ? `${parseFloat((project.totalTimeTracked / 60).toFixed(0))}h` : '0h'
  const taskCount = project.taskCount ?? project.tasks?.length ?? 0

  return (
    <div
      role="group"
      aria-label={`Project row: ${project.title}`}
      className={cn(
        "flex flex-wrap md:grid md:grid-cols-[40px_minmax(200px,350px)_minmax(180px,1fr)_110px_160px_60px_110px_110px_110px_40px] gap-4 items-center px-5 py-4 bg-background backdrop-blur-md rounded-xl border border-border/40 transition-all duration-300 group",
        isFocused 
          ? "ring-1 ring-primary shadow-[0_0_20px_-3px_rgba(99,102,241,0.15)] border-primary/40 -translate-y-0.5" 
          : "hover:shadow-sm hover:border-border/60",
        isSelecetd && !isFocused && "bg-primary/5 dark:bg-primary/10 border-primary/50"
      )}
    >
      {/* 1. Checkbox */}
      <div className="flex items-center justify-center">
        <Checkbox
          checked={isSelecetd}
          onCheckedChange={() => onToggle(project.id)}
          aria-label={`Select project ${project.id}`}
          className="shrink-0 border-slate-300 dark:border-muted-foreground/45 data-[state=checked]:bg-primary"
        />
      </div>

      {/* 2. Title + Desc */}
      <div className="min-w-0 flex-1 md:flex-none flex items-center gap-3">
        <ProjectIcon project={project} className="w-9 h-9 rounded-lg shadow-sm shrink-0" iconClassName="h-5 w-5" />
        <div className="flex flex-col gap-0.5 justify-center min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href={`/projects/${project.id}`} 
                onClick={(e) => {
                  if (onSidePanelOpen) {
                    e.preventDefault()
                    e.stopPropagation()
                    onSidePanelOpen(project.id, project)
                  }
                }}
                className='font-semibold truncate hover:text-primary transition-colors block text-sm'
              >
                {project.title}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs wrap-break-words">
              <p>{project.title}</p>
            </TooltipContent>
          </Tooltip>
          <div className="text-xs text-muted-foreground/80 line-clamp-1">{project.description}</div>
        </div>
      </div>

      {/* 3. Client */}
      <div className="w-full md:w-auto text-sm text-muted-foreground truncate hidden md:block">
        {project.clientId ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-help transition-transform hover:scale-110" style={{ backgroundColor: `${project.tags?.[0]?.color || '#6b7280'}4D`, color: project.tags?.[0]?.color || '#6b7280' }}>
              <span className="font-semibold text-xs">
                {(() => {
                  const name = project.client?.name ?? clientName ?? 'N/A';
                  if (name === 'N/A') return 'N/A';
                  const words = name.trim().split(/\s+/);
                  return words.length >= 2
                    ? (words[0][0] + words[1][0]).toUpperCase()
                    : name.substring(0, 2).toUpperCase();
                })()}
              </span>
            </div>
            <div className="flex flex-col">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/clients/${project.clientId}`} className="hover:underline hover:text-primary transition-colors cursor-pointer text-foreground font-medium">
                    {project.client?.name ?? clientName ?? `Client ${project.clientId}`}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs wrap-break-words">
                  <p>{project.client?.name ?? clientName ?? `Client ${project.clientId}`}</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn("h-2 w-2 rounded-full", clientStatusColor(project.client?.status || 'inactive'))} />
                <span className={cn('text-[10px] uppercase font-semibold text-muted-foreground/80 line-clamp-1', project?.client?.status === 'internal' ? 'text-blue-500' : 'text-muted-foreground/80')}>{clientDisplayStatus(project.client?.status || 'inactive')}</span>
              </div>
            </div>
          </div>
        ) : (
          project.client?.name ?? clientName ?? 'No client'
        )}
      </div>

      {/* 4. Status */}
      <div className="flex items-center">
        <div className={cn("inline-flex items-center border px-2 py-0.5 font-medium transition-colors shrink-0 text-xs w-full md:w-auto justify-center rounded-full", getStatusColor(project.status), project.isArchived ? 'border-dashed border-slate-400/50 text-muted-foreground' : '')}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5" aria-hidden="true" />
          {displayStatus(project.status)}
        </div>
      </div>

      {/* 5. Progress */}
      <div className="flex items-center gap-3 justify-center w-full md:w-auto">

        <Progress value={project.progress ?? 0} className="h-1.5 w-full" indicatorColor={project.tags?.[0]?.color} /> <span className="text-sm text-muted-foreground font-semibold">{project.progress ?? 0}%</span>
      </div>

      {/* 6. Tasks */}
      <div className="text-sm hidden md:flex items-center justify-center text-muted-foreground">
        <span className="text-muted-foreground font-medium">{taskCount}</span>
      </div>

      {/* 7. Time Tracked */}
      <div className="flex items-center justify-center text-sm font-medium text-muted-foreground flex-1 md:flex-none">
        <span className="hidden md:inline font-bold">{totalHours}</span>
      </div>

      {/* 8. Due Date */}
      <div className={cn("text-sm hidden md:flex items-center gap-1.5 flex-wrap text-muted-foreground")}>
        <time dateTime={project.deadline ? new Date(project.deadline).toISOString() : undefined}>
          {!project.deadline ? "N/A" : <div className={cn('text-xs px-2 py-0.5 ', deadlineBadgeColor(project.deadline))}>{formatDate(project.deadline)}</div>}
        </time>
      </div>

      {/* 9. Members */}
      <div className="w-full md:w-auto text-sm text-muted-foreground truncate hidden md:flex items-center">
        <span className="hidden md:inline text-muted-foreground/50">-</span>
      </div>

      {/* 10. Actions Dropdown */}
      <div className="flex justify-end items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFocus?.(project.id) }}
          className={cn(
            "h-8 w-8 rounded-full shrink-0 transition-all", 
            isFocused 
              ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" 
              : "text-muted-foreground opacity-0 md:opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-amber-500/10"
          )}
          title={isFocused ? "Unfocus Project" : "Focus Project"}
        >
          <ZapIcon className={cn("h-4 w-4", isFocused && "fill-amber-500")} />
        </Button>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn("h-8 w-8 rounded-full",
                isOpen ? 'bg-gray-200 text-indigo-600' : 'text-gray-400'
              )}
              variant={'ghost'}
              size={'icon'}
            >
              <MoreHorizontal
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen ? "rotate-0 text-indigo-600" : "rotate-90 text-gray-400"
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => {
              setIsOpen(false)
              onSidePanelOpen?.(project.id, project)
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
              {project.isArchived ? 'Unarchive project' : 'Archive project'}
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
  )
}