'use client'


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Task } from "@/lib/api/tasks"
import { cn } from "@/lib/utils"
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import  Link  from "next/link"
import { useState } from "react"
import DeleteButton from "./DeleteTasks"





interface TaskCardRowProps {
  task: Task
  onDelete: (id:number) => void
}

  // 1.Define Colors if exist 
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      todo: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      delayed: 'bg-gray-100 text-gray-700 border-gray-200', 
    }
    return statusColors[status] || statusColors.delayed
  }
  const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    }
    return priorityColors[priority] || priorityColors.medium
  }


  // 2.Define Format Date
  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
  }



export const TaskCardRow = ( { task, onDelete }: TaskCardRowProps ) => {

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const statusDisplay = task.status.replace('_', ' ')


  return (

    <div className="grid grid-cols-14 gap-4 items-center px-5 py-4 bg-card/50 backdrop-blur-md rounded-xl border border-border/30 shadow-sm hover:shadow-lg transition-all">

      {/* Title & status */}
      <div className="flex col-span-4 items-center gap-3 min-w-0">
      <Badge variant="outline" className={cn('capitalize font-medium', getStatusColor(task.status))}>
        {statusDisplay}
      </Badge>
      <Link href={`/tasks/${task.id}`} className="font-semibold truncate hover:text-primary">
        {task.title}
        </Link>
      </div>

      {/* Description - col-span-3 */}
      <div className="col-span-3 text-sm text-muted-foreground truncate ">
        <span className="text-xs font-medium text-gray-400 mr-1">Project:</span>
        {task.project?.title ?? 'No project'}
      </div>

      {/* Progress - col-span-2 */}
      <div className="col-span-2 flex flex-col gap-1">
        <div className="flex jucstify-between text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
          <span>Progress</span>
          <span>{task.progress ?? 0}%</span>
        </div>
        <Progress value={task.progress ?? 0} className='h-1.5' />
      </div>

      {/* Last updated - col-span-2 */}
      <div className="col-span-2 text-muted-foreground text-sm">
        {formatDate(task.updatedAt)}
      </div>

      {/* Priority - col-span-2 */}
      <div className={cn("col-span-2 font-semibold", getPriorityColor(task.priority))}>
        {task.priority.toUpperCase()}
      </div>

      {/* Actions - col-span-1 */}
      <div className="col-span-1 flex justify-end">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              className={cn('h-8 w-8 rounded-full', isOpen ? 'bg-gray-200 text-indigo-600' : 'text-gray-400')}
              variant={'ghost'}
              size={'icon'}
            >
              <MoreHorizontal 
                className={cn('h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-0 text-indigo-600' : 'rotate-90 text-gray-400')}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild> 
              <Link href={`{tasks/${task.id}`} >
                <ExternalLink 
                  className="h-4 w-4" />
                  View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`{tasks/${task.id}/edit}`}>
                <Pencil className="h-4 w-4" />
                Edit task
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
              <DeleteButton
                taskId={task.id}
                taskName={task.title}
                redirectAfterDelete={false}
              >
                <span className="flex items-center gap-2 text-destructive cursor-pointer w-full">
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