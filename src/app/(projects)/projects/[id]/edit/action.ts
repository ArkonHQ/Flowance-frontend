'use server'

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { updateProject } from "@/lib/api/projects"

interface EditProjectState {
  error?: string
}


export const updateProjectAction = async (prevState: EditProjectState | null, formData: FormData): Promise<EditProjectState> => {

  // 1.Read Cookies
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  

  // 2.Extract the project ID from the the hidden field 
  const projectId = Number(formData.get('projectId'))
  

  // 3.Extract the other form fields
  const title = formData.get('title') as string
  const clientId = Number(formData.get('clientId'))
  const status = formData.get('status') as 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled'

  // 4.Validate
  if(!title || title.trim().length < 3) return { error: 'Title must be at least 3 characters' }

  if (!clientId) return { error: 'Client is required' }

  if (!status) return { error: 'Status is required' }

  // 5.Call the update API
  try{

    await updateProject(projectId, {title, clientId, status}, cookieHeader)

  }catch(err: any) {
    return { error: err.message || 'Something went wrong'}
  }

  revalidatePath('/projects')
  redirect(`/projects/${projectId}`)



} 