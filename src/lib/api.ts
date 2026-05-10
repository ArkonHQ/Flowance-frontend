'use client'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500'

const fetchApi = async <T>(endpoint: string): Promise<T> => {
    // If the user in the browser get the token if it exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const res = await fetch(`${API_URL}${endpoint}`,{
        headers: {
            'Content-Type': 'application/json',
            ...(token && {Authorization: `Bearer ${token}`}),
        },
    })

    const data = await res.json()
    if (!res.ok) throw new Error (data.message || 'Request failed')
    return data
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
