import { getClientTeamSlug } from "../utils/team-client"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

const resolveSlug = (provided?: string) => provided || getClientTeamSlug()

export type MonthlyHealthMetric = {
    month: string
    active_count: number
    active_ids: number[]
    new_clients: number
    churn_rate: number | null
    active_count_change: number
}

export interface DashboardData {
    totalRevenue: number
    activeProject: number
    totalHours: number
    pendingInvoices: number
    unpaidAmount: number
    projectProgress: Array<{ id: number, name: string, progress: number }>
    recentActivity: Array<{ type: string, description: string, createdAt: string }>
    upcomingTasks: Array<{ id: number, title: string, deadline: string, projectName: string, priority: 'High' | 'Medium' | 'Low' }>
    atRiskProjects: Array<{ id: number, name: string, progress: number }>
    deadlines: Array<{ type: string, title: string, deadline: string }>
    mostActiveMember: { name: string, taskCount: number } | null
    teamWorkload: Array<{ name: string, openTask: number }>
    tasksCompletedThisWeek: number
}

export async function getDashboard(cookieHeader?: string, period?: string, teamSlug?: string): Promise<DashboardData> {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const url = new URL(`${API_BASE}/teams/${slug}/dashboard`)
    if (period) url.searchParams.set('period', period)

    const res = await fetch(url.toString(), { credentials: "include", headers })
    if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.error(`getDashboard failed: ${res.status}`, body)
        // Return empty dashboard instead of crashing the page
        return {
            totalRevenue: 0, activeProject: 0, totalHours: 0, pendingInvoices: 0,
            unpaidAmount: 0, projectProgress: [], recentActivity: [], upcomingTasks: [],
            atRiskProjects: [], deadlines: [], mostActiveMember: null, teamWorkload: [],
            tasksCompletedThisWeek: 0
        } as DashboardData
    }

    const json = await res.json()
    return json.data as DashboardData
}

export const getMonthlyHealthMetric = async (cookieHeader?: string, teamSlug?: string): Promise<MonthlyHealthMetric[]> => {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/teams/${slug}/dashboard/monthly-health`, {
        credentials: "include",
        headers,
    })

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized")
        return []
    }

    const data = await res.json()
    return (data.metrics ?? []) as MonthlyHealthMetric[]

}

export interface LastMonthKPIs {
    totalRevenue: number
    activeProjects: number
    totalHours: number
    pendingInvoices: number
    tasksCompleted: number
    unpaidAmount: number
}

export async function getLastMonthKPIs(cookieHeader?: string, teamSlug?: string): Promise<LastMonthKPIs> {
    const slug = resolveSlug(teamSlug)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE}/teams/${slug}/dashboard/trends`, {
        credentials: "include",
        headers,
    })

    if (!res.ok) {
        // Return zeros on error so dashboard still renders
        return {
            totalRevenue: 0,
            activeProjects: 0,
            totalHours: 0,
            pendingInvoices: 0,
            tasksCompleted: 0,
            unpaidAmount: 0,
        }
    }

    const data = await res.json()
    return data.lastMonth as LastMonthKPIs
}
