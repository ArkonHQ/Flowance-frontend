import { getClientTeamSlug } from "../utils/team-client"

const API_BASE = process.env.API_BASE_INTERNAL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Tag = {
  id: number,
  name: string,
  icon: string,
  color: string,
  ownerId: string,
  createdAt: string,
  updatedAt: string
}



const resolveSlug = (provided?: string) => provided || getClientTeamSlug()

export const getTags = async (teamSlug?: string): Promise<Tag[]> => {
  const slug = resolveSlug(teamSlug)
  const res = await fetch(`${API_BASE}/teams/${slug}/tags`, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401 || res.status === 404) return []
    throw new Error('Failed to fetch tags');
  }
  const data = await res.json();
  return data.tags;
}

export const createTag = async (data: { name: string; icon?: string; color?: string }, teamSlug?: string): Promise<Tag> => {
  const slug = resolveSlug(teamSlug)
  const res = await fetch(`${API_BASE}/teams/${slug}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create tag');
  const json = await res.json();
  return json.tag;
}

export const updateTag = async (id: number, data: Partial<Tag>, teamSlug?: string): Promise<Tag> => {
  const slug = resolveSlug(teamSlug)
  const res = await fetch(`${API_BASE}/teams/${slug}/tags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update tag');
  const json = await res.json();
  return json.tag;
}
