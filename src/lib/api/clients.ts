
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Client = {
    id: number;
    name: string;
    email: string | null;
    company: string | null;
    status: 'active' | 'at-risk' | 'inactive' | 'vip';
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

// GET all clients
export const getAllClients = async (cookieHeader?: string): Promise<Client[]> => {
    const headers: Record<string, string> = {};
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }
    const res = await fetch(`${API_BASE}/clients`, {
        headers,
        credentials: "include",
        cache: "no-store"
    });
    if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);
    const data = await res.json();
    return data.clients;
}

// GET single clients
export const getClient = async (clientId: number, cookieHeader?: string): Promise<Client> => {
    const headers: Record<string, string> = {};
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }
    const res = await fetch(`${API_BASE}/clients/${clientId}`, {
        headers,
        credentials: "include"
    });
    if (!res.ok) throw new Error(`Failed to fetch client: ${res.status}`);
    const data = await res.json();
    return data.client;
}

// GET clients insights
export const getClientInsight = async (clientId?: number, cookieHeader?: string): Promise<any> => {
    const headers: Record<string, string> = {};
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }
    const url = clientId !== undefined
        ? `${API_BASE}/clients/${clientId}/insights`
        : `${API_BASE}/clients/insights`;

    const res = await fetch(url, {
        headers,
        credentials: "include",
        cache: "no-store"
    });
    if (!res.ok) throw new Error(`Failed to fetch client insight: ${res.status}`);
    const data = await res.json();
    return data.insight;
}


// POST create clients
export const createClient = async (clientData: { name: string; email: string; company: string }): Promise<Client> => {
    const res = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to create client: ${res.status}`);
    const data = await res.json();
    return data.client;
}

// PUT update clients
export const updateClient = async (clientId: number, updates: Partial<Omit<Client, 'id' | 'ownerId'>>): Promise<Client> => {
    const res = await fetch(`${API_BASE}/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to update client: ${res.status}`);
    const data = await res.json();
    return data.client;
}

// DELETE clients
export const deleteClient = async (clientId: number): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/clients/${clientId}`, {
        method: 'DELETE',
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to delete client: ${res.status}`);
    return { success: true };
}