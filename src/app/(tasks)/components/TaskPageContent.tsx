'use client'
import { motion } from "framer-motion"
import { Task, getAllTasks, updateTask, deleteTask } from "@/lib/api/tasks"
import { Project } from "@/lib/api/projects"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from 'sonner'
import { Checkbox } from "@/components/ui/checkbox"
import { Briefcase, PlusIcon, ListTodo, Activity, CheckCircle, Clock, FilterX } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StatCard } from "@/components/ui/StatCard"
import { TaskCardRow } from "./TaskCardRow"
import { PaginationFooter } from "@/app/components/pagination-footer"
import TaskSidePanel from "./SidePanel"
import { TaskForm } from "./TaskForm"
import { EditTaskForm } from "./EditTaskForm"
import { TasksBulkActions } from "./tasks-bulk-actions"
import FilterSortRow from "./FilterSortRow"
import { isTaskInThisWeek } from "@/lib/utils/date"
import { FocusedTask } from "./FocusedTask"

//TODO Assignees not ready now i put it for project until i add team collaboration features

interface Props {
  totalHours: number
  lastWeekHours: number
  initialTask: Task[]
  stats: { total: number, todo: number, in_progress: number, done: number, cancelled: number, delayed: number, totalHours: number, overdue: number }
  projects: Project[]
}

export const TaskPageContent = ({ initialTask, stats, projects, lastWeekHours, totalHours }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(initialTask)
  const [taskStats, setTaskStats] = useState(stats)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Filter/Sort State 
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('')


  // Persist selected task for side panel
  const [selectedTask, setSelectedTask] = useState<{ id: number, title: string, projectTitle: string | null, project?: Project | null } | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('fcc_selected_task')
    return saved ? JSON.parse(saved) : null
  })

  // Sync selectedTask to localStorage whenever it changes for side panel in order to remember selected task after refresh
  useEffect(() => {
    if (selectedTask) {
      localStorage.setItem('fcc_selected_task', JSON.stringify(selectedTask))
    } else {
      localStorage.removeItem('fcc_selected_task')
    }
  }, [selectedTask])

  // Side panel state persisted in localStorage to survive refreshes
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('fcc_side_panel_open')
    return saved ? JSON.parse(saved) : false
  })

  // Focused task state persisted in localStorage so it survives refreshes
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('fcc_focused_task_id')
    return saved ? Number(saved) : null
  })

  // Sync to localStorage whenever it changes for side panel
  useEffect(() => {
    if (isPanelOpen) {
      localStorage.setItem('fcc_side_panel_open', JSON.stringify(isPanelOpen))
    } else {
      localStorage.removeItem('fcc_side_panel_open')
    }
  }, [isPanelOpen])

  // Sync to localStorage whenever it changes for focused task
  useEffect(() => {
    if (focusedTaskId !== null) {
      localStorage.setItem('fcc_focused_task_id', String(focusedTaskId))
    } else {
      localStorage.removeItem('fcc_focused_task_id')
    }
  }, [focusedTaskId])

  
  // Side panel shortcut ']'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      if (e.key === ']') {
        e.preventDefault()
        setIsPanelOpen(prev => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Keyboard navigation for focused task - Up/Down to move, Enter/Escape to toggle
  useEffect(() => {
    const handleTaskNavigation = (e: KeyboardEvent) => {
      if (!focusedTaskId || !filtered.length) return

      // Don't interfere with input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      const currentIndex = filtered.findIndex(t => t.id === focusedTaskId)
      if (currentIndex === -1) return

      let nextIndex: number | null = null

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = currentIndex - 1
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = currentIndex + 1
      }

      if (nextIndex !== null && nextIndex >= 0 && nextIndex < filtered.length) {
        setFocusedTaskId(filtered[nextIndex].id)
      }
    }

    window.addEventListener("keydown", handleTaskNavigation)
    return () => window.removeEventListener("keydown", handleTaskNavigation)
  }, [focusedTaskId, tasks])


  // Create new task with 'n' then 't' shortcuts.
  // Implementing the timer logic in order to press n then t within 1 second .
  useEffect(() => {
    // This to understand what was the last pressed key.
    let lastKey = ''
    // This will reset the lastKey and lastTime if the user doesn't press 'n' then 't' within 1 second.
    let lastTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields.
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      const now = Date.now()

      if (e.key.toLowerCase() === 't' && lastKey === 'n' && now - lastTime < 1000) {
        e.preventDefault()
        setIsCreateModalOpen(true)
        lastKey = ''
      }else if (e.key === 'Escape') {
        e.preventDefault()
        setIsCreateModalOpen(false)
      }else {
        // This to update the lastKey and lastTime if the user press any key.
        lastKey = e.key.toLowerCase()
        lastTime = now
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])


  // Focus handler
  const handleToggleFocus = (taskId: number) => {
    setFocusedTaskId(prev => (prev === taskId ? null : taskId))
  }

  const focusedTask = focusedTaskId
    ? tasks.find(f => f.id === focusedTaskId) ?? null
    : null


  // Compute weekly stats
  const weeklyTasks = tasks.filter(isTaskInThisWeek)
  const weeklyTotal = weeklyTasks.length

  const totalTasks = taskStats.total
  const statusPercentage = {
    todo: totalTasks > 0 ? Math.round((taskStats.todo / totalTasks) * 100) : 0,
    done: totalTasks > 0 ? Math.round((taskStats.done / totalTasks) * 100) : 0,
    in_progress: totalTasks > 0 ? Math.round((taskStats.in_progress / totalTasks) * 100) : 0,
    cancelled: totalTasks > 0 ? Math.round((taskStats.cancelled / totalTasks) * 100) : 0,
    overdue: totalTasks > 0 ? Math.round((taskStats.overdue / totalTasks) * 100) : 0,
    delayed: totalTasks > 0 ? Math.round((taskStats.delayed / totalTasks) * 100) : 0,
  }



  const filtered = useMemo(() => {
    let result = [...tasks]

    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((task) =>
        task.title?.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q)
      )
    }

    if (priorityFilter) {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    if (projectFilter) {
      result = result.filter((task) => String(task.projectId) === projectFilter)
    }

    if (assigneeFilter) {
      result = result.filter((task) => task.ownerId === assigneeFilter)
    }

    if (tagFilter) {
      result = result.filter((task) =>
        task.tags.some((tag) => tag.id.toString() === tagFilter))

    }

    switch (sortBy) {
      case 'dueDate':
        result.sort(
          (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
        break
      case 'priority': {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
        break
      }
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, projectFilter, sortBy, tagFilter])


  const pageSize = 7

  const refreshTasksAndStats = async () => {
    try {
      const { tasks: refreshedTasks, totalHours } = await getAllTasks()
      setTasks(refreshedTasks)
      const total = refreshedTasks.length
      const todo = refreshedTasks.filter(t => t.status === 'todo').length
      const in_progress = refreshedTasks.filter(t => t.status === 'in_progress').length
      const done = refreshedTasks.filter(t => t.status === 'done').length
      const cancelled = refreshedTasks.filter(t => t.status === 'cancelled').length
      const delayed = refreshedTasks.filter(t => t.status === 'delayed').length
      const overdue = refreshedTasks.filter(t => t.status === 'overdue').length

      setTaskStats({ total, todo, in_progress, done, cancelled, delayed, totalHours, overdue })
    } catch (error) {
      console.error('Failed to refresh tasks and stats after time logging:', error)
    }
  }

  const projectLookup = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects])

  const handleOpenPanel = (taskId: number, taskTitle: string, project: Project | null) => {
    setSelectedTask({ id: taskId, title: taskTitle, projectTitle: project?.title ?? null, project })
    setIsPanelOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task)
    setIsEditModalOpen(true)
  }


  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedTasks = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedIds(new Set())
  }

  const handleDelete = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleToggle = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds)
    paginatedTasks.forEach(t => {
      if (checked) next.add(t.id)
      else next.delete(t.id)
    })
    setSelectedIds(next)
  }

  const isAllSelected = paginatedTasks.length > 0 && paginatedTasks.every(t => selectedIds.has(t.id))

  // Bulk status update action
  const handleBulkStatusChange = async (newStatus: Task['status']) => {
    const idsToUpdate = Array.from(selectedIds)
    if (idsToUpdate.length === 0) return

    const toastId = toast.loading(`Updating ${idsToUpdate.length} tasks to ${newStatus.replace(/_/g, ' ')}...`)
    try {
      await Promise.all(idsToUpdate.map(id => updateTask(id, { status: newStatus })))

      setTasks(prev => prev.map(t => {
        if (selectedIds.has(t.id)) {
          return { ...t, status: newStatus }
        }
        return t
      }))

      toast.success(`Successfully updated ${idsToUpdate.length} tasks`, { id: toastId })
      setSelectedIds(new Set())
      await refreshTasksAndStats()
    } catch (err: any) {
      toast.error(`Failed to update some tasks: ${err.message || 'Error'}`, { id: toastId })
    }
  }

  // Bulk priority update action
  const handleBulkPriorityChange = async (newPriority: Task['priority']) => {
    const idsToUpdate = Array.from(selectedIds)
    if (idsToUpdate.length === 0) return

    const toastId = toast.loading(`Updating ${idsToUpdate.length} tasks priority...`)
    try {
      await Promise.all(idsToUpdate.map(id => updateTask(id, { priority: newPriority })))

      setTasks(prev => prev.map(t => {
        if (selectedIds.has(t.id)) {
          return { ...t, priority: newPriority }
        }
        return t
      }))

      toast.success(`Successfully updated ${idsToUpdate.length} tasks`, { id: toastId })
      setSelectedIds(new Set())
      await refreshTasksAndStats()
    } catch (err: any) {
      toast.error(`Failed to update priority: ${err.message || 'Error'}`, { id: toastId })
    }
  }

  // Bulk delete action
  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds)
    if (idsToDelete.length === 0) return

    const toastId = toast.loading(`Deleting ${idsToDelete.length} tasks...`)
    try {
      await Promise.all(idsToDelete.map(id => deleteTask(id)))

      setTasks(prev => prev.filter(t => !selectedIds.has(t.id)))

      toast.success(`Successfully deleted ${idsToDelete.length} tasks`, { id: toastId })
      setSelectedIds(new Set())
      setCurrentPage(1)
      await refreshTasksAndStats()
    } catch (err: any) {
      toast.error(`Failed to delete some tasks: ${err.message || 'Error'}`, { id: toastId })
    }
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const handleMissionsChanged = (taskId: number, missions: any[]) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, missions } : t
    ))
  }

  useEffect(() => {
    const handleTaskTimeLogged = () => {
      refreshTasksAndStats()
    }

    window.addEventListener('taskTimeLogged', handleTaskTimeLogged)
    return () => window.removeEventListener('taskTimeLogged', handleTaskTimeLogged)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [searchQuery, priorityFilter, assigneeFilter, projectFilter, statusFilter, tagFilter])

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="container mx-auto py-8 px-4 md:px-6 space-y-8 pb-28"
      >

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tasks</h2>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Tasks"
            value={taskStats.total.toString()}
            icon={Briefcase}
            color="text-yellow-500"
            bg="bg-yellow-100/70 dark:bg-yellow-950/40"
            gradient="from-yellow-500 to-orange-500"
            trend={{ value: weeklyTotal, isPositive: true, label: "this week", suffix: "" }}
          />
          <StatCard
            title="In Progress"
            value={taskStats.in_progress.toString()}
            icon={Activity}
            color="text-blue-500"
            bg="bg-blue-100/70 dark:bg-blue-950/40"
            gradient="from-blue-500 to-cyan-500"
            trend={{ value: statusPercentage.in_progress, isPositive: true, label: "of total" }}
          />
          <StatCard
            title="Completed"
            value={taskStats.done.toString()}
            icon={CheckCircle}
            color="text-emerald-500"
            bg="bg-emerald-100/70 dark:bg-emerald-950/40"
            gradient="from-emerald-500 to-teal-500"
            trend={{ value: statusPercentage.done, isPositive: true, label: "of total" }}
          />
          <StatCard
            title="Total Time"
            value={(() => {
              const h = Math.floor(taskStats.totalHours)
              const m = Math.round((taskStats.totalHours - h) * 60)
              if (h === 0 && m === 0 && taskStats.totalHours > 0) return '0 m'
              if (h === 0) return `${m}m`
              return `${h}h ${m}m`
            })()}
            icon={Clock}
            color="text-indigo-500"
            bg="bg-indigo-100/70 dark:bg-indigo-950/40"
            gradient="from-indigo-500 to-purple-500"
            trend={(() => {
              // Compute percentage difference
              const current = taskStats.totalHours
              // lastWeekHours is the hours logged in the LAST 7 days (as of page load).
              // So the total hours as of 7 days ago is the initial totalHours - lastWeekHours
              const previous = totalHours - lastWeekHours

              let percentChange = 0
              if (previous > 0) {
                percentChange = Math.round(((current - previous) / previous) * 100)
              } else if (current > 0) {
                percentChange = 100
              }
              return {
                value: percentChange,
                isPositive: percentChange >= 0,
                label: 'from last week',
                suffix: '%'
              }
            })()}
          />
          <StatCard
            title="Overdue"
            value={taskStats.overdue.toString()}
            icon={Clock}
            color="text-red-500"
            bg="bg-red-100/70 dark:bg-red-950/40"
            gradient="from-red-500 to-pink-500"
            trend={{ value: statusPercentage.overdue, isPositive: statusPercentage.overdue === 0, label: "of total" }}
          />
          <StatCard
            title="To Do"
            value={taskStats.todo.toString()}
            icon={ListTodo}
            color="text-rose-500"
            bg="bg-rose-100/70 dark:bg-rose-950/40"
            gradient="from-rose-500 to-pink-600"
            trend={{ value: statusPercentage.todo, isPositive: true, label: "of total" }}
          />
        </div>

        <div className="flex">
          <FilterSortRow
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            assigneeFilter={assigneeFilter}
            onAssigneeChange={setAssigneeFilter}
            projectFilter={projectFilter}
            onProjectChange={setProjectFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            sortBy={sortBy}
            tagFilter={tagFilter}
            onTagChange={setTagFilter}
            onSortChange={setSortBy}
            tags={Array.from(new Map(tasks.flatMap(t => t.tags || []).map(tag => [tag.id, tag])).values())}
            assignees={projects.map(p => ({ id: p.id, name: p.title }))}
            projects={projects.map((project) => ({ id: project.id, name: project.title, project }))}
            priorities={['low', 'medium', 'high']}
            sortOptions={[
              { value: 'dueDate', label: 'Due Date' },
              { value: 'priority', label: 'Priority' },
              { value: 'title', label: 'Title' },
            ]}


          />
        </div>

        {/* Search and List Section */}
        <div className="space-y-4 border p-2 border-border/40 rounded-xl bg-background backdrop-blur-sm">
          {tasks.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between mb-4 border-border/40 py-5 border-b rounded-md">
              <nav className="flex flex-wrap gap-8 md:gap-12 text-base font-medium text-gray-500 mx-4">
                <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>All Tasks <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{taskStats.total}</span></button>
                <button onClick={() => setStatusFilter('todo')} className={statusFilter === 'todo' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>To Do <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{taskStats.todo}</span></button>
                <button onClick={() => setStatusFilter('in_progress')} className={statusFilter === 'in_progress' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>In Progress <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{taskStats.in_progress}</span></button>
                <button onClick={() => setStatusFilter('done')} className={statusFilter === 'done' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>Completed <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{taskStats.done}</span></button>
                <button onClick={() => setStatusFilter('overdue')} className={statusFilter === 'overdue' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>Overdue <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{taskStats.overdue}</span></button>
              </nav>
            </div>
          )}

          {focusedTask && (
            <FocusedTask
              task={focusedTask}
              onClose={() => setFocusedTaskId(null)}
              onEdit={() => handleEditTask(focusedTask)}
              onDelete={(id) => { handleDelete(id); setFocusedTaskId(null) }}
              onOpenPanel={handleOpenPanel}
              onTimeLogged={refreshTasksAndStats}
            />
          )}

          {tasks.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-2xl bg-card/20 backdrop-blur-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium">No tasks yet</h3>
              <p className="text-muted-foreground mt-1">No tasks have been created yet.</p>
              <Link href='/tasks/new' className="inline-block mt-4">
                <Button variant='outline' className="dark:bg-gray-950 bg-white/20 backdrop-blur-md border hover:bg-indigo-400 transition-all">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-2xl bg-card/20 backdrop-blur-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FilterX className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium">No tasks match your search</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search for "{searchQuery}" </p>
              <Button variant="link" onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setProjectFilter('all')
                setTagFilter(null)
                setPriorityFilter(null)
              }} className="mt-2 text-primary">
                Clear search
              </Button>
            </div>
          ) : (
            // Table Header (Hidden on Mobile)
            <div className="grid grid-3">
              {filtered.length > 0 && (
                <div className="hidden md:grid grid-cols-[40px_minmax(200px,350px)_140px_110px_110px_130px_100px_110px_40px] gap-4 py-3 px-5 text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-border/25 z-10">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Select all tasks on current page"
                      className="border-slate-300 dark:border-muted-foreground/45 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                  <div>Task</div>
                  <div>Tags</div>
                  <div className="text-left">Priority</div>
                  <div>Due Date</div>
                  <div>Missions</div>
                  <div className="text-center">Timer</div>
                  <div className="text-left">Status</div>
                  <div></div>
                </div>
              )}
              {paginatedTasks.map((task) => {
                const fullProject = task.project ?? projectLookup.get(task.projectId)
                const taskWithProject = { ...task, project: fullProject }
                const projectTitle = fullProject?.title ?? null
                return (
                  <TaskCardRow
                    key={task.id}
                    task={taskWithProject}
                    onToggleFocus={handleToggleFocus}
                    isFocused={focusedTaskId === task.id}
                    projectTitle={projectTitle}
                    onDelete={handleDelete}
                    onOpenPanel={handleOpenPanel}
                    onEdit={() => handleEditTask(taskWithProject)}
                    isSelected={selectedIds.has(task.id)}
                    onToggle={handleToggle}
                  />
                )
              })}
            </div>
          )}
          {filtered.length > 0 && (
            <div className="mt-4 rounded-2xl border-t border-border/40 bg-background px-5 py-4 backdrop-blur-md">
              <PaginationFooter
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onChangePage={handlePageChange}
                label='tasks'
              />
            </div>
          )}
        </div>
      </motion.div>

      <TaskSidePanel
        onTaskUpdated={handleTaskUpdated}
        onMissionsChanged={handleMissionsChanged}
        taskId={selectedTask?.id ?? null}
        taskTitle={selectedTask?.title ?? ''}
        projectTitle={selectedTask?.projectTitle ?? ''}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onTimeLogged={refreshTasksAndStats}
        onDelete={handleDelete}
        onEdit={() => {
          const fullTask = tasks.find(t => t.id === selectedTask?.id)
          if (fullTask) handleEditTask(fullTask)
        }}
      />

      {selectedIds.size > 0 && (
        <TasksBulkActions
          selectedCount={selectedIds.size}
          onBulkStatusChange={(status) => handleBulkStatusChange(status)}
          onBulkPriorityChange={handleBulkPriorityChange}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}
      <TaskForm
        projects={projects}
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
        }}
        onTaskCreated={refreshTasksAndStats}
      />
      {taskToEdit && (
        <EditTaskForm
          task={{
            id: taskToEdit.id,
            title: taskToEdit.title,
            summary: taskToEdit.summary || undefined,
            description: taskToEdit.description || undefined,
            status: taskToEdit.status as 'todo' | 'in_progress' | 'done' | 'cancelled' | 'delayed',
            priority: taskToEdit.priority as 'low' | 'medium' | 'high',
            deadline: taskToEdit.deadline,
            tagIds: taskToEdit.tags?.map(t => t.id) || [],
            missions: taskToEdit.missions?.map(m => ({ id: m.id, name: m.name, completed: m.completed })),
            projectId: taskToEdit.projectId,
          }}
          projects={projects}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setTaskToEdit(null)
          }}
          onTaskUpdated={refreshTasksAndStats}
        />
      )}
    </TooltipProvider>
  )
}
