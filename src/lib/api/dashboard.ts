
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type MonthlyHealthMetric = {
    month: string
    active_count: number
    active_ids: number
    new_clients: number
    churn_rate: number | null
    active_count_change: number
}

export interface DashboardData {
    totalRevenue: number
    activeProject: number
    totalHours: number
    pendingInvoices: number
    projectProgress: Array<{ id: number, name: string, progress: number }>
    recentActivity: Array<{ type: string, description: string, createdAt: string}>
    upcomingTasks: Array<{ id: number, title: string, deadline: string, projectName: string }>
    atRiskProjects: Array<{ id: number, name: string, progress: number }>
    deadlines: Array<{ type: string, title: string, deadline: string }>
    mostActiveMember: { name: string, taskCount: number } | null
    teamWorkload: Array<{ name:string, openTask: number }>
    tasksCompletedThisWeek: number
}


export async function getDashboard(cookieHeader?: string): Promise<DashboardData> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }
    const res = await fetch(`${API_BASE}/dashboard`, {
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

    if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
    }

    const res = await fetch(`${API_BASE}/dashboard/monthly-health`, {
        credentials: "include",
        headers,
    });

    if (!res.ok) {

        if (res.status === 401) {
            throw new Error("Unauthorized")
        }

        throw new Error(`Failed to fetch metrics: ${res.status}`);
    }

    const data = await res.json()
    return data.metrics
}
