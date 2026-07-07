import { cookies } from 'next/headers'
import { getUserTeams } from '../api/teams'

// Server-side: get active team slug from cookies, or fallback to first team, or 'personal'
export const getActiveTeamSlug = async (cookieHeader: string): Promise<string> => {
  const cookieStore = await cookies()
  const slug = cookieStore.get('fcc_current_team_slug')?.value

  if (slug) return slug

  try {
    // If no cookie set fetch the user's teams
    const teams = await getUserTeams(cookieHeader)
    if (teams.length > 0) {
      return teams[0].slug
    }
  } catch (e) {
    console.error("Failed to fetch teams in getActiveTeamSlug", e)
  }

  // Fallback: personal workspace (no team)
  return 'personal'
}