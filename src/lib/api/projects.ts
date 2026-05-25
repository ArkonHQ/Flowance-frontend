import { Client } from "./clients";


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
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    progress: number
}   

// keep API helpers minimal and consistent

// GET all projects
export const getAllProjects = async (cookieHeader?: string): Promise<Project[]> => {

    const headers: Record<string, string> ={'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    

    const res = await fetch(`${API_BASE}/projects`, {
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
export const createProject = async (projectData: { title: string, status: Project['status'], clientId: number, deadline: Date | string, budget: number }, cookieHeader?: string): Promise<Project> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader
    
    
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(projectData),
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.status}`);
    const data = await res.json();
    return data.project;
}

// PUT update project
export const updateProject = async (projectId: number, updates: Partial<Omit<Project, 'id' | 'ownerId'>>, cookieHeader?: string): Promise<Project> => {
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader
    
    
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
    const data = await res.json();
    return data.project;
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
