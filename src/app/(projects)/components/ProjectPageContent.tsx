'use client'

import StatCard from "@/app/(dashboard)/dashboard/components/StatCard"
import { motion } from "framer-motion"
import { Briefcase, PlugIcon, PlusIcon, Search, Pause, XCircle, CheckIcon } from "lucide-react"
import { useState } from "react"
import { ProjectRow } from "./ProjectRow"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Project } from '@/lib/api/projects'

interface Props {
  initialProjects: Project[]
  stats: { total: number; active: number; completed: number ; onHold: number; cancelled: number; }
}

export const ProjectPageContent = ({ initialProjects, stats }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = initialProjects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="container mx-auto py-8 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
        </div>
        <Link href={'projects/new'}>
         <Button className="gap-2">
          <PlusIcon className="h-4 w-4" />
          New Project
         </Button>
        </Link>
      </div>

      {/* Stats Bar  */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.total.toString()} 
          icon={Briefcase}
          color="text-indigo-500"
          bg="bg-indigo-100/70 dark:bg-indigo-600/40"
          gradient="from-indigo-500 to-blue-500"
         />
         <StatCard 
          title="Active"
          value={stats.active.toString()} 
          icon={PlugIcon}
          color="text-blue-500"
          bg="bg-blue-100/70 dark:bg-blue-600/40"
          gradient="from-blue-500 to-cyan-500"
         />
        <StatCard 
          title="Completed"
          value={stats.completed.toString()} 
          icon={CheckIcon}
          color="text-emerald-500"
          bg="bg-emerald-100/70 dark:bg-emerald-600/40"
          gradient="from-emerald-500 to-teal-500"
         />
        <StatCard 
          title="On Hold"
          value={stats.onHold.toString()} 
          icon={Pause}
          color="text-yellow-500"
          bg="bg-yellow-100/70 dark:bg-yellow-600/40"
          gradient="from-yellow-500 to-orange-500"
         />
        <StatCard 
          title="Cancelled"
          value={stats.cancelled.toString()} 
          icon={XCircle}
          color="text-red-500"
          bg="bg-red-100/70 dark:bg-red-600/40"
          gradient="from-red-500 to-pink-500"
         />
      </div>

      {/* Search and List Section */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((project) => (
            <ProjectRow key={project.id} project={project} onDelete={() => {}}/>
          ))}
        </div>
      </div>
    </motion.div>
  )
}