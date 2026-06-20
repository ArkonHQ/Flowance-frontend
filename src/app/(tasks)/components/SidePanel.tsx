'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, } from "@/components/ui/sheet"
import { getTask, Task, Mission, getMissions, addMission, toggleMission, updateMission, deleteMission, updateTask, updateTaskStatus } from "@/lib/api/tasks"
import { useEffect, useState } from "react"
import TaskTimer from "./TaskTimer"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { MissionItem } from "./MissionsItem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderKanbanIcon, Loader2, Plus, Calendar, AlignLeft, ArrowUp, ArrowDown, Minus, Clock, TagsIcon, Trash2, Pencil, Badge } from "lucide-react"
import { ProjectIcon } from "@/components/ui/project-icon"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { formatCompletedAt } from "@/lib/utils/date"
import DeleteButton from "./DeleteTasks"
import Link from "next/link"
import { DynamicIcon } from 'lucide-react/dynamic';
import { TagSelector } from "@/components/ui/tag-selector"


interface SidePanelProps {
  taskId: number | null
  taskTitle: string
  projectTitle: string
  open: boolean
  onDelete: (id: number) => void
  onClose: () => void
  onTimeLogged?: () => void
  onTaskUpdated?: (updatedTask: Task) => void
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

const displayStatus = (status: string) => {
  const statusDisplay: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
    cancelled: 'Cancelled',
    overdue: 'Overdue',
    dealyed: 'Delayed'
  }
  return statusDisplay[status] || statusDisplay.todo
}

const TaskSidePanel = ({ taskId, taskTitle, projectTitle, open, onClose, onTimeLogged, onTaskUpdated, onDelete }: SidePanelProps) => {

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [missionLoading, setMissionLoading] = useState(false)
  const [missions, setMissions] = useState<Mission[]>([])
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [adding, setAdding] = useState<boolean>(false)
  const [togglingMission, setTogglingMission] = useState<number | null> (null)
  const [newMissionName, setNewMissionName] = useState('')


  const completedCount = missions.filter(m => m.completed).length
  const totalCount = missions.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  useEffect(() => {
    if(open && taskId) {
      const fetchMission = async () => {
        setMissionLoading(true)

        try{
          const fetched = await getMissions(taskId)
          setMissions(fetched)
        }catch(error){
          console.error("Error fetching missions:", error)
          setMissions([])
        }finally{
          setMissionLoading(false)
        }
      }

      fetchMission()
    } else {
      setMissions([])
    }
  }, [open, taskId])

  const handleToggleMission = async (missionId: number, completed: boolean) => {
    if (!taskId) return;

    setMissions(prev => prev.map(m =>
      m.id === missionId ? {...m, completed} : m
    ))
    setTogglingMission(missionId)
    try{
      const updated = await toggleMission(missionId, taskId)
      setMissions(prev => prev.map(m => m.id === missionId ? updated : m))
      
       // After successful toggle, compute the updated list
      const updatedMissions = missions.map(m =>
      m.id === missionId ? updated : m
    )
    
    const allCompleted = updatedMissions.every(m => m.completed)

    if (allCompleted) {
      if (task?.status !== 'done') {
        const updatedTask = await updateTaskStatus(taskId, 'done')
        setTask(updatedTask)
        onTaskUpdated?.(updatedTask)
        toast.success('All missions done! Task completed.')
      }
    }else{
      // If the task was previously 'done' but now has incomplete missions mark it as incomplete
      if (task?.status === 'done') {
        const updatedTask = await updateTaskStatus(taskId, 'in_progress')
        setTask(updatedTask)
        onTaskUpdated?.(updatedTask)
        toast.info('Task re‑opened because a mission was unchecked.')
      }
    }

    
    }catch(error){
      
      setMissions(prev => prev.map(m => 
        m.id === missionId ? {...m, completed: !completed } : m
      
      ))
      toast.error('Failed to update mission state')
      
    }finally{
      setTogglingMission(null)
    }

    
  }

  const handleAddMission = async () => {
    const text = newMissionName.trim()
    if(!text || !taskId) return

    setAdding(true)
    setNewMissionName('')

    try{
      const created = await addMission(taskId, text)
      setMissions(prev => [...prev, created])
      toast.success('Mission added')

      if (task?.status === 'done') {
        const updatedTask = await updateTaskStatus(taskId, 'in_progress')
        setTask(updatedTask)
        toast.info('Task re‑opened because a new mission was added.')
      }
    }catch(error){
      setNewMissionName(text)
      toast.error('Failed to add mission')
    }finally{
      setAdding(false)
    }
  }

  const handleUpdateMission = async (missionId: number, newName: string) => {
    if (!taskId ) return

    // 1. Store previous state 
    const previousMission = missions.find(m => m.id === missionId)
    if (!previousMission) return

   // 2. Optimistically update the UI
   setMissions(prev => 
      prev.map(m =>
        m.id === missionId ? {...m, name: newName} : m
      )
   ) 
   // 3. Set loading state for this mission
   setUpdatingId(missionId)

   try {
    // 4. Call API
    const updated = await updateMission(taskId, missionId, {name: newName})
    
    // 5. Replace with server respone (ensures consistency)  
    setMissions(prev => 
      prev.map(m => 
        m.id === missionId ? updated : m
      )
    )

    toast.success('Mission updated')

   } catch (error) {
    // 6. on failure revert state to previous
    setMissions(prev => 
      prev.map(m => 
        m.id === missionId ? previousMission : m
      )
    )
    toast.error('Failed to update mission ')
   }finally{
    setUpdatingId(null) 
   }
  }


  const handleDeleteMission = async (missionId: number ) => {
    if (!taskId) return 

    // 1. Store previous list (for rollback)
    const previousMission = missions

    // 2. Optimistically update the UI
    setMissions(prev => prev.filter(m => m.id !== missionId))

    // 3. Set loading state 
    setUpdatingId(missionId)

    try {
    // 4. Call API
      await deleteMission(taskId, missionId)
      toast.success('Mission deleted successfully')
      
      const newMissions = previousMission.filter(m => m.id !== missionId)
      if (newMissions.length > 0 && newMissions.every(m => m.completed) && task?.status !== 'done') {
        const updatedTask = await updateTaskStatus(taskId, 'done')
        setTask(updatedTask)
        toast.success('All remaining missions done! Task completed.')
      } else if (newMissions.length === 0 && task?.status === 'done') {
        // Optional: If no missions left, maybe keep it done or revert? Usually leave it alone. //Todo if no mission left leave it  alone, but I can add something if I think about a good feature
      }
      
    } catch (error) {
      // 6. On failure return to the previous list
      setMissions(previousMission) 
      toast.error('Failed to delete mission')
    }finally{
      setUpdatingId(null)
    }
  }

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
    } else {
      setTask(null)
    }
  }, [open, taskId, refreshKey])

  const isLargeScreen = useMediaQuery('(min-width: 1536px)')

 useEffect(() => {
  if (open && isLargeScreen) {
    document.body.classList.add('panel-open');
  } else {
    document.body.classList.remove('panel-open');
  }
  return () => document.body.classList.remove('panel-open');
}, [open, isLargeScreen]);

  return (
    <Sheet open={open} onOpenChange={onClose} modal={!isLargeScreen}>
      <SheetContent 
        className={cn("w-full sm:w-[360px] lg:w-[400px] overflow-y-auto rounded-lg border-2 border-card shadow-lg p-0",)}
        side="right"
        style={{ top: 80, bottom: 0, height: 'calc(100vh - 80px)', position: 'fixed' }}
        onPointerDownOutside={(e) => {
          if (isLargeScreen) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (isLargeScreen) {
            e.preventDefault();
          }
        }}
        >
        
        <SheetHeader className="px-6 pt-6">
          {task && (
            <div>
          <span className={`rounded-lg border px-2 py-0.5 text-sm font-bold tracking-wider ${getStatusColor(task.status)}`}>
            {displayStatus(task.status)}
            </span>
            </div> 
          )}
          <SheetTitle className="text-lg font-semibold mt-4">{taskTitle}</SheetTitle>
          <SheetDescription>
          <span className="font-medium">{task?.summery}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-6 pb-6">
          {loading && <p className="text-sm text-muted-foreground italic">Loading task...</p>}
          {!loading && !task && <p className="text-sm text-muted-foreground italic">No task details available.</p>}
          {!loading && task && (
            <div className="rounded-lg space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center">
                  <span className="flex items-center gap-2 w-24 text-muted-foreground"><FolderKanbanIcon className="h-4 w-4" />Project</span>
                  <span className="flex-1 flex justify-center items-center gap-2 text-foreground font-medium">
                    <Link 
                      href={`/projects/${task.project?.id}`}
                      className="text-foreground font-medium hover:underline hover:text-primary"
                    >

                      <ProjectIcon project={task.project} />
                      {task.project?.title || projectTitle || 'No project'}
                    </Link>
                  </span>
                </p>
                <div className="flex items-center">
                  <span className="flex items-center gap-2 w-24 text-muted-foreground"><ArrowUp className="h-4 w-4" />Priority</span>
                  <div className="flex-1 flex justify-center">
                    <div className={cn("inline-flex items-center gap-1 border px-2.5 py-0.5 font-medium transition-colors shrink-0 text-xs justify-center rounded-sm", getPriorityColor(task.priority))}>
                      {task.priority === "high" ? <ArrowUp className="w-3.5 h-3.5" /> : task.priority === "low" ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {(task.priority ?? "medium").charAt(0).toUpperCase() + (task.priority ?? "medium").slice(1)}
                    </div>
                  </div>
                </div>
                <p className="flex items-center">
                  <span className="flex items-center gap-2 w-24 text-muted-foreground"><Calendar className="h-4 w-4" />Deadline</span>
                  <span className="flex-1 text-center text-foreground font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
                </p>
                {task.createdAt && (
                  <p className="flex items-start mt-2">
                    <span className="flex items-center gap-2 w-24 text-muted-foreground"><Clock className="h-4 w-4" />Created At</span>
                    <span className="flex-1 text-center text-foreground font-medium">{formatCompletedAt(task.createdAt)}</span>
                  </p>
                )}
                <div className="flex flex-col gap-2 mt-4 mb-2">
                  <span className="flex items-center gap-2 text-muted-foreground uppercase text-xs font-semibold tracking-wider"><TagsIcon className="h-4 w-4" />Tags</span>
                  <TagSelector 
                    selectedTagIds={task.tags?.map(t => t.id) || []}
                    compact={true}
                    noIcon={true}
                    onChange={async (newTagIds) => {
                      if (!taskId) return;
                      try {
                        const updatedTask = await updateTask(taskId, { tagIds: newTagIds });
                        setTask(updatedTask);
                        onTaskUpdated?.(updatedTask);
                        toast.success('Tags updated');
                      } catch(e) {
                        toast.error("Failed to update tags");
                      }
                    }}
                  />
                </div>
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
              {task.description && (
                <div className="items-center wrap-break-word">
                  <h1 className="flex items-center gap2 w-24 mb-2">Descriptoin</h1>
                  <span className="flex-1 text-muted-foreground font-medium">{task.description}</span>
                </div>
                
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Missions</span>
                  <span className="text-xs text-muted-foreground">{completedCount}/{totalCount} done</span>
                </div>
                <Progress value={progress} className="h-1.5" />

                {missionLoading && <p className="text-xs text-muted-foreground italic">Loading missions...</p>}
                {!missionLoading && missions.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No missions yet.</p>
                )}

                {missions.map(mission => (
                  <MissionItem
                    key={mission.id}
                    {...mission}
                    createdAt={new Date ()}
                    isLoading={updatingId === mission.id}
                    onToggle={handleToggleMission}
                    onEdit={handleUpdateMission}
                    onDelete={handleDeleteMission}
                  />
                ))}

                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Add a mission..."
                    value={newMissionName}
                    onChange={e => setNewMissionName(e.target.value)}
                    disabled={adding}
                    onKeyDown={e => e.key === 'Enter' && handleAddMission()}
                    className="flex-1 text-sm h-8"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={handleAddMission}
                    disabled={adding || !newMissionName.trim()}
                  >
                    {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/tasks/${task.id}/edit`} className="flex-1 ">
              <Button className="w-full">
                <Pencil className="h-4 w4" />
                Edit Task
              </Button>
              </Link>
              <DeleteButton
                taskId={task.id}
                taskName={task.title}
                onDeleted={onDelete}
              >
                <Button variant="destructive" size="icon" className="shrink-0 w-14">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DeleteButton>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default TaskSidePanel