export type Team = {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string
  ownerId: number
  createdAt: string
  updatedAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export const getUserTeams = async (cookieHeader?: string): Promise<Team[]> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/teams`, {
    method: 'GET',
    headers,
    credentials: 'include'
  })

  if (!res.ok) {
    if (res.status === 401 || res.status === 403 || res.status === 404) {
      return []
    }
    const text = await res.text().catch(() => '')
    throw new Error(`Failed to fetch user teams: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.data || []
}

export const createTeam = async (name: string, description?: string): Promise<Team> => {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to create team')
  const data = await res.json()
  return data.data
}
