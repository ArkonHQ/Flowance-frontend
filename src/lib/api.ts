'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5501';

const fetchApi = async <T>(endpoint: string): Promise<T> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Normalize URL to prevent double slashes or missing protocols
    const baseUrl = API_URL.replace(/\/+$/, '');
    const cleanPath = endpoint.replace(/^\/+/, '');
    const url = baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;

    try {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (error) {
        console.error(`Fetch error at ${url}:`, error);
        throw error;
    }
}

const getActiveTask = () => {
    return fetchApi<{success: boolean; count: number;  }>('api/v1/dashboard/active-tasks')
}
const getCompletedTask = () => {
    return fetchApi<{success: boolean; count: number; }>('api/v1/dashboard/completed-tasks')
}

const getDelayedTask = () => {
    return fetchApi<{success: boolean; count: number; }>('api/v1/dashboard/delayed-tasks')
}

const getEarnings = ( period: string = 'month' ) => {
    return fetchApi<{success: boolean; total:number }>(`api/v1/dashboard/earnings?period=${period}`)
}
    
export {
    getEarnings,
    getActiveTask,
    getCompletedTask,
    getDelayedTask,
}

export default fetchApi
