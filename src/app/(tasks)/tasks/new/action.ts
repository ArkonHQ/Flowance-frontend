'use server'

import { createTask } from "@/lib/api/tasks"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"


interface CreateTaskState {
  error?: string 
}

export const handleCreateTask = async (prevState: CreateTaskState | null, formData: FormData): Promise<CreateTaskState> => {

  // 1. Read cookies
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  
  
  const title = formData.get('title') as string
  const summary = formData.get('summary') as string | null
  const projectId = Number(formData.get('projectId'))
  const tagIdsRaw = formData.get('tagIds') as string | null
  const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw) : []
  
  const statusRaw = formData.get('status')
  const validStatusValues = ['todo', 'in_progress', 'done', 'delayed', 'cancelled'] as const
  // Default to 'in_progress' if missing or invalid
  const status = typeof statusRaw === 'string' && validStatusValues.includes(statusRaw as any)
    ? statusRaw as typeof validStatusValues[number]
    : 'in_progress'

  const priorityRaw = formData.get('priority')
  const validPriorityValues = ['low', 'medium', 'high'] as const
  // Default to 'low' if missing or invalid
  const priority = typeof priorityRaw === 'string' && validPriorityValues.includes(priorityRaw as any)
    ? priorityRaw as typeof validPriorityValues[number]
    : 'low'

  const deadlineRaw = formData.get('deadline')
  // Default to today if no deadline is provided
  const deadline = deadlineRaw ? new Date(deadlineRaw as string) : new Date()
    
  // Validation
  if (!title || title.trim().length < 3) return { error: 'Title must be at least 3 characters' }
  if (!projectId) return { error: 'Please select a project' }

  try {
    await createTask({ 
      title, 
      summary: summary || undefined, 
      status, 
      priority, 
      deadline, 
      projectId,
      tagIds 
    }, cookieHeader)
  
  }catch (err: any) {
    return { error: err.message || 'Something went wrong' }
  }

  revalidatePath('/tasks')
  redirect('/tasks')



}