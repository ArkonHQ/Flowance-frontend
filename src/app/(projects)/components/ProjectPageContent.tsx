'use client'

import StatCard from "@/app/(dashboard)/dashboard/components/StatCard"
import { motion } from "framer-motion"
import { Briefcase, PlugIcon, PlusIcon, Search, Pause, XCircle, CheckIcon } from "lucide-react"
import { useState } from "react"
import { ProjectRow } from "./ProjectRow"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Project } from '@/lib/api/projects'
import { PaginationFooter } from "@/app/components/PaginationFooter"


interface Props {
  initialProjects: Project[]
  clientNames: Record<number, string>
  stats: { total: number; active: number; completed: number ; onHold: number; cancelled: number; }
}

export const ProjectPageContent = ({ initialProjects, clientNames, stats }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

const filtered = initialProjects.filter(p => {
    const clientName = p.client?.name ?? clientNames[p.clientId] ?? ''
    return (
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedProjects = filtered.slice((currentPage - 1) * pageSize,
    currentPage * pageSize)

    const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  

  return (

    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} // Added pb-28 to make space for the fixed footer
      className="container mx-auto py-8 px-4 md:px-6 space-y-6 pb-28">
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
          {paginatedProjects.map((project) => (
            <ProjectRow key={project.id} project={project} clientName={clientNames[project.clientId]} onDelete={() => {}}/>
          ))}
        </div>
        {filtered.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 dark:bg-card/80 backdrop-blur-md border-t border-border px-6 py-4 z-30 lg:left-64">
            <div className="max-w-7xl mx-auto w-full">
          <PaginationFooter 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onChangePage={handlePageChange}
            label='projects'
          />
          </div>
          </div>
          )}
      </div>
    </motion.div>
  )
}