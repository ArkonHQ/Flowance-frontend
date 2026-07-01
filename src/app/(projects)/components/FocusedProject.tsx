'use client'


import { Invoice } from '@/lib/api/invoices'
import { Project } from '@/lib/api/projects'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface FocusedProjectProps {
  project: Project
  invoices?: Invoice[]
  onToggleFocus: () => void
  onEditProject: () => void
  onDeleteProject: () => void
  onToggleSidePanel: () => void
}



export const FocusedProject = ({ project, invoices, onToggleFocus, onEditProject, onDeleteProject, onToggleSidePanel }: FocusedProjectProps) => {

  // Compute progress based on projects, tasks and invoices
  const allProgress = project.tasks?.length ? (project.tasks.filter((task) => task.status === 'done').length / project.tasks.length) * 100 : 0

  const totalPaid = project && invoices?.length
    ? invoices
        .filter((invoice) => invoice.projectId === project.id && invoice.status === 'paid')
        .reduce((sum, invoice) => sum + Number(invoice.amount), 0)
    : 0

  const remainingBudget = project.budget ? Number(project.budget) - totalPaid : 0
  const budgetProgress = project.budget
    ? Math.min(Math.round((totalPaid / Number(project.budget)) * 100), 100)
    : 0

  
  // Compute the members, tasks, dueDate, and the time spent on the project //TODO: We should add members to the project once i have the members feature implemented
  const timeSpent = project.totalTimeTracked || 0
  const tasks = project.tasks?.length || 0
  const dueDate = project.deadline ? new Date(project.deadline) : null

  const [progress, setProgress] = useState(allProgress)



  return (
    <div className={cn(
      'w-full mb-6 rounded-xl border bg-card/50 dark:bg-card/80 backdrop-blur-sm transition-all',
      'border-border/50 shadow-sm'
    )}>
      <div className='p-4 mt-4'>
        <h2 className='text-xl font-bold'>{project.title}</h2>
        <p className='text-muted-foreground'>{project.description}</p>
      </div>
    </div>
  )


}