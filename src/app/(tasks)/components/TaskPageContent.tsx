'use client'
import { motion } from "framer-motion";
import { Task, getAllTasks } from "@/lib/api/tasks"
import { Project } from "@/lib/api/projects"
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, PlusIcon, ListTodo, Activity, CheckCircle, XCircle, Clock, AlertCircle, Search, FilterX, WatchIcon } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/input";
import { TaskCardRow } from "./TaskCardRow";
import { PaginationFooter } from "@/app/components/pagination-footer";
import TaskSidePanel from "./SidePanel";



interface Props {
  initialTask: Task[]
  stats: { total: number; todo: number, in_progress: number, done: number, cancelled: number, delayed: number, totalHours: number, overdue: number}
  projects: Project[]
}

export const TaskPageContent = ({ initialTask, stats, projects }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(initialTask);
  const [taskStats, setTaskStats] = useState(stats);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<{ id: number; title: string; projectTitle: string | null } | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const pageSize = 7;

  const refreshTasksAndStats = async () => {
    try {
      const { tasks: refreshedTasks, totalHours } = await getAllTasks();
      setTasks(refreshedTasks);
      const total = refreshedTasks.length;
      const todo = refreshedTasks.filter(t => t.status === 'todo').length;
      const in_progress = refreshedTasks.filter(t => t.status === 'in_progress').length;
      const done = refreshedTasks.filter(t => t.status === 'done').length;
      const cancelled = refreshedTasks.filter(t => t.status === 'cancelled').length;
      const delayed = refreshedTasks.filter(t => t.status === 'delayed').length;
      const overdue = refreshedTasks.filter(t => t.status === 'overdue').length;

      setTaskStats({ total, todo, in_progress, done, cancelled, delayed, totalHours, overdue });
    } catch (error) {
      console.error('Failed to refresh tasks and stats after time logging:', error);
    }
  };

  const projectLookup = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.title]));
  }, [projects]);

  const handleOpenPanel = (taskId: number, taskTitle: string, projectTitle: string | null) => {
    setSelectedTask({ id: taskId, title: taskTitle, projectTitle });
    setIsPanelOpen(true);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return tasks;

    return tasks.filter(t => {
      const projectName = t.project?.title.toLowerCase() ?? '';
      return (
        t.title.toLowerCase().includes(term) ||
        projectName.includes(term)
      );
    });
  }, [tasks, searchTerm]);

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedTasks = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset to first page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const handleTaskTimeLogged = () => {
      refreshTasksAndStats()
    }

    window.addEventListener('taskTimeLogged', handleTaskTimeLogged)
    return () => window.removeEventListener('taskTimeLogged', handleTaskTimeLogged)
  }, [])

  return (
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
        <Link href='/tasks/new'>
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New Task
          </Button>
        </Link>
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
        />
        <StatCard 
          title="In Progress"
          value={taskStats.in_progress.toString()} 
          icon={Activity}
          color="text-blue-500"
          bg="bg-blue-100/70 dark:bg-blue-950/40"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard 
          title="Completed"
          value={taskStats.done.toString()} 
          icon={CheckCircle}
          color="text-emerald-500"
          bg="bg-emerald-100/70 dark:bg-emerald-950/40"
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard 
          title="Total Hours"
          value={taskStats.totalHours.toFixed(1).concat(' hrs')} 
          icon={Clock}
          color="text-indigo-500"
          bg="bg-indigo-100/70 dark:bg-indigo-950/40"
          gradient="from-indigo-500 to-purple-500"
        />
        <StatCard 
          title="Overdue"
          value={taskStats.overdue.toString()} 
          icon={Clock}
          color="text-red-500"
          bg="bg-red-100/70 dark:bg-red-950/40"
          gradient="from-red-500 to-pink-500"
        />
        <StatCard 
          title="To Do"
          value={taskStats.todo.toString()} 
          icon={ListTodo}
          color="text-rose-500"
          bg="bg-rose-100/70 dark:bg-rose-950/40"
          gradient="from-rose-500 to-pink-600"
        />
      </div>

      {/* Search and List Section */}
      <div className="space-y-4">
        {tasks.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search for tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
              <p className="text-muted-foreground mt-1">Try adjusting your search for &quot;{searchTerm}&quot;</p>
              <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-primary">
                Clear search
              </Button>
            </div>
        ) : (
          <div className="grid gap-3">
            {paginatedTasks.map((task) => {
              const projectTitle = task.project?.title ?? projectLookup.get(task.projectId) ?? null;
              return (
                <TaskCardRow
                  key={task.id}
                  task={task}
                  projectTitle={projectTitle}
                  onDelete={handleDelete}
                  onOpenPanel={handleOpenPanel}
                />
              )
            })}
          </div>
        )}
        {filtered.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 dark:bg-card/80 backdrop-blur-md border-t border-border px-6 py-4 z-20 lg:left-64">
            <div className="max-w-7xl mx-auto w-full">
              <PaginationFooter 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onChangePage={handlePageChange}
                label='tasks'
              />
            </div>
          </div>
        )}
      </div>

      <TaskSidePanel 
        taskId={selectedTask?.id ?? null}
        taskTitle={selectedTask?.title ?? ''}
        projectTitle={selectedTask?.projectTitle ?? ''}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onTimeLogged={refreshTasksAndStats}
      />
    </motion.div>
  )
}
