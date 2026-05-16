import { Client } from "./clients";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Project = {
    id: number;
    client: Client;
    title: string;
    description: string;
    status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled'
    clientId: number;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}   

// GET all projects
export const getAllProjects = async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE}/projects`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
    const data = await res.json();
    return data.projects;
}       

// GET single project
export const getProject = async (projectId: number): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to fetch project: ${res.status}`);
    const data = await res.json();
    return data.project;
}

// POST create project
export const createProject = async (projectData: { title: string, status: Project['status'], clientId: number }): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.status}`);
    const data = await res.json();
    return data.project;
}

// PUT update project
export const updateProject = async (projectId: number, updates: Partial<Omit<Project, 'id' | 'ownerId'>>): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to update project: ${res.status}`);
    const data = await res.json();
    return data.project;
}

// DELETE project
export const deleteProject = async (projectId: number): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.status}`);
    return { success: true };
}
