"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useTeamStore } from "@/store/teamStore"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { teams, currentTeam, setCurrentTeam, fetchTeams } = useTeamStore()

  React.useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  if (!currentTeam) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {currentTeam.logo ? (
                   <img src={currentTeam.logo} alt={currentTeam.name} className="size-full rounded-lg object-cover" />
                ) : (
                   <span className="text-xs font-bold uppercase">{currentTeam.name.substring(0, 2)}</span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentTeam.name}
                </span>
                <span className="truncate text-xs">Free Plan</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setCurrentTeam(team.slug)}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                 {team.logo ? (
                   <img src={team.logo} alt={team.name} className="size-full rounded-sm object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold uppercase">{team.name.substring(0, 2)}</span>
                  )}
                </div>
                {team.name}
                {team.slug === currentTeam.slug && <Check className="ml-auto size-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2 cursor-pointer" onClick={() => alert("Create team feature coming soon!")}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
