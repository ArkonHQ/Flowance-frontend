import { getClientTeamSlug } from "../utils/team-client"

const API_BASE = process.env.API_BASE_INTERNAL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Client = {
    id: number;
    name: string;
    email: string | null;
    company: string | null;
    status: 'active' | 'at-risk' | 'inactive' | 'vip' | 'internal';
    ownerId: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export type ClientInsight = {
    id: string;
    ownerId: string;
    clientId: number;
    name: string;
    totalProjects: number;
    totalRevenue: number;
    lastActivity: string;
    status: 'active' | 'at-risk' | 'inactive' | 'vip';
    totalEarned: number;
    unpaidAmount: number;
    avgPaymentDelayDays: number;
    riskLevel: 'high' | 'medium' | 'low';
    onTimePaymentPercent: number;
    overdueInvoiceCount: number;
    daysSinceLastInvoice: number;
    riskReason: string;
}

const resolveSlug = (provided?: string) => provided || getClientTeamSlug()

// GET all clients
export const getAllClients = async (cookieHeader?: string, teamSlug?: string): Promise<Client[]> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/teams/${slug}/clients`, {
        headers,
        credentials: "include",
        cache: "no-store"
    });
    if (!res.ok) {
        console.error(`getAllClients failed: ${res.status}`, await res.text().catch(() => ''));
        return []
    }
    const data = await res.json();
    return data.clients;
}

// GET single client
export const getClient = async (clientId: number, cookieHeader?: string, teamSlug?: string): Promise<Client> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/teams/${slug}/clients/${clientId}`, {
        headers,
        credentials: "include"
    });
    if (!res.ok) throw new Error(`Failed to fetch client: ${res.status}`)
    const data = await res.json();
    return data.client;
}

// GET client insights
export const getClientInsight = async (clientId?: number, cookieHeader?: string, teamSlug?: string): Promise<any> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const url = clientId !== undefined
        ? `${API_BASE}/teams/${slug}/clients/${clientId}/insights`
        : `${API_BASE}/teams/${slug}/clients/insights`;

    const res = await fetch(url, {
        headers,
        credentials: "include",
        cache: "no-store"
    });
    if (!res.ok) {
        if (res.status === 404 || res.status === 401) return null
        throw new Error(`Failed to fetch client insight: ${res.status}`)
    }
    const data = await res.json()
    return data.insight
}

// POST create client
export const createClient = async (clientData: { name: string; email: string; company: string }, teamSlug?: string): Promise<Client> => {
    const slug = resolveSlug(teamSlug)
    const res = await fetch(`${API_BASE}/teams/${slug}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to create client: ${res.status}`)
    const data = await res.json();
    return data.client;
}

// PUT update client
export const updateClient = async (clientId: number, updates: Partial<Omit<Client, 'id' | 'ownerId'>>, teamSlug?: string): Promise<Client> => {
    const slug = resolveSlug(teamSlug)
    const res = await fetch(`${API_BASE}/teams/${slug}/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to update client: ${res.status}`)
    const data = await res.json();
    return data.client;
}

// DELETE client
export const deleteClient = async (clientId: number, teamSlug?: string): Promise<{ success: boolean }> => {
    const slug = resolveSlug(teamSlug)
    const res = await fetch(`${API_BASE}/teams/${slug}/clients/${clientId}`, {
        method: 'DELETE',
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to delete client: ${res.status}`)
    return { success: true };
}
