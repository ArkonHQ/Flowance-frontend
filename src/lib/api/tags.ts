const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

export type Tag = {

  id: number,
  name: string,
  icon: string,
  color: string,
  ownerId: string,
  createdAt: string,
  updatedAt: string

}

export const getTags = async (): Promise<Tag[]> => {
  const res = await fetch(`${API_BASE}/tags`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch tags');
  const data = await res.json();
  return data.tags;
}

export const createTag = async (data: { name: string; icon?: string; color?: string }): Promise<Tag> => {
  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create tag');
  const json = await res.json();
  return json.tag;
}

export const updateTag = async (id: number, data: Partial<Tag>): Promise<Tag> => {
  const res = await fetch(`${API_BASE}/tags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update tag');
  const json = await res.json();
  return json.tag;
}