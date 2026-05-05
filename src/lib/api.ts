'use client'

import { useEffect, useState } from 'react'

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

const getActiveTasks = () => {
    return fetchApi<{success: boolean; count: number; data: any[] }>('api/v1/dashboard/active-tasks')
}


export default fetchApi
