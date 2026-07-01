'use client'

import { StatCard } from "@/components/ui/StatCard"
import { motion } from "framer-motion"
import { Briefcase, PlugIcon, PlusIcon, Search, Pause, XCircle, CheckIcon, FilterX, DollarSign, FolderKanban, LayoutGrid, List } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ProjectRow } from "./ProjectRow"
import { ProjectGridCard } from "./ProjectGridCard"
import { Button } from "@/components/ui/button"
import { deleteProject, getAllProjects, updateProject, type Project } from '@/lib/api/projects'
import { getTaskByProject } from '@/lib/api/tasks'
import { type Invoice } from '@/lib/api/invoices'
import { PaginationFooter } from "@/app/components/pagination-footer"
import { ProjectsBulkActions } from "./projects-bulk-actions"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidePanel } from "./SidePanel"
import { cn } from "@/lib/utils"
import { ProjectForm } from "./ProjectForm"
import { type Client } from '@/lib/api/clients'
import { useSearchParams, useRouter } from 'next/navigation'


interface Props {
  initialProjects: Project[]
  clientNames: Record<number, string>
  stats: { total: number; active: number; completed: number ; onHold: number; cancelled: number; planning: number; archived: number }
  invoices: Invoice[]
  clients: Client[]
}


export const ProjectPageContent = ({ initialProjects, clientNames, stats, invoices, clients }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [project, setProject] = useState<Project[]>(initialProjects)
  const [projectStats, setProjectStats] = useState(stats)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<number>>(new Set())
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('')
  const [isArchived, setIsArchived] = useState(false)
  const [onEditProject, setOnEditProject] = useState<Project | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Auto-open modal when navigated here with ?newProject=1 or ?editProject=id
  useEffect(() => {
    let shouldUpdateUrl = false
    const url = new URL(window.location.href)

    if (searchParams.get('newProject') === '1') {
      setIsProjectModalOpen(true)
      url.searchParams.delete('newProject')
      shouldUpdateUrl = true
    }

    const editProjectId = searchParams.get('editProject')
    if (editProjectId) {
      const projToEdit = project.find(p => p.id === Number(editProjectId))
      if (projToEdit) {
        setOnEditProject(projToEdit)
        setIsProjectModalOpen(true)
      }
      url.searchParams.delete('editProject')
      shouldUpdateUrl = true
    }

    if (shouldUpdateUrl) {
      router.replace(url.pathname, { scroll: false })
    }
  }, [searchParams, project, router])
  

  // Save view mode in local storage
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fcc_project_view_mode')
      return saved === 'grid' ? 'grid' : 'list'
    }
    return 'list'
  })

  const [selectedProjectForPanel, setSelectedProjectForPanel] = useState<Project | null>(() => {
    if (typeof window === 'undefined') return null

    const saveId = localStorage.getItem('fcc_selected_project_for_panel')

    return saveId ? project.find(p => p.id === Number(saveId)) ?? null : null
  })

  const [sidePanelOpen, setSidePanelOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fcc_project_side_panel_open')
      return saved === 'true'
    }
    return false
  })

  useEffect(() => {
    if (sidePanelOpen) {
      localStorage.setItem('fcc_project_side_panel_open', 'true')
    }else {
      localStorage.setItem('fcc_project_side_panel_open', 'false')
    }
  }, [sidePanelOpen])

  useEffect(() => {

    if (selectedProjectForPanel) {
      localStorage.setItem('fcc_selected_project_for_panel', selectedProjectForPanel.id.toString())
    }else {
      localStorage.removeItem('fcc_selected_project_for_panel')
    }
  }, [selectedProjectForPanel])

  useEffect(() => {

    if (viewMode) {
      localStorage.setItem('fcc_project_view_mode', viewMode)
    }
  }, [viewMode])
  

  const pageSize = 10

  // Side panel shortcut "]"
  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable) {
        return
      }
    
    if (e.key === ']'){
      e.preventDefault()
      setSidePanelOpen(prev => !prev)
    }
  }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)

  }, [])


  // Create new project with "n" then "p" shortcuts
  // Implementing the timer logic in order to press n then p within 1 second .
  useEffect(() => {
    // This to understand if the user pressed "n" then "p" within 1 second
    let lastKey = ''
    // Timer to reset the lastKey after 1 second
    let lastTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields .
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      const now = Date.now()

      if (e.key.toLowerCase() === 'p' && lastKey === 'n' && now - lastTime < 1000) {
        e.preventDefault()
        setIsProjectModalOpen(true)
        lastKey = ''
      }else if (e.key === 'Escape') {
          setIsProjectModalOpen(false)
          lastKey = ''
      }else {
        lastKey = e.key.toLowerCase()
        lastTime = now
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  
  }, [])
  
  const refreshProjectsAndStats = async () => {
    try {
      const refreshedProjects = await getAllProjects()
      setProject(refreshedProjects)
      const active = refreshedProjects.filter(p => p.status === 'active').length
      const completed = refreshedProjects.filter(p => p.status === 'completed').length
      const onHold = refreshedProjects.filter(p => p.status === 'on_hold').length
      const cancelled = refreshedProjects.filter(p => p.status === 'cancelled').length
      const planning = refreshedProjects.filter(p => p.status === 'planning').length
      const archived = refreshedProjects.filter(p => p.isArchived).length
      const total = refreshedProjects.length
      
      setProjectStats({ total, planning, cancelled, onHold, completed, active, archived })
    } catch (err) {
      console.error("Failed to refresh projects and stats after time logging: ", err)
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

  const handleArchive = (id: number, archived: boolean) => {
    setProject(prev => prev.map(p => p.id === id ? { ...p, isArchived: archived } : p))
    setProjectStats(prev => ({
      ...prev,
      archived: (prev.archived ?? 0) + (archived ? 1 : -1)
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedProjectIds)
    paginatedProjects.forEach(p => {
      if (checked) next.add(p.id)
      else next.delete(p.id)
    })
    setSelectedProjectIds(next)
  } 

  const handleEditProject = async (project: Project) => {
    setOnEditProject(project)
    setIsProjectModalOpen(true)
  }

  const handleDeleteProject = async (projectId: number) => {
    setProject(prev => prev.filter(p => p.id !== projectId))
    try {
      await deleteProject(projectId)
      toast.success("Project deleted successfully")
    } catch (err) {
      toast.error("Failed to delete project")
    }
    if (sidePanelOpen && selectedProjectForPanel?.id === projectId) {
      setSidePanelOpen(false)
      setSelectedProjectForPanel(null)
    }
  }

  
  const sorted = useMemo(() => {
    const result = [...project]

    switch (sortBy) {
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })
        break;
      
      case 'title': 
        result.sort((a, b) => a.title.localeCompare(b.title))
        break;
        default: 
   }
    return result
  }, [project, sortBy])

  const filtered = sorted.filter(p => {
    const clientName = p.client?.name ?? clientNames[p.clientId] ?? ''
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesArchived = isArchived ? p.isArchived : !p.isArchived

    return matchesSearch && matchesStatus && matchesArchived
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
        <Button className="gap-2" onClick={() => setIsProjectModalOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Bar  */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {(() => {
          const now = new Date()
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const projectsThisMonth = project.filter(p => p.createdAt && new Date(p.createdAt) >= thisMonthStart).length
          const total = projectStats.total || 1
          const activePercentage = Math.round((projectStats.active / total) * 100)
          const completedPercentage = Math.round((projectStats.completed / total) * 100)
          const onHoldPercentage = Math.round((projectStats.onHold / total) * 100)
          
          const totalRevenue = project.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)
          const revenueThisMonth = project.filter(p => p.createdAt && new Date(p.createdAt) >= thisMonthStart).reduce((sum, p) => sum + (Number(p.budget) || 0), 0)

          return (
            <>
              <StatCard
                title="Total Projects"
                value={projectStats.total.toString()} 
                icon={FolderKanban}
                color="text-indigo-500"
                bg="bg-indigo-100/70 dark:bg-indigo-600/40"
                gradient="from-indigo-500 to-blue-500"
                trend={{ value: projectsThisMonth, isPositive: true, label: "this month", suffix: "" }}
              />
              <StatCard 
                title="Active Projects"
                value={projectStats.active.toString()} 
                icon={PlugIcon}
                color="text-blue-500"
                bg="bg-blue-100/70 dark:bg-blue-600/40"
                gradient="from-blue-500 to-cyan-500"
                trend={{ value: activePercentage, isPositive: true, label: "of total", suffix: "%" }}
              />
              <StatCard 
                title="Completed"
                value={projectStats.completed.toString()} 
                icon={CheckIcon}
                color="text-emerald-500"
                bg="bg-emerald-100/70 dark:bg-emerald-600/40"
                gradient="from-emerald-500 to-teal-500"
                trend={{ value: completedPercentage, isPositive: true, label: "of total", suffix: "%" }}
              />
              <StatCard 
                title="On Hold"
                value={projectStats.onHold.toString()} 
                icon={Pause}
                color="text-yellow-500"
                bg="bg-yellow-100/70 dark:bg-yellow-600/40"
                gradient="from-yellow-500 to-orange-500"
                trend={{ value: onHoldPercentage, isPositive: false, label: "of total", suffix: "%" }}
              />
              <StatCard 
                title="Total Revenue"
                value={`$${totalRevenue.toLocaleString()}`} 
                icon={DollarSign}
                color="text-emerald-500"
                bg="bg-emerald-100/70 dark:bg-emerald-600/40"
                gradient="from-emerald-500 to-green-500"
                trend={{ value: revenueThisMonth, isPositive: true, label: "this month", suffix: "", prefix: "+$" }}
              />
            </>
          )
        })()}
      </div>

      {/* Search and List Section */}
        <div className="space-y-4 p-2 border-border/40 rounded-xl bg-background backdrop-blur-sm -mb-3">
          {project.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pt-5 pb-2">
              <nav className="flex flex-wrap gap-8 md:gap-12 text-sm font-medium text-gray-500 mx-4">
                <button onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-px transition-all' : 'hover:text-indigo-600 border-b-2 border-transparent pb-3 -mb-px transition-all'}>All Projects <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.total}</span></button>
                <button onClick={() => setStatusFilter('active')} className={statusFilter === 'active' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-px transition-all' : 'hover:text-indigo-600 border-b-2 border-transparent pb-3 -mb-px transition-all'}>Active <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.active}</span></button>
                <button onClick={() => setStatusFilter('completed')} className={statusFilter === 'completed' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-px transition-all' : 'hover:text-indigo-600 border-b-2 border-transparent pb-3 -mb-px transition-all'}>Completed <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.completed}</span></button>
                <button onClick={() => setStatusFilter('on_hold')} className={statusFilter === 'on_hold' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-px transition-all' : 'hover:text-indigo-600 border-b-2 border-transparent pb-3 -mb-px transition-all'}>On Hold <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.onHold}</span></button>
                <button onClick={() => setStatusFilter('planning')} className={statusFilter === 'planning' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-px transition-all' : 'hover:text-indigo-600 border-b-2 border-transparent pb-3 -mb-px transition-all'}>Planning <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.planning ?? 0}</span></button>
                <button onClick={() => setStatusFilter('cancelled')} className={statusFilter === 'cancelled' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-px transition-all' : 'hover:text-indigo-600 border-b-2 border-transparent pb-3 -mb-px transition-all'}>Cancelled <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.cancelled}</span></button>
                <button onClick={() => setIsArchived(!isArchived)} className={isArchived ? 'text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-px transition-all' : 'hover:text-indigo-600 border-b-2 border-transparent pb-3 -mb-px transition-all'}>Archived <span className="rounded-xl border-border/70 bg-card/50 px-2 py-0.5 text-xs">{projectStats.archived ?? 0}</span></button>
              </nav>

              <div className="flex items-center gap-2 px-4">
                {sortBy && (
                  <Button
                    onClick={() => setSortBy('')}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear sort
                  </Button>
                )}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] py-5 font-bold text-sm">
                    <SelectValue placeholder={`Sort by`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                {/* View mode toggle */}
                <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-md ${viewMode === 'list' ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-md ${viewMode === 'grid' ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
              <Button variant='outline' onClick={() => setIsProjectModalOpen(true)} className="dark:bg-gray-950 bg-white/20 backdrop-blur-md border hover:bg-indigo-400 transition-all mt-4">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Project
              </Button>
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
              {viewMode === 'list' && filtered.length > 0 && (
                <div className="hidden md:grid grid-cols-[40px_minmax(200px,350px)_minmax(180px,1fr)_110px_160px_60px_110px_110px_110px_40px] gap-4 py-3 px-5 text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-border/25 z-10">
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


              {sidePanelOpen && (
                <SidePanel
                  open={sidePanelOpen}
                  onClose={() => {
                    setSidePanelOpen(false)
                    setSelectedProjectForPanel(null)
                  }}
                  project={selectedProjectForPanel}
                  onArchive={handleArchive}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  fetchTasks={getTaskByProject}
                  clientName={clientNames[selectedProjectForPanel?.clientId || 0]}
                  timeTrackedThisWeek={120}
                  totalPaid={
                    invoices
                      .filter(inv => inv.projectId === selectedProjectForPanel?.id && inv.status === 'paid')
                      .reduce((sum, inv) => sum + Number(inv.amount), 0)
                  }
                />
              )}

              {viewMode === 'grid' ? (
                <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', sidePanelOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4')}>
                  {paginatedProjects.map((project) => (
                    <ProjectGridCard
                      clientName={clientNames[project.clientId]}
                      key={project.id}
                      project={project}
                      onArchive={handleArchive}
                      onSidePanelOpen={(id, proj) => {
                        setSelectedProjectForPanel(proj)
                        setSidePanelOpen(true)
                      }}
                      onEdit={handleEditProject}
                    />
                  ))}
                </div>
              ) : (
                paginatedProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    clientName={clientNames[project.clientId]}
                    onDelete={handleDeleteProject}
                    onArchive={handleArchive}
                    isSelecetd={selectedProjectIds.has(project.id)}
                    onToggle={handleToggle}
                    onSidePanelOpen={(id, proj) => {
                      setSelectedProjectForPanel(proj)
                      setSidePanelOpen(true)
                    }}
                    onEdit={handleEditProject}
                  />
                ))
              )}
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
      <ProjectForm
        key={onEditProject?.id ?? 'new'}
        clients={clients}
        isOpen={isProjectModalOpen}
        initialData={onEditProject}
        onClose={() => {
          setIsProjectModalOpen(false)
          setTimeout(() => setOnEditProject(null), 300)
        }}
        onProjectCreated={(newProject) => {
          setProject(prev => [newProject, ...prev])
          setProjectStats(prev => ({ ...prev, total: prev.total + 1, planning: (prev.planning ?? 0) + 1 }))
          setIsProjectModalOpen(false)
        }}
        onProjectUpdated={(updatedProject) => {
          setProject(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
          setIsProjectModalOpen(false)
          setTimeout(() => setOnEditProject(null), 300)
          if (selectedProjectForPanel?.id === updatedProject.id) {
            setSelectedProjectForPanel(updatedProject)
          }
        }}
      />
    </>
  )
}