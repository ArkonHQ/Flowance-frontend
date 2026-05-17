
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
    name: string;
    totalProjects: number;
    totalRevenue: number;
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
export const getAllClients = async (): Promise<Client[]> => {
    const res = await fetch(`${API_BASE}/clients`,
        { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);
    const data = await res.json();
    return data.clients;
}

// GET single clients
export const getClient = async (clientId: number): Promise<Client> => {
    const res = await fetch(`${API_BASE}/clients/${clientId}`,
        { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to fetch client: ${res.status}`);
    const data = await res.json();
    return data.client;
}

// GET clients insights
export const getClientInsight = async (clientId: number): Promise<ClientInsight> => {
    const res = await fetch(`${API_BASE}/clients/${clientId}/insights`,
        { credentials: "include"})
    if (!res.ok) throw new Error(`Failed to fetch client insight: ${res.status}`);
    const data = await res.json();
    return data.insight

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