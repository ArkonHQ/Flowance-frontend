'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, } from "@/components/ui/sheet"
import { getTask, Task} from "@/lib/api/tasks"
import { useEffect, useState } from "react"
import TaskTimer from "./TaskTimer"


interface SidePanelProps {
  taskId: number | null
  taskTitle: string
  projectTitle: string
  open: boolean
  onClose: () => void
  onTimeLogged?: () => void
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    todo: "bg-blue-100/70 text-blue-700 border-blue-200",
    in_progress: "bg-yellow-100/70 text-yellow-700 border-yellow-200",
    done: "bg-emerald-100/70 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100/70 text-red-700 border-red-200",
    delayed: "bg-gray-100/70 text-gray-700 border-gray-200",
    overdue: "bg-rose-100/70 text-rose-700 border-rose-200",
  }
  return statusColors[status] || statusColors.delayed
}
const getPriorityColor = (priority: string) => {
  const priorityColors: Record<string, string> = {
    low: "bg-green-100/70 text-green-700 border-green-200",
    medium: "bg-yellow-100/70 text-yellow-700 border-yellow-200",
    high: "bg-red-100/70 text-red-700 border-red-200",
  }
  return priorityColors[priority] || priorityColors.medium
}


const TaskSidePanel = ({ taskId, taskTitle, projectTitle, open, onClose, onTimeLogged }: SidePanelProps) => {

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetchTask = () => setRefreshKey(prev => prev + 1)

  useEffect(() => {
    if (open && taskId) {
      const fetchTask = async () => {
        setLoading(true)
        try {
            const fetchedTask = await getTask(taskId)
            setTask(fetchedTask)
        } catch (error) {
          console.error("Error fetching task:", error)
          setTask(null)
        } finally {
          setLoading(false)
        }
    }

    fetchTask()
    }
  }, [open, taskId, refreshKey])


  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold mt-4">Task details</SheetTitle>
          <SheetDescription className="mb-4">
            Viewing: <span className="font-medium">{taskTitle}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading && <p className="text-sm text-muted-foreground italic">Loading task...</p>}
          {!loading && !task && <p className="text-sm text-muted-foreground italic">No task details available.</p>}
          {!loading && task && (
            <div className="border rounded-lg p-4 space-y-4 bg-card/50">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium leading-tight">{task.title}</h3>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Project:</span> {task.project?.title ?? projectTitle ?? 'No project'}</p>
                <p><span className="font-semibold text-foreground">Priority:</span> {task.priority}</p>
                <p><span className="font-semibold text-foreground">Deadline:</span> {new Date(task.deadline).toLocaleDateString()}</p>
                {task.description && <p><span className="font-semibold text-foreground">Description:</span> {task.description}</p>}
              </div>

              <TaskTimer 
                taskStatus={task.status}
                taskId={task.id}
                taskName={task.title}
                onTimeLogged={() => {
                  refetchTask()
                  onTimeLogged?.()
                }}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default TaskSidePanel