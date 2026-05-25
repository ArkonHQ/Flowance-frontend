'use server'

import { updateTask } from "@/lib/api/tasks"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"


interface UpdateTaskState {
  error?: string
}

export const updateTaskAction =  async (prevState: UpdateTaskState | null, formData: FormData): Promise<UpdateTaskState> => {
  

  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const taskId = Number(formData.get('taskId'))

  const title = formData.get('title') as string
  const projectId = Number(formData.get('projectId'))
  const description = formData.get('description') as string
  const status = formData.get('status') as 'todo' | 'in_progress' | 'done' | 'cancelled' | 'delayed' 
  const deadline = (formData.get('deadline') as Date | string) || new Date().toISOString()
  

  if (!title || title.trim().length < 3) return { error: 'Title must be at least 3 characters' }

  try {
    
    await updateTask(taskId, { title, projectId, description, status, deadline }, cookieHeader)

  }catch (err: any) {
    return { error: err.message || 'Something went wrong' }
  }

  revalidatePath('/tasks')
  redirect(`/tasks/${taskId}`)
   
}