'use client'

import React from 'react'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import { usePinnedProjectsStore } from '@/store/pinnedProjects'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ProjectIcon } from './ui/project-icon'
import { Project } from '@/lib/api/projects'

// Truncate to first two words of a project title
const shortTitle = (title: string) => {
  const words = title.trim().split(/\s+/)
  return words.slice(0, 2).join(' ')
}

export const PinnedProjectsDisplay = () => {
  const { pinnedProjects } = usePinnedProjectsStore()
  const { open } = useSidebar()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show only first 3 pinned projects
  const visible = pinnedProjects.slice(0, 3)

  if (!isMounted || visible.length === 0) return null

  return (
    <div className={cn(
      "mx-3 mb-3 rounded-xl border border-border/40 bg-muted/20 overflow-hidden",
      "transition-all duration-300"
    )}>
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5">
        <Pin className="h-2.5 w-2.5 text-sky-400 -rotate-45 fill-sky-400" />
        {open && (
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60">
            Pinned
          </span>
        )}
      </div>

      {/* Project rows */}
      <div className="flex flex-col gap-0.5 px-2 pb-2.5">
        {visible.map((project) => (
          <Tooltip key={project.id} delayDuration={300}>
            <TooltipTrigger asChild>
              <Link
                href={`/projects?openPanel=${project.id}`}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5",
                  "hover:bg-sky-500/8 transition-all duration-200",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400/50"
                )}
              >
                {/* Real Project Icon */}
                <ProjectIcon 
                  project={{
                    id: project.id,
                    title: project.title,
                    tags: project.color ? [{ id: 0, name: '', color: project.color, icon: project.icon, entityId: project.id, entityType: 'project', isGlobal: false }] : []
                  } as Project}
                  className="w-6 h-6 rounded-md shrink-0 transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm" 
                  iconClassName="h-3.5 w-3.5"
                  showTooltip={false}
                />

                {/* Name shown only when sidebar is expanded */}
                {open && (
                  <span className="text-[12px] font-semibold text-foreground/80 group-hover:text-foreground truncate transition-colors duration-200 leading-tight">
                    {shortTitle(project.title)}
                  </span>
                )}
              </Link>
            </TooltipTrigger>

            {/* Tooltip always shows full title */}
            <TooltipContent side="right" className="text-xs">
              {project.title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
