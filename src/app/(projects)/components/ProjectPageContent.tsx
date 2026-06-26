'use client'

import StatCard from "@/app/(dashboard)/dashboard/components/StatCard"
import { motion } from "framer-motion"
import { Briefcase, PlugIcon, PlusIcon, Search, Pause, XCircle, CheckIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { ProjectRow } from "./ProjectRow"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { deleteProject, getAllProjects, updateProject, type Project } from '@/lib/api/projects'
import { PaginationFooter } from "@/app/components/pagination-footer"
import { ProjectsBulkActions } from "./projects-bulk-actions"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"


interface Props {
  initialProjects: Project[]
  clientNames: Record<number, string>
  stats: { total: number; active: number; completed: number ; onHold: number; cancelled: number; planning: number; }
}

export const ProjectPageContent = ({ initialProjects, clientNames, stats }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [project, setProject] = useState<Project[]>(initialProjects)
  const [projectStats, setProjectStats] = useState(stats)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<number>>(new Set())
  

  const pageSize = 10

  const refreshProjectsAndStats = async () => {
    try {
      const refreshedProjects = await getAllProjects()
      setProject(refreshedProjects)
      const active = refreshedProjects.filter(p => p.status === 'active').length
      const completed = refreshedProjects.filter(p => p.status === 'completed').length
      const onHold = refreshedProjects.filter(p => p.status === 'on_hold').length
      const cancelled = refreshedProjects.filter(p => p.status === 'cancelled').length
      const planning = refreshedProjects.filter(p => p.status === 'planning').length
      const total = refreshedProjects.length
      
      setProjectStats({ total, planning, cancelled, onHold, completed, active })
    } catch (err) {
      console.error("Failed to refresh projects and stats aftter time logging: ", err)
    }
  }

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedProjectIds)
    if (idsToDelete.length === 0) return

    const toastId = toast.loading(`Deleting ${idsToDelete} projects...`)
    try {
      await Promise.all(idsToDelete.map(id => deleteProject(id)))

      setProject(prev => prev.filter(p => !selectedProjectIds.has(p.id) ))

      toast.success(`Successfully deleted ${idsToDelete} projects` , {id: toastId})
      setCurrentPage(1)
      await refreshProjectsAndStats()
    } catch (err: any) {
      toast.error(`Failed to delte some projects: ${err.message || "Error"}`, {id: toastId})
    }
  }

  const handleToggle = (id: number) => {
    setSelectedProjectIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelecteAll = (checked: boolean) => {
    const next = new Set(selectedProjectIds)
    paginatedProjects.forEach(p => {
      if (checked) next.add(p.id)
      else next.delete(p.id)
    })
    setSelectedProjectIds(next)
  } 


  


  const filtered = project.filter(p => {
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

  const isAllSelected = paginatedProjects.length > 0 && paginatedProjects.every(p => selectedProjectIds.has(p.id))


  const handleBulkStatusChange = async (newStatus: Project['status']) => {
    const idsToUpdate = Array.from(selectedProjectIds)
    if (idsToUpdate.length === 0) return

    const toastId = toast.loading(`Updating ${idsToUpdate.length} tasks to ${newStatus.replace(/_/g, '_')}...`)
    try {
      await Promise.all(idsToUpdate.map(id => updateProject(id, {status: newStatus})))

      setProject(prev => prev.map(p => {
        if (selectedProjectIds.has(p.id)) {
          return {...p, status: newStatus}
        }
        return p
      }))

      toast.success(`Successfully updated ${idsToUpdate.length} projects`, {id: toastId})
      setSelectedProjectIds(new Set())
      await refreshProjectsAndStats()
    } catch (err: any) {
      toast.error(`Failed to update some projects: ${err.message || 'Error'}` , {id: toastId})
    }
  }
  

  return (

    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
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
          value={projectStats.total.toString()} 
          icon={Briefcase}
          color="text-indigo-500"
          bg="bg-indigo-100/70 dark:bg-indigo-600/40"
          gradient="from-indigo-500 to-blue-500"
         />
         <StatCard 
          title="Active"
          value={projectStats.active.toString()} 
          icon={PlugIcon}
          color="text-blue-500"
          bg="bg-blue-100/70 dark:bg-blue-600/40"
          gradient="from-blue-500 to-cyan-500"
         />
        <StatCard 
          title="Completed"
          value={projectStats.completed.toString()} 
          icon={CheckIcon}
          color="text-emerald-500"
          bg="bg-emerald-100/70 dark:bg-emerald-600/40"
          gradient="from-emerald-500 to-teal-500"
         />
        <StatCard 
          title="On Hold"
          value={projectStats.onHold.toString()} 
          icon={Pause}
          color="text-yellow-500"
          bg="bg-yellow-100/70 dark:bg-yellow-600/40"
          gradient="from-yellow-500 to-orange-500"
         />
        <StatCard 
          title="Cancelled"
          value={projectStats.cancelled.toString()} 
          icon={XCircle}
          color="text-red-500"
          bg="bg-red-100/70 dark:bg-red-600/40"
          gradient="from-red-500 to-pink-500"
         />
      </div>

      {/* Search and List Section */}
      <div className="space-y-4">
        <Checkbox 
          checked={isAllSelected}
          onCheckedChange={handleSelecteAll}
          aria-label="Select all projects on current page"
          className="border-slate-300 dark:border-muted-foreground/45 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
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
          {selectedProjectIds.size > 0 && (
          <ProjectsBulkActions
            selectedCount={selectedProjectIds.size}
            onBulkStatusChange={handleBulkStatusChange}
            onClearSelection={() => setSelectedProjectIds(new Set())}
            onBulkDelete={handleBulkDelete}
          />
          )}
          {paginatedProjects.map((project) => (
            <ProjectRow
             key={project.id}
             project={project} 
             clientName={clientNames[project.clientId]} 
             onDelete={() => {}} 
             isSelecetd={selectedProjectIds.has(project.id)}
             onToggle={handleToggle}
             />
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