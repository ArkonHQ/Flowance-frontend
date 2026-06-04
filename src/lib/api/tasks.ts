import { Project } from "./projects"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Task =  {
    id: number,
    progress: number
    project: Project,
    title: string,
    description: string | null,
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

interface TaskResponse {
    tasks: Task[]
    totalHours: number
}

const getTotalTaskHours = async (cookieHeader?: string): Promise<number> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const res = await fetch(`${API_BASE}/tasks/total-hours`, {
        method: 'GET',
        headers,
        credentials: 'include'
    })

    if (!res.ok) return 0

    const data = await res.json()
    return Number(data.totalHours) || 0
}

export const getAllTasks = async ( cookieHeader?: string ): Promise<TaskResponse> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const [taskRes, totalHours] = await Promise.all([
        fetch(`${API_BASE}/tasks`, {
            method: 'GET',
            headers,
            credentials: 'include'
        }),
        getTotalTaskHours(cookieHeader)
    ])

    if (!taskRes.ok) throw new Error (`Failed to fetch tasks: ${taskRes.status}`)

    const data = await taskRes.json()

    return { tasks: data.tasks, totalHours }
}

export const getTask = async (taskId: number, cookieHeader?: string): Promise<Task> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader


    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        credentials: 'include',
        headers,
        method: 'GET'
    })

    if (!res.ok) throw new Error (`Failed to fetch task: ${res.status}`)
    
    const data = await res.json()
    return data.task
}

export const createTask = async (taskData: {title: string, status: Task['status'], priority: Task['priority'], deadline: Date | string, projectId: number }, cookieHeader?: string): Promise<Task> => {
    
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader
    
    const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(taskData),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to create task: ${res.status}`);
    const data = await res.json();
    return data.task;
}

export const updateTask = async (taskId: number, updates: Partial<Omit<Task, 'id' | 'ownerId'>>, cookieHeader?: string): Promise<Task> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to update task: ${res.status}`);
    const data = await res.json();
    return data.task;
}

export const deleteTask = async (taskId: number, cookieHeader?: string): Promise<{ success: boolean }> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers,
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to delete task: ${res.status}`);
    return { success: true };
}
