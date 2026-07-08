import { Client } from "./clients";
import { Tag } from "./tags"
import { Task } from "./tasks";
import { getClientTeamSlug } from "../utils/team-client"

const API_BASE = process.env.API_BASE_INTERNAL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'



export type Project = {
    id: number;
    client: Client;
    title: string;
    description: string | null;
    deadline: Date | string;
    budget: number;
    status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled'
    clientId: number;
    isArchived: boolean;
    ownerId: string;
    teamId?: number;
    tags?: Tag[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    progress: number;
    tasks: Task[];
    taskCount?: number
    membersCount?: number
    totalTimeTracked?: number
    health?: string
    attachmentPath?: string | null
    attachmentUrl?: string | null
    attachmentUploadedAt: string
    attachmentUploadedBy: string | null
    attachmentDeletedAt: string |  null
}   

const resolveSlug = (provided?: string) => provided || getClientTeamSlug() || ''

// GET all projects
export const getAllProjects = async (cookieHeader?: string, teamSlug?: string): Promise<Project[]> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> ={'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    
    const res = await fetch(`${API_BASE}/teams/${slug}/projects`, {
        method: "GET",
        headers,
        credentials: 'include'
    })

    if (!res.ok) {
        console.error(`getAllProjects failed: ${res.status}`, await res.text().catch(() => ''));
        return [];
    }
    const data = await res.json();
    return data.projects;
} 

// GET single project
export const getProject = async (projectId: number, cookieHeader?: string, teamSlug?: string): Promise<Project> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/teams/${slug}/projects/${projectId}`,{
        headers,
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`Failed to fetch project: ${res.status}`);
    const data = await res.json();
    return data.project;
}

// POST create project
export const createProject = async (data: Partial<Project> & { tagIds?: number[] }, cookieHeaders?: string, teamSlug?: string): Promise<Project> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders
    
    const res = await fetch(`${API_BASE}/teams/${slug}/projects`, {
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
export const updateProject = async (id: number, data: Partial<Omit<Project, 'id' | 'ownerId'>> & { tagIds?: number[] }, cookieHeaders?: string, teamSlug?: string): Promise<Project> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeaders) headers['Cookie'] = cookieHeaders
    
    const res = await fetch(`${API_BASE}/teams/${slug}/projects/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ? `Failed: ${errData.message}` : `Failed to update project: ${res.status}`);
    }
    const responseData = await res.json();
    return responseData.project;
}

// DELETE project
export const deleteProject = async (projectId: number, cookieHeader?: string, teamSlug?: string): Promise<{ success: boolean }> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = {'Content-Type': 'application/json'}
    if (cookieHeader) headers['Cookie'] = cookieHeader
    
    const res = await fetch(`${API_BASE}/teams/${slug}/projects/${projectId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to delete project: ${res.status}`);
    return { success: true };
}

// GET time chart data (daily minutes for last 7 days)
export const getProjectTimeChart = async (projectId: number, teamSlug?: string): Promise<{ day: string; minutes: number }[]> => {
    const slug = resolveSlug(teamSlug)
    const res = await fetch(`${API_BASE}/teams/${slug}/projects/${projectId}/time-chart`, {
        credentials: 'include',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.chart ?? [];
};
