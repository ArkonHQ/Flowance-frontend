'use client'
import { Badge } from "@/components/ui/badge"; 
import { IconRenderer } from "@/components/ui/icon-picker";
import Link from "next/link";
import { Project } from "@/lib/api/projects";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import DeleteButton from "./DeleteProject"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";


interface ProjectRowProps {
  project: Project
  clientName?: string
  onDelete: (id: number) => void 
  isSelecetd: boolean
  onToggle: (id: number) => void
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-700 border-gray-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
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

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
}

export const ProjectRow = ({ project, clientName, isSelecetd, onToggle }: ProjectRowProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  

  return (
    <div
      role="group"
      aria-label={`Project row: ${project.title}`}
      className={cn(
        "flex flex-wrap md:grid md:grid-cols-[40px_minmax(200px,350px)_140px_110px_160px_60px_110px_110px_110px_40px] gap-4 items-center px-5 py-4 bg-background backdrop-blur-md rounded-xl border border-border/40 hover:shadow-xs transition-all group",
        isSelecetd ? "bg-primary/5 dark:bg-primary/10 border-primary/50" : "border-border/30 hover:border-border/60"
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

      {/* 2. Title + Tags */}
      <div className="min-w-0 flex-1 md:flex-none flex flex-col gap-1.5 justify-center">
        <div className="flex items-center gap-2">
          {project.tags && project.tags.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm cursor-help transition-transform hover:scale-110"
                    style={{ color: project.tags[0].color || '#6b7280', backgroundColor: `${project.tags[0].color || '#6b7280'}40` }}
                  >
                    <IconRenderer icon={project.tags[0].icon || 'TagIcon'} className="h-6 w-6" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-medium">
                  {project.tags[0].name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Link href={`/projects/${project.id}`} className='font-semibold truncate hover:text-primary transition-colors block text-sm'>
           {project.title} 
          </Link>
        </div>
        <div className="text-xs text-muted-foreground/80 line-clamp-1">{project.description}</div>
      </div>

      {/* 3. Client */}
      <div className="w-full md:w-auto text-sm text-muted-foreground truncate hidden md:block">
        {project.clientId ? (
          <Link href={`/clients/${project.clientId}`} className="hover:underline hover:text-primary transition-colors cursor-pointer text-foreground font-medium">
            {project.client?.name ?? clientName ?? `Client ${project.clientId}`}
          </Link>
        ) : (
          project.client?.name ?? clientName ?? 'No client'
        )}
      </div>

      {/* 4. Status */}
      <div className="flex items-center">
        <div className={cn("inline-flex items-center border px-2 py-0.5 font-medium transition-colors shrink-0 text-xs w-full md:w-auto justify-center rounded-full", getStatusColor(project.status))}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5" aria-hidden="true" />
          {displayStatus(project.status)}
        </div>
      </div>

      {/* 5. Progress */}
      <div className="flex items-center gap-3 justify-center w-full md:w-auto">

        <Progress value={project.progress ?? 0} className="h-1.5 w-full" /> <span className="text-sm text-muted-foreground font-semibold">{project.progress ?? 0}%</span>
      </div>

      {/* 6. Tasks */}
      <div className="text-sm hidden md:flex items-center justify-center text-muted-foreground">
        <span className="text-muted-foreground font-medium">-</span>
      </div>

      {/* 7. Time Tracked */}
      <div className="flex items-center justify-center text-sm font-medium text-muted-foreground flex-1 md:flex-none">
        <span className="hidden md:inline text-muted-foreground/50">-</span>
      </div>

      {/* 8. Due Date */}
      <div className={cn("text-sm hidden md:flex items-center gap-1.5 flex-wrap text-muted-foreground")}>
        <time dateTime={project.deadline ? new Date(project.deadline).toISOString() : undefined}>
          {!project.deadline ? "N/A" : formatDate(project.deadline)}
        </time>
      </div>

      {/* 9. Members */}
      <div className="w-full md:w-auto text-sm text-muted-foreground truncate hidden md:flex items-center">
        <span className="hidden md:inline text-muted-foreground/50">-</span>
      </div>

      {/* 10. Actions Dropdown */}
      <div className="flex justify-end">
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
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`} className="flex items-center gap-2 cursor-pointer">
              <ExternalLink className="h-4 w-4" />
              View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}/edit`} className="flex items-center gap-2 cursor-pointer">
              <Pencil className="h-4 w-4" />
              Edit project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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