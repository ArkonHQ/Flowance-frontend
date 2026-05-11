"use server"

// lib/api/clients.ts
// WHAT: All client-related DB/API calls using Server Actions
// WHY: Centralize DB logic, easy to maintain
// WHEN: Any component needs client data

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type Client = {
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ClientInsight = {
    id: string;
    ownerId: string;
    name: string;
    totalProjects: number;
    totalEarned: number;
    unpaidAmount: number;
    avgPaymentDelayDays: number;
    riskLevel: 'high' | 'medium' | 'low';
    onTimePaymentPercent: number;
    overdueInvoiceCount: number;
    daysSinceLastInvoice: number;
    riskReason: string;
}

export type ClientWithInsights = Client & {
    insights?: ClientInsight;
}

import { redirect } from "next/navigation";

const requireAuth = async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        redirect("/login");
    }
    return session;
}

// GET all clients with insights
export const getClients = async (): Promise<Client[]> => {
    const session = await requireAuth();
    const userClients = await db.select().from(clients).where(eq(clients.ownerId, session.user.id));
    return userClients as Client[];
}

// GET single client with insights
export const getOneClient = async (id: string): Promise<ClientWithInsights> => {
    const session = await requireAuth();
    const result = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.ownerId, session.user.id))).limit(1);
    if (result.length === 0) throw new Error("Client not found");
    return result[0] as ClientWithInsights;
}

// GET pure insights without client data
export const getInsightsOnly = async (id: string): Promise<ClientInsight> => {
    const session = await requireAuth();
    // TODO: implement insights logic
    throw new Error("Insights not implemented yet");
}

// POST Create client 
export const createClient = async (data: {name: string, email?: string, company?: string}): Promise<Client> => {
    const session = await requireAuth();
    const newClient = await db.insert(clients).values({
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        company: data.company,
        ownerId: session.user.id,
    }).returning();
    return newClient[0] as Client;
}

// PUT Update client
export const updateClient = async (id: string, data: Partial<Pick<Client, 'name' | 'email' | 'company'>>) => {
    const session = await requireAuth();
    const updated = await db.update(clients)
        .set(data)
        .where(and(eq(clients.id, id), eq(clients.ownerId, session.user.id)))
        .returning();
    if (updated.length === 0) throw new Error("Failed to update client");
    return updated[0] as Client;
}

// DELETE client
export const deleteClient = async (id: string): Promise<void> => {
    const session = await requireAuth();
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.ownerId, session.user.id)));
}
