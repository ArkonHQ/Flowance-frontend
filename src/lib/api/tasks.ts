import { Project } from "./projects"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Task = {
    id: number,
    progress: number
    project: Project,
    title: string,
    description: string | null,
    summery: string | null ,
    status: 'todo' | 'in_progress' | 'done' | 'delayed' | 'cancelled' | 'overdue',
    priority: 'low' | 'medium' | 'high',
    deadline: Date | string,
    completedAt: Date | null,
    projectId: number,
    ownerId: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
}

export type Mission = {
    id: number,
    name: string,
    completed: boolean,
    taskId: number,
    assigneeId: number | null,
    completedById: number | null
    position: number
    completedAt: string | null,
}


interface TaskResponse {
    tasks: Task[]
    totalHours: number
}



// ----------------------Mission---------------
export const getMissions = async (taskId: number, cookieHeaders?: string): Promise<Mission[]> => {

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders



    const res = await fetch(`${API_BASE}/tasks/${taskId}/missions`, {

        credentials: 'include',
        headers,
        method: 'GET'
    })
    if (!res.ok) throw new Error('Failed to fetch missions')
    const data = await res.json()
    return data.missions
}

export const addMission = async (taskId: number, text: string, assigneeId?: number, cookieHeaders?: string): Promise<Mission> => {

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders

    const res = await fetch(`${API_BASE}/tasks/${taskId}/missions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, assigneeId }),
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to add mission')
    const data = await res.json()
    return data.mission
}

export const toggleMission = async (missionId: number, taskId: number, cookieHeaders?: string): Promise<Mission> => {


    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders

    const res = await fetch(`${API_BASE}/tasks/${taskId}/missions/${missionId}/toggle`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to toggle mission')
    const data = await res.json()
    return data.mission
}

export const updateMission = async (
    taskId: number,
    missionId: number,
    data: Partial<Pick<Mission, 'name' | 'assigneeId' | 'position'>>,
    cookieHeaders?: string,
): Promise<Mission> => {

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders

    const res = await fetch(`${API_BASE}/tasks/${taskId}/missions/${missionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to update mission')
    const json = await res.json()
    return json.mission
}

export const deleteMission = async (taskId: number, missionId: number, cookieHeaders?: string): Promise<void> => {

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders

    const res = await fetch(`${API_BASE}/tasks/${taskId}/missions/${missionId}`, {
        method: 'DELETE',
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to delete mission')
}

// --------------------Tasks-------------



const getTotalTaskHours = async (cookieHeader?: string): Promise<number> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks/total-hours`, {
        method: 'GET',
        headers,
        credentials: 'include'
    })

    if (!res.ok) return 0

    const data = await res.json()
    return Number(data.totalHours) || 0
}



export const getAllTasks = async (cookieHeader?: string): Promise<TaskResponse> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const [taskRes, totalHours] = await Promise.all([
        fetch(`${API_BASE}/tasks`, {
            method: 'GET',
            headers,
            credentials: 'include'
        }),
        getTotalTaskHours(cookieHeader)
    ])

    if (!taskRes.ok) throw new Error(`Failed to fetch tasks: ${taskRes.status}`)

    const data = await taskRes.json()

    return { tasks: data.tasks, totalHours }
}

export const getTask = async (taskId: number, cookieHeader?: string): Promise<Task> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader


    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        credentials: 'include',
        headers,
        method: 'GET'
    })

    if (!res.ok) throw new Error(`Failed to fetch task: ${res.status}`)

    const data = await res.json()
    return data.task
}

export const createTask = async (taskData: { title: string, summery?: string | null, status: Task['status'], priority: Task['priority'], deadline: Date | string, projectId: number }, cookieHeader?: string): Promise<Task> => {

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData),
        credentials: "include",
    })
    if (!res.ok) throw new Error(`Failed to create task: ${res.status}`)
    const data = await res.json()
    return data.task
}

export const updateTask = async (taskId: number, updates: Partial<Omit<Task, 'id' | 'ownerId'>>, cookieHeader?: string): Promise<Task> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
        credentials: "include",
    })
    if (!res.ok) throw new Error(`Failed to update task: ${res.status}`)
    const data = await res.json()
    return data.task
}

export const deleteTask = async (taskId: number, cookieHeader?: string): Promise<{ success: boolean }> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers,
        credentials: "include",
    })
    if (!res.ok) throw new Error(`Failed to delete task: ${res.status}`)
    return { success: true }
}

export const getTaskByProject = async (processId: number, cookieHeader?: string): Promise<Task[]> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks?projectId=${processId}`, {
        headers,
        credentials: 'include'
    })

    if (!res.ok) throw new Error(`Failed to fetch tasks for project: ${res.status}`)

    const data = await res.json()
    return data.tasks
}

export const updateTaskStatus = async (taskId: number, status: string, cookieHeader?: string): Promise<Task> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
        credentials: "include",
    })
    if (!res.ok) throw new Error(`Failed to update task status: ${res.status}`)
    const data = await res.json()
    return data.task
}