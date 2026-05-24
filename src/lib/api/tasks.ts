import { Project } from "./projects"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Task =  {
    id: number,
    progress: number
    project: Project | null,
    title: string,
    status: 'todo' | 'in_progress' | 'done' | 'delayed' | 'cancelled',
    priority: 'low' | 'medium' | 'high',
    deadline: Date,
    completedAt: Date | null,
    projectId: number,
    ownerId: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null
}

export const getAllTasks = async ( cookieHeader?: string ): Promise<Task[]> => {

    const headers: Record<string, string> ={'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    

    const res = await fetch(`${API_BASE}/tasks`, {
        method: 'GET',
        headers,
        credentials: 'include'
    })
    if (!res.ok) throw new Error (`Failed to fetch tasks: ${res.status}`)
        
    const data = await res.json()
    return data.tasks
}

export const getTask = async (taskId: number): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        credentials: 'include',
        method: 'GET'
    })

    if (!res.ok) throw new Error (`Failed to fetch task: ${res.status}`)
    
    const data = await res.json()
    return data.task
}

export const createTask = async (taskData: {title: string, status: Task['status'], priority: Task['priority'], deadline: Date, projectId: number } ): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to create task: ${res.status}`);
    const data = await res.json();
    return data.task;
}

export const updateTask = async (taskId: number, updates: Partial<Omit<Task, 'id' | 'ownerId'>>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to update task: ${res.status}`);
    const data = await res.json();
    return data.task;
}

export const deleteTask = async (taskId: number): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to delete task: ${res.status}`);
    return { success: true };
}
