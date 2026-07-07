export type Team = {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string
  ownerId: number
  teamMember?: {
    role: string
    status: string
  }
  members?: {
    id: number
    name: string
    image?: string | null
  }[]
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

export const getTeam = async (slug: string, cookieHeader?: string): Promise<Team> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${API_BASE}/teams/${slug}`, {
    method: 'GET',
    headers,
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to fetch team')
  const data = await res.json()
  return data.data
}

export const updateTeam = async (slug: string, data: { name?: string; description?: string; logo?: string }): Promise<Team> => {
  const res = await fetch(`${API_BASE}/teams/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to update team')
  const resData = await res.json()
  return resData.data
}

export const deleteTeam = async (slug: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/teams/${slug}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to delete team')
}

export const leaveTeam = async (slug: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/teams/${slug}/leave`, {
    method: 'POST',
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to leave team')
}

export const transferOwnership = async (slug: string, newOwnerId: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/teams/${slug}/transfer-ownership`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newOwnerId }),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to transfer ownership')
}

export const removeMember = async (slug: string, memberId: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/teams/${slug}/members/${memberId}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to remove member')
}

export const changeMemberRole = async (slug: string, memberId: number, role: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/teams/${slug}/members/${memberId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to change member role')
}

export const inviteMember = async (slug: string, email: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/teams/${slug}/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include'
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to invite member');
  }
}

export const acceptInvitation = async (token: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/invitations/${token}/accept`, {
    method: 'POST',
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to accept invitation')
}

export const declineInvitation = async (token: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/invitations/${token}/decline`, {
    method: 'POST',
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to decline invitation')
}

export const getInvitations = async (): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/invitations`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to fetch invitations')
  const data = await res.json()
  return data.data
}
