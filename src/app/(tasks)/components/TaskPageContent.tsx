'use client'
import { motion } from "framer-motion";
import { Task } from "@/lib/api/tasks"
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, PlusIcon, ListTodo, Activity, CheckCircle, XCircle, Clock, AlertCircle, Search, FilterX } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/input";
import { TaskCardRow } from "./TaskCardRow";


interface Props {
  initialTask: Task[]
  stats: { total: number; todo: number, in_progress: number, done: number, cancelled: number, delayed: number, high: number}
}

export const TaskPageContent = ({ initialTask, stats }: Props) => {
  const [tasks, setTasks] = useState<Task[]>(initialTask);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } }
      className="container mx-auto py-8 px-4 md:px-6 space-y-8"
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
          value={stats.total.toString()} 
          icon={Briefcase}
          color="text-indigo-500"
          bg="bg-indigo-100/70 dark:bg-indigo-950/40"
          gradient="from-indigo-500 to-blue-500"
        />
        <StatCard 
          title="To Do"
          value={stats.todo.toString()} 
          icon={ListTodo}
          color="text-sky-500"
          bg="bg-sky-100/70 dark:bg-sky-950/40"
          gradient="from-sky-500 to-blue-500"
        />
        <StatCard 
          title="In Progress"
          value={stats.in_progress.toString()} 
          icon={Activity}
          color="text-yellow-500"
          bg="bg-yellow-100/70 dark:bg-yellow-950/40"
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard 
          title="Done"
          value={stats.done.toString()} 
          icon={CheckCircle}
          color="text-emerald-500"
          bg="bg-emerald-100/70 dark:bg-emerald-950/40"
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard 
          title="Delayed"
          value={stats.delayed.toString()} 
          icon={Clock}
          color="text-orange-500"
          bg="bg-orange-100/70 dark:bg-orange-950/40"
          gradient="from-orange-500 to-red-500"
        />
        <StatCard 
          title="Cancelled"
          value={stats.cancelled.toString()} 
          icon={XCircle}
          color="text-red-500"
          bg="bg-red-100/70 dark:bg-red-950/40"
          gradient="from-red-500 to-pink-500"
        />
        <StatCard 
          title="High Priority"
          value={stats.high.toString()} 
          icon={AlertCircle}
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
            {filtered.map((task) => (
              <TaskCardRow key={task.id} task={task} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
