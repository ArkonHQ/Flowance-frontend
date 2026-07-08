import { getClientTeamSlug } from "../utils/team-client"

const API_BASE = process.env.API_BASE_INTERNAL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Invoice = {
    id: number
    invoiceNumber: number
    amount: number
    status: 'paid' | 'sent' | 'overdue' | 'draft' | 'cancelled' | 'partially_paid'
    clientId: number
    projectId: number
    ownerId: string
    teamId?: number
    paidAt: Date | null
    dueDate: Date
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
}

const resolveSlug = (provided?: string) => provided || getClientTeamSlug()

export const getAllInvoices = async (cookieHeader?: string, teamSlug?: string) => {
  const slug = resolveSlug(teamSlug)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/teams/${slug}/invoices`, {
    headers,
    credentials: 'include',
    method: 'GET',
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error(`getAllInvoices failed: ${res.status}`, await res.text().catch(() => ''));
    return [] as Invoice[]
  }

  const data = await res.json()
  return data.data?.invoices ?? data.invoices ?? data.invoice ?? data
}

export const getInvoice = async (invoiceId: number, cookieHeader?: string, teamSlug?: string) => {
  const slug = resolveSlug(teamSlug)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/teams/${slug}/invoices/${invoiceId}`, {
    headers,
    credentials: 'include',
    method: 'GET'
  })

  if (!res.ok) throw new Error(`Failed to fetch invoice: ${res.status}`)
  const data = await res.json()
  return data.data?.invoice ?? data.invoice
}

export const createInvoice = async (invoiceData: { amount: number, status: Invoice['status'], clientId: number, projectId: number, paidAt: Date | null, dueDate: Date | null }, cookieHeader?: string, teamSlug?: string) => {
  const slug = resolveSlug(teamSlug)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/teams/${slug}/invoices`, {
    credentials: 'include',
    headers,
    body: JSON.stringify(invoiceData),
    method: 'POST'
  })

  if (!res.ok) throw new Error(`Failed to create invoice: ${res.status}`)
  const data = await res.json()
  return data.data?.invoice ?? data.invoice
}

export const updateInvoice = async (invoiceId: number, updates: Partial<Omit<Invoice, 'id' | 'ownerId'>>, cookieHeader?: string, teamSlug?: string) => {
  const slug = resolveSlug(teamSlug)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/teams/${slug}/invoices/${invoiceId}`, {
    credentials: 'include',
    method: 'PUT',
    headers,
    body: JSON.stringify(updates)
  })

  if (!res.ok) throw new Error(`Failed to edit invoice: ${res.status}`)
  const data = await res.json()
  return data.invoice
}

export const deleteInvoice = async (invoiceId: number, cookieHeader?: string, teamSlug?: string) => {
  const slug = resolveSlug(teamSlug)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/teams/${slug}/invoices/${invoiceId}`, {
    credentials: 'include',
    method: 'DELETE',
    headers
  })

  if (!res.ok) throw new Error(`Failed to remove invoice: ${res.status}`)
  return { success: true }
}
