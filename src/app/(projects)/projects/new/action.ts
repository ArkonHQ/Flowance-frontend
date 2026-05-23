'use server'

import { createProject } from "@/lib/api/projects"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"


interface CreateProjectState {
  error?: string
}

export const handleCreateProject = async (prevState: CreateProjectState | null, formData: FormData): Promise<CreateProjectState> => {
  
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const title = formData.get('title') as string
  const clientId = Number(formData.get('clientId'))
  const statusRaw = formData.get('status')
  const validStatusValues = ['planning', 'active', 'completed', 'on_hold', 'cancelled'] as const
  const status = typeof statusRaw === 'string' && validStatusValues.includes(statusRaw as any)
    ? statusRaw as typeof validStatusValues[number]
    : null

  // Validation
  if (!title || title.trim().length < 3) return { error: 'Title must be at least 3 characters' }
  if (!clientId) return { error: 'Please select a client' }
  if (!status) return { error: 'Please select a valid project status' }

  try{

    await createProject({title, clientId, status}, cookieHeader)

  }catch (err: any) {
    return { error: err.message || 'Something went wrong'  }
  }

  revalidatePath('/projects')
  redirect('/projects')


}