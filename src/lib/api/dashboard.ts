
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

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
    recentActivity: Array<{ type: string, description: string, createdAt: string}>
    upcomingTasks: Array<{ id: number, title: string, deadline: string, projectName: string, priority: 'High' | 'Medium' | 'Low' }>
    atRiskProjects: Array<{ id: number, name: string, progress: number }>
    deadlines: Array<{ type: string, title: string, deadline: string }>
    mostActiveMember: { name: string, taskCount: number } | null
    teamWorkload: Array<{ name:string, openTask: number }>
    tasksCompletedThisWeek: number
}


export async function getDashboard(cookieHeader?: string, period?: string): Promise<DashboardData> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }

    const url = new URL(`${API_BASE}/dashboard`)
    if (period) {
        url.searchParams.set('period', period)
    }

    const res = await fetch(url.toString(), {
        credentials: "include",
        headers,
    });
    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized");
        }
        throw new Error(`Failed to fetch dashboard ${res.status}`);
    }

    const json = await res.json()

    return json.data as DashboardData
}

export const getMonthlyHealthMetric = async (cookieHeader?: string): Promise<MonthlyHealthMetric[]> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const res = await fetch(`${API_BASE}/dashboard/monthly-health`, {
        credentials: "include",
        headers,
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized")
        }
        // Return empty array on any other error rather than crashing the page
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

export async function getLastMonthKPIs(cookieHeader?: string): Promise<LastMonthKPIs> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }

    const res = await fetch(`${API_BASE}/dashboard/trends`, {
        credentials: "include",
        headers,
    });

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
