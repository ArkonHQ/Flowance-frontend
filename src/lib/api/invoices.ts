import { Client } from "./clients"
import { Project } from "./projects"


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Invoice = {
    id: number
    invoiceNumber: number
    amount: number
    status: 'paid' | 'sent' | 'overdue' | 'draft' | 'cancelled' | 'partially_paid'
    clientId: number
    projectId: number
    ownerId: string
    paidAt: Date | null
    dueDate: Date
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
}

export const getAllInvoices = async (cookieHeader?: string) => {
  
  const headers: Record<string, string> = {'Content-Type': 'application/json'}
  if(cookieHeader) headers['Cookie'] = cookieHeader
  
  const res = await fetch(`${API_BASE}/invoices`, {
    headers,
    credentials: 'include',
    method: 'GET'
  })

  if(!res.ok) throw new Error((`Failed to fetch invoices: ${res.status}`))

  const data = await res.json()
  return data.invoice
}

export const getInvoice = async (invoiceId: number, cookieHeader?: string) => {
  
  const headers: Record<string, string> = {'Content-Type': 'application/json'}
  if(cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/invoices/${invoiceId}`, {
    headers,
    credentials: 'include',
    method: 'GET'
  })

  if (!res.ok) throw new Error (`Failed to fetch invoice: ${res.status}`)

  const data = await res.json()
  return data.invoice
}

export const createInvoice = async (invoiceData: {amount: number, status: Invoice['status'], clientId: number, projectId: number, paidAt: Date | null, dueDate: Date | null}, cookieHeader?:string) => {
  const headers: Record<string, string> = {'Content-Type': 'application/json'}
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/invoices/new`, {
    credentials: 'include',
    headers,
    body: JSON.stringify(invoiceData),
    method: 'POST'
  })

  if(!res.ok) throw new Error(`Failed to create invoice: ${res.status}`)

  const data = await res.json()
  return data.invoice
}

export const updateInvoice = async (invoiceId: number, updates: Partial<Omit<Invoice, 'id' | 'ownerId'>>, cookieHeader?: string) => {

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if(cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/invoices/edit`, {
    credentials: 'include',
    method: 'PUT',
    headers,
    body: JSON.stringify(invoiceId)
  })

  if (!res.ok) throw new Error (`Failed to edit invoice: ${res.status}`)

  const data = await res.json()
  return data.invoice
}

export const deleteInvoice = async (invoiceId: number, cookieHeader?: string) => {

  const headers: Record <string, string> = { 'Content-Type': 'application/json' }
  if(cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch (`${API_BASE}/invoices/${invoiceId}`, {
    credentials:'include',
    method: 'DELETE',
    headers
  })

  if (!res.ok) throw new Error (`Failed to remove invoice: ${res.status}`)

  return{ success: true }
}