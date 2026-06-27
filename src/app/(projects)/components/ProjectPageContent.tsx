'use client'

import StatCard from "@/app/(dashboard)/dashboard/components/StatCard"
import { motion } from "framer-motion"
import { Briefcase, PlugIcon, PlusIcon, Search, Pause, XCircle, CheckIcon, FilterX } from "lucide-react"
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
  const [statusFilter, setStatusFilter] = useState('all')
  

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

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedProjectIds)
    paginatedProjects.forEach(p => {
      if (checked) next.add(p.id)
      else next.delete(p.id)
    })
    setSelectedProjectIds(next)
  } 


  


  const filtered = project.filter(p => {
    const clientName = p.client?.name ?? clientNames[p.clientId] ?? ''
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter

    return matchesSearch && matchesStatus
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
    <>
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
        <div className="space-y-4 border p-2 border-border/40 rounded-xl bg-background backdrop-blur-sm">
          {project.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between mb-4 border-border/40 py-5 border-b rounded-md">
              <nav className="flex flex-wrap gap-8 md:gap-12 text-base font-medium text-gray-500 mx-4">
                <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>All Projects <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.total}</span></button>
                <button onClick={() => setStatusFilter('active')} className={statusFilter === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>Active <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.active}</span></button>
                <button onClick={() => setStatusFilter('completed')} className={statusFilter === 'completed' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>Completed <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.completed}</span></button>
                <button onClick={() => setStatusFilter('on_hold')} className={statusFilter === 'on_hold' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>On Hold <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.onHold}</span></button>
                <button onClick={() => setStatusFilter('planning')} className={statusFilter === 'planning' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>Planning <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.planning ?? 0}</span></button>
                <button onClick={() => setStatusFilter('cancelled')} className={statusFilter === 'cancelled' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1 transition-all' : 'hover:text-indigo-600 transition-all'}>Cancelled <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.cancelled}</span></button>
              </nav>
            </div>
          )}
        </div>
          
        {project.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-2xl bg-card/20 backdrop-blur-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-muted-foreground mt-1">No projects have been created yet.</p>
              <Link href='/projects/new' className="inline-block mt-4">
                <Button variant='outline' className="dark:bg-gray-950 bg-white/20 backdrop-blur-md border hover:bg-indigo-400 transition-all">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-2xl bg-card/20 backdrop-blur-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FilterX className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium">No projects match your search</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search for "{searchTerm}" </p>
              <Button variant="link" onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }} className="mt-2 text-primary">
                Clear search
              </Button>
            </div>
          ) : (
        <div className="space-y-4 border p-2 border-border/40 rounded-xl bg-background backdrop-blur-sm">
            <div className="grid gap-3">
              {filtered.length > 0 && (
                <div className="hidden md:grid grid-cols-[40px_minmax(200px,350px)_140px_110px_160px_60px_110px_110px_110px_40px] gap-4 py-3 px-5 text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-border/25 z-10">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Select all projects on current page"
                      className="border-slate-300 dark:border-muted-foreground/45 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                  <div>Project</div>
                  <div>Client</div>
                  <div className="text-left">Status</div>
                  <div>Progress</div>
                  <div className="text-center">Tasks</div>
                  <div className="text-center">Time Tracked</div>
                  <div className="text-left">Due Date</div>
                  <div className="text-left">Members</div>
                  <div />
                </div>
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
            <div className="mt-4 rounded-2xl border-t border-border/40 bg-background px-5 py-4 backdrop-blur-md">
              <PaginationFooter 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onChangePage={handlePageChange}
                label='projects'
              />
            </div>
          )}
        </div>
        )}
    </motion.div>
      {selectedProjectIds.size > 0 && (
        <ProjectsBulkActions
          selectedCount={selectedProjectIds.size}
          onBulkStatusChange={handleBulkStatusChange}
          onClearSelection={() => setSelectedProjectIds(new Set())}
          onBulkDelete={handleBulkDelete}
        />
      )}
    </>
  )
}