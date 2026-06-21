'use client'

import DeleteButton from "@/app/(tasks)/components/DeleteTasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Task } from "@/lib/api/tasks"
import { Building, Calendar, FileText } from "lucide-react"
import Link from "next/link"



interface TaskDetailProps {
  task: Task
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    todo: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
    done: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    delayed: "bg-gray-100 text-gray-700 border-gray-200",  
  }
  return statusColors[status] || statusColors.delayed
}

const getPriorityColor = (priority: string) => {
  const priorityColors: Record<string, string> = {
    low: "bg-green-100/70 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-red-100 text-red-700 border-red-200",
  }
  return priorityColors[priority] || priorityColors.medium
}



export const TaskDetail = ({ task }: TaskDetailProps) => {

  const statusDisplay = (task.status || "").replace(/_/g, " ")

  return (
    <div className="relative overflow-hidden border border-border/30 bg-card/50 shadow-sm backdrop-blur-md rounded-xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-blue-500" />

      {/* Header */}
      <CardHeader className="pt-6 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <h3 className="text-xl font-bold leading-tight">
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={'outline'}
              className={cn("text-xs font-medium px-2 py-0.5 rounded-md border", getStatusColor(task.status))}>
              {statusDisplay}
            </Badge>
            <div className={cn("font-semibold text-[10px] rounded px-2 py-0.5 border", getPriorityColor(task.priority))}>
              {(task.priority ?? "medium").toUpperCase()}
            </div>
          </div>
          {task.project && (
            <Link
              href={`/projects/${task.projectId}`}
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-all mt-2"
            >
              <Building className="h-3.5 w-3.5" />
              {task.project.title}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/tasks/${task.id}/edit`}>
            <Button
              variant={'outline'}
              size={'sm'}
            >
              Edit
            </Button>
          </Link>
          <DeleteButton taskId={task.id} taskName={task.title} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {task.summary && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Summary: </span>{task.summary}
            </p>
          </div>
        )}
        {task.description && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>
        )}

        <div className="flex items-baseline gap-4 text-sm text-muted-foreground pt-4 border-t border-border/10">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Updated: {new Date(task.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </div>
  )
}