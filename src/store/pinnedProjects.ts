import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


export interface PinnedProjectMeta {
  id: number
  title: string
  color?: string
  icon?: string 
}



interface PinnedProjectsStore {
  pinnedProjects: PinnedProjectMeta[]
  togglePin: (project: PinnedProjectMeta) => void
  isPinned: (projectId: number) => boolean
  pinnedIds: number[]
}



export const usePinnedProjectsStore = create<PinnedProjectsStore>()(
  persist(
    (set, get) => ({
      pinnedProjects: [],

      get pinnedIds() {
        return get().pinnedProjects.map(p => p.id)
      },

      
      togglePin: (project: PinnedProjectMeta) => {
        const { pinnedProjects } = get()
        const exists = pinnedProjects.some(p => p.id === project.id)
        set({
          pinnedProjects: exists
            ? pinnedProjects.filter(p => p.id !== project.id)
            : [...pinnedProjects, project]
        })
      },


      isPinned: (projectId: number) => {
        return get().pinnedProjects.some(p => p.id === projectId)
      },
    }),
    {
      name: 'pinned-projects',
      storage: createJSONStorage(() => localStorage),
    }
  )
)