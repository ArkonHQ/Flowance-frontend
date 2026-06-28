import { Client } from "./clients";
import { Tag } from "./tags"
import { Task } from "./tasks";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'



export type Project = {
    id: number;
    client: Client;
    title: string;
    description: string;
    deadline: Date | string;
    budget: number;
    status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled'
    clientId: number;
    ownerId: string;
    tags?: Tag[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    progress: number;
    tasks: Task[];
    taskCount?: number
    totalTimeTracked?: number
}   

// keep API helpers minimal and consistent

// GET all projects
export const getAllProjects = async (cookieHeader?: string): Promise<Project[]> => {

    const headers: Record<string, string> ={'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    

    const res = await fetch(`${API_BASE}/projects`, {
        method: "GET",
        headers,
        credentials: 'include'
    })

    if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
    const data = await res.json();
    return data.projects;
} 

// GET single project
export const getProject = async (projectId: number, cookieHeader?: string): Promise<Project> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/projects/${projectId}`,{
        headers,
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`Failed to fetch project: ${res.status}`);
    const data = await res.json();
    return data.project;
}

// POST create project
export const createProject = async (data: Partial<Project> & { tagIds?: number[] }, cookieHeaders?: string): Promise<Project> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders
    
    
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.status}`);
    const responseData = await res.json();
    return responseData.project;
}

// PUT update project
export const updateProject = async (id: number, data: Partial<Omit<Project, 'id' | 'ownerId'>> & { tagIds?: number[] }, cookieHeaders?: string): Promise<Project> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders
    
    
    const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
    const responseData = await res.json();
    return responseData.project;
}

// DELETE project
export const deleteProject = async (projectId: number, cookieHeader?: string): Promise<{ success: boolean }> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader
    
    
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.status}`);
    return { success: true };
}
