import { Team } from "@/lib/api/teams"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5501/api'

interface TeamState {
  teams: Team[]
  currentTeam: Team | null
  isLoading: boolean
  error: string | null
  fetchTeams: () => Promise<void>
  setCurrentTeam: (slug: string) => void
}

const PERSONAL_TEAM: Team = {
  id: -1,
  name: 'Personal',
  slug: 'personal',
  description: 'Your personal workspace',
  ownerId: -1,
  createdAt: '',
  updatedAt: '',
}

const setCookie = (name: string, value: string, days: number = 365) => {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = "; expires=" + date.toUTCString()
  document.cookie = name + "=" + (value || "") + expires + "; path=/"
}

const getCookie = (name: string) => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

import { create } from 'zustand'
import { getUserTeams } from '@/lib/api/teams'

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,
  fetchTeams: async () => {
    set({ isLoading: true, error: null })
    try {
      const teams = await getUserTeams()

      // Always include "Personal" as first option
      const allTeams = [PERSONAL_TEAM, ...teams]
      set({ teams: allTeams })

      if (allTeams.length > 0) {
        const savedSlug = getCookie('fcc_current_team_slug')
        const found = allTeams.find(t => t.slug === savedSlug)
        if (found) {
          set({ currentTeam: found })
        } else {
          // Default to first real team if exists else Personal
          const defaultTeam = teams.length > 0 ? teams[0] : PERSONAL_TEAM
          set({ currentTeam: defaultTeam })
          setCookie('fcc_current_team_slug', defaultTeam.slug)
        }
      }
    } catch (err: any) {
      // If API fails fall back to Personal only
      set({ teams: [PERSONAL_TEAM], currentTeam: PERSONAL_TEAM, error: err.message })
      setCookie('fcc_current_team_slug', 'personal')
    } finally {
      set({ isLoading: false })
    }
  },
  setCurrentTeam: (slug: string) => {
    const team = get().teams.find(t => t.slug === slug)
    if (team) {
      set({ currentTeam: team })
      setCookie('fcc_current_team_slug', slug)
      // Refresh the page to reload server components with new cookie
      window.location.reload()
    }
  }
}))
