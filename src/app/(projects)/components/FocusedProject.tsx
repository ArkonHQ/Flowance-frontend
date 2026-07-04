'use client'


import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ProjectIcon } from '@/components/ui/project-icon'
import { TimeSparkline } from '@/components/ui/time-sparkline'
import { Invoice } from '@/lib/api/invoices'
import { Project } from '@/lib/api/projects'
import { PROJECT_PROGRESS_MESSAGES } from '@/lib/constants/project-messages'
import { cn } from '@/lib/utils'
import { Calendar, CheckCircle, Flame, Lightbulb, List, PauseCircle, Rocket, Sparkles, Target, TrendingUp, X, XCircle, ZapIcon } from 'lucide-react'
import { getProjectTimeChart } from '@/lib/api/projects'
import { useEffect, useState } from 'react'

interface FocusedProjectProps {
  project: Project
  invoices?: Invoice[]
  onToggleFocus: () => void
  onEditProject: () => void
  onDeleteProject: () => void
  onToggleSidePanel: () => void
  onClose: () => void
}



const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    planning: 'badge-status-planning',
    active: 'badge-status-active',
    completed: 'badge-status-completed',
    on_hold: 'badge-status-on_hold',
    cancelled: 'badge-status-cancelled',
  }
  return colors[status] || colors.planning
}

const displayStatus = (status: string) => {
  const map: Record<string, string> = {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    on_hold: 'On Hold',
    cancelled: 'Cancelled',
  }
  return map[status] || 'Planning'
}

const getProjectStatusMessage = (project: Project) => {
  const status = project.status || 'planning'
  const progress = project.progress || 0
  const index = (project.id || 0) % 5

  let message = ''
  let Icon = Lightbulb
  let colorClass = 'text-slate-500 bg-slate-500/10 border-slate-500/20'

  if (status === 'planning') {
    message = PROJECT_PROGRESS_MESSAGES.planning[index]
    Icon = Lightbulb
    colorClass = 'text-slate-500 bg-slate-500/10 border-slate-500/20'
  } else if (status === 'on_hold') {
    message = PROJECT_PROGRESS_MESSAGES.onHold[index]
    Icon = PauseCircle
    colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  } else if (status === 'completed') {
    message = PROJECT_PROGRESS_MESSAGES.completed[index]
    Icon = Sparkles
    colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  } else if (status === 'cancelled') {
    message = PROJECT_PROGRESS_MESSAGES.cancelled[index]
    Icon = XCircle
    colorClass = 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  } else {
    const activeMessages = PROJECT_PROGRESS_MESSAGES.active
    if (progress === 0) {
      message = activeMessages['0'][index]
      Icon = Rocket
      colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    } else if (progress >= 1 && progress <= 9) {
      message = activeMessages['1-9'][index]
      Icon = Rocket
      colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    } else if (progress >= 10 && progress <= 24) {
      message = activeMessages['10-24'][index]
      Icon = TrendingUp
      colorClass = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    } else if (progress >= 25 && progress <= 39) {
      message = activeMessages['25-39'][index]
      Icon = TrendingUp
      colorClass = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    } else if (progress >= 40 && progress <= 49) {
      message = activeMessages['40-49'][index]
      Icon = TrendingUp
      colorClass = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    } else if (progress === 50) {
      message = activeMessages['50'][index]
      Icon = Target
      colorClass = 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    } else if (progress >= 51 && progress <= 64) {
      message = activeMessages['51-64'][index]
      Icon = Target
      colorClass = 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    } else if (progress >= 65 && progress <= 74) {
      message = activeMessages['65-74'][index]
      Icon = Target
      colorClass = 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20'
    } else if (progress >= 75 && progress <= 89) {
      message = activeMessages['75-89'][index]
      Icon = Flame
      colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    } else if (progress >= 90 && progress <= 99) {
      message = activeMessages['90-99'][index]
      Icon = Flame
      colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    } else {
      message = activeMessages['100'][index]
      Icon = CheckCircle
      colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    }
  }

  return { message, Icon, colorClass }
}

const dueDateFotmatter = (dueDate: Date | null) => {
  if (!dueDate) return 'No due date'
  const now = new Date()

  const diffInMs = dueDate.getTime() - now.getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  if (diffInDays === 0) return 'Due today'
  return diffInDays > 0 ? `${diffInDays} days left` : 'Overdue'
}

const dueDateColor = (dueDate: Date | null) => {
  if (!dueDate) return 'text-muted-foreground'
  const now = new Date()
  const diffInMs = dueDate.getTime() - now.getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  if (diffInDays === 0) return 'text-amber-500'
  return diffInDays > 0 ? 'text-muted-foreground' : 'text-rose-500'
}

const formatTimeSpent = (timeSpent: number) => {
  const hours = Math.floor(timeSpent / 60)
  const minutes = Math.floor(timeSpent % 60)
  const paddedMinutes = minutes.toString().padStart(2, '0')
  return `${hours}h ${paddedMinutes}m`
}


export const FocusedProject = ({ project, invoices, onToggleFocus, onEditProject, onDeleteProject, onToggleSidePanel, onClose }: FocusedProjectProps) => {

  // Compute progress based on projects, tasks and invoices
  const allProgress = project.progress ?? 0

  const projectInvoices = (invoices || []).filter((invoice) => invoice.projectId === project.id)

  // Budget always comes from the project itself
  const budgetAmount = Number(project?.budget) || 0

  // Paid = sum of paid invoices for this project
  const totalPaid = projectInvoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0)

  // Total invoiced (all statuses) for reference
  const totalInvoiced = projectInvoices
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0)

  const remainingBudget = budgetAmount - totalPaid
  const budgetProgress = budgetAmount > 0
    ? Math.min(Math.round((totalPaid / budgetAmount) * 100), 100)
    : 0

  
  // Compute the members, tasks, dueDate, and the time spent on the project //TODO: We should add members to the project once i have the members feature implemented
  const timeSpent = project.totalTimeTracked ?? 0
  const tasks = project.taskCount ?? 0
  const dueDate = project.deadline ? new Date(project.deadline) : null
  const { message, Icon, colorClass } = getProjectStatusMessage(project)

  const [chartData, setChartData] = useState<{ day: string; minutes: number }[]>([])
  useEffect(() => {
    getProjectTimeChart(project.id).then(setChartData).catch(() => setChartData([]))
  }, [project.id])

  const timeTrackedThisWeek = chartData.reduce((acc, curr) => acc + curr.minutes, 0)


  return (
    <div className={cn(
      'w-full mb-6 rounded-xl border bg-card/50 dark:bg-card/80 backdrop-blur-sm transition-all',
      'border-border/50 shadow-sm'
    )}>
      {/* Slim top border */}
      <div className='h-[2px] rounded-t-xl transition-all duration-500 via-primary/25 bg-linear-to-r from-transparent to-transparent' />
      
      <div className='flex flex-col gap-0 px-4 py-3'>

        {/* Label row */}
        <div className='mb-2 flex items-center justify-between'>
          <div className='flex gap-1.5 items-center'>
            <ZapIcon className='h-3.5 w-3.5 fill-amber-400 text-amber-400' />
            <span className='text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.2em]'>Current Focuse</span>
          </div>
          <Button
            variant={'ghost'} 
            size={'sm'} 
            onClick={onClose}
            className='h-7 w-7 rounded-full text-muted-foreground hover:text-foreground'>
              <X className='h-3.5 w-3.5' />
            </Button>
        </div>
        {/* Main content */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-4'>

          {/* Project details */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start gap-3'>
              <ProjectIcon project={project} iconClassName='h-9 w-9' className='h-12 w-12 shrink-0' />

              <div className='min-w-0 flex-1 space-y-1.5'>
                <div className='flex flex-wrap items-center gap-2.5'>
                  <button
                    type='button'
                    onClick={onToggleSidePanel}
                    className='text-left'
                  >
                    <h2 className='text-base font-bold leading-tight hover:text-primary transition-colors'>
                      {project.title}
                    </h2>
                  </button>
                  <div className={cn(
                    'inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold rounded-full shrink-0',
                    getStatusColor(project.status)
                  )} >
                    <span className='h-1.5 w-1.5 rounded-full bg-current mr-1.5 opacity-75' />
                       {displayStatus(project.status)}
                  </div>
                </div>
                {project.description && (
                  <p className='text-xs text-muted-foreground line-clamp-1'>
                    {project.description}
                  </p>
                )}
                {project && (
                  <div className='mt-2'>
                  <p className='text-xs text-muted-foreground'>
                    Members Count TODO here
                  </p>
                  </div>
                )}

                <div className='flex flex-row flex-wrap gap-4 items-center'>
                {tasks > 0 && (
                  <p className='text-xs text-muted-foreground flex'>
                    <List className='h-4.5 w-4.5 mr-1.5' />
                    {tasks} {tasks === 1 ? 'Task' : 'Tasks'}
                  </p>
                )}
                {project.deadline && (
                  <p className={`text-xs ${dueDateColor(dueDate)} flex`}>
                    <Calendar className='h-4 w-4 mr-1.5' />
                    {dueDateFotmatter(dueDate)}
                  </p>

                //TODO: Add members count here once we have the members feature implemented
                )} 
                </div>
              </div>
            </div>
          </div>

          {/* divider */}
          <div className='hidden md:block w-px h-34 bg-muted-foreground/20' />

          {/* Overall Progress */}
          <div className='flex flex-col gap-2'>
            <span className='text-[11px] text-muted-foreground tracking-wide'>Overall Progress</span>
            <span className='text-2xl max-md:text-xl font-bold text-foreground leading-none antialiased'>
              {Math.round(allProgress)}%
            </span>
            <Progress value={allProgress} className='h-2 w-64 rounded-full' indicatorColor={project.tags?.[0]?.color} />
            <div className={cn('flex items-start gap-2 rounded-md border p-2.5 mt-6 mb-6', colorClass)}>
              <div className='mt-0.5'>
                <Icon className='h-4 w-4' />
              </div>
              <span className='text-xs font-medium leading-tight'>
                {message}
              </span>
            </div>
          </div>

          {/* divider */}
          <div className='hidden md:block w-px h-34 bg-muted-foreground/20' />
          
          {/* Time Spent */}
          <div className='flex flex-col'>
          <div className='flex flex-row items-center gap-4 min-w-[260px] justify-between'>
            <div className='flex flex-col'>
              <span className='text-[11px] text-muted-foreground tracking-wide'>Time Spent</span>
              <div className='flex flex-row gap-4 items-center'>
                <span className='font-bold text-base leading-none text-foreground flex-row antialiased'>
                  {formatTimeSpent(timeSpent)}
                </span>
                {chartData.length > 0 && project?.totalTimeTracked ? (
                  (() => {
                    const percentThisWeek = project.totalTimeTracked > 0 
                      ? Math.round((timeTrackedThisWeek / project.totalTimeTracked) * 100)
                      : 0
                    return (
                      <span className={cn('text-xs font-light mt-2 px-2 py-1 tracking-wider', percentThisWeek < 0 ? 'text-rose-500' : 'text-emerald-500')}>
                        {percentThisWeek > 0 ? '+' : ''}{percentThisWeek}% this week
                      </span>
                    )
                  })()
                ): (
                  <span className='text-muted-foreground text-[11px] tracking-wide'>No time yet.</span>
                )}
              </div>
            </div>
            
            {/* Time Tracked Chart */}
            <TimeSparkline data={chartData} className="shrink-0" />
          </div>
            <div className='h-[1px] w-full bg-muted-foreground/20' />
            
          {/* Budget */}
          <div className='mt-2 flex items-center justify-between gap-4 py-2'>
            <div className='flex min-w-0 flex-col'>
              <span className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70'>Budget</span>
              <span className='mt-0.5 text-[15px] font-bold tracking-wide text-foreground antialiased'>
                ${totalPaid.toLocaleString()}
                <span className='ml-1 text-[13px] font-semibold tracking-wider text-muted-foreground antialiased'>/${budgetAmount}</span>
              </span>
            </div>
            <div className='flex min-w-[130px] flex-1 flex-col gap-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70'>Spent</span>
                <span className='text-[11px] font-semibold text-foreground antialiased'>{budgetProgress}%</span>
              </div>
              <Progress value={budgetProgress} className='h-1.25 rounded-full' indicatorColor={project.tags?.[0]?.color} />
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )


}