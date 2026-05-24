'use client'
import { motion } from "framer-motion";
import { Task } from "@/lib/api/tasks"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, PlusIcon, ListTodo, Activity, CheckCircle, XCircle, Clock, AlertCircle, Search } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/input";
import { TaskCardRow } from "./TaskCardRow";


interface Props {
  initialTask: Task[]
  stats: { total: number; todo: number, in_progress: number, done: number, cancelled: number, delayed: number, high: number}
}

export const TaskPageContent = ({ initialTask, stats }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = initialTask.filter(t => {
    const projectName = t.project?.title.toLowerCase() ?? ''
    return (
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectName.includes(searchTerm.toLowerCase())
    )
  })

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } }
      className="container mx-auto py-8 px-4 md:px-6 space-y-6"
      >

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
        </div>
        <Link href={'tasks/new'}>
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
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search for tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full flex h-10 rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCardRow key={task.id} task={task} onDelete={() => history.back()} />
          ))}
        </div>
      </div>
      
      
      </motion.div>
  )


}
