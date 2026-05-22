'use client'
import { Badge } from "@/components/ui/badge"; 
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


interface ProjectRowProps {
  project: Project
  onDelete: (id: number) => void
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

const formatDate = (date: Date | String) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
}

export const ProjectRow = ({ project, onDelete }: ProjectRowProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const statusDisplay = project.status.replace('_', ' ')

  return (
    <div className='grid grid-cols-12 gap-4 items-center px-5 py-4 bg-card/50 backdrop-blur-md rounded-xl border border-card/30 shadow-sm hover:shadow-lg transition-all'>
      
      {/* Title + status - col-span-4 */}
      <div className='col-span-4 flex items-center gap-3 min-w-0'>
        <Badge variant="outline" className={cn("capitalize font-medium", getStatusColor(project.status))}>
          {statusDisplay}
        </Badge>
        <Link href={`/projects/${project.id}`} className='font-semibold truncate hover:text-primary'>
         {project.title} 
         </Link>
      </div>

      {/* Description - col-span-3 */}
      <div className="col-span-3 text-sm text-muted-foreground truncate">
        <span className="text-xs font-medium text-gray-400 mr-1">Client:</span>
        {project.client?.name ?? 'No client'}
      </div>

      {/* Progress - col-span-2 */}
      <div className="col-span-2 flex flex-col gap-1">
        <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <span>Progress</span>
          <span>{project.progress ?? 0}%</span>
        </div>
        <Progress value={project.progress ?? 0} className="h-1.5" />
      </div>

      {/* Last updated - col-span-2 */}
      <div className="col-span-2 text-sm text-muted-foreground">
        {formatDate(project.updatedAt)}
      </div>

      <div className="col-span-1 flex justify-end">
        <DropdownMenu
         open={isOpen} onOpenChange={setIsOpen}>
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