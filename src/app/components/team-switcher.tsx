"use client"


import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useSession } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
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
import { useEffect, useState } from "react"
import { CreateTeamModal } from "./create-team-modal"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"





const roleDisplay = (role: string) => {
  const roles: Record <string, string> ={
    member: 'Member',
    admin: 'Admin',
  }
  return roles[role] || 'Owner'
}
export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { teams, currentTeam, setCurrentTeam, fetchTeams } = useTeamStore()
  const { data: session } = useSession()
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  if (!currentTeam) return null

  return (
    <SidebarMenu className="p-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-border/40 bg-card/40 px-3 py-2 text-left text-sm transition-all hover:bg-accent/50 hover:shadow-sm data-[state=open]:bg-accent/80 data-[state=open]:shadow-sm data-[state=open]:border-border/60"
            >
              {/* background subtle glow */}
              <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-data-[state=open]:opacity-100" />
              
              <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-linear-to-br from-background to-muted shadow-sm overflow-hidden transition-transform group-hover:scale-105 group-data-[state=open]:scale-105">
                {currentTeam.logo ? (
                  <img src={currentTeam.logo} alt={currentTeam.name} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
                    <span className="text-sm font-bold uppercase tracking-wider shadow-xs">{currentTeam.name.substring(0, 2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate font-semibold tracking-tight text-foreground">
                  {currentTeam.name}
                </span>
                <span className="truncate text-xs font-medium text-muted-foreground/80">
                  {roleDisplay(currentTeam.teamMember?.role || 'member')}
                </span>
              </div>
              
              {currentTeam.members && currentTeam.members.length > 0 && (
                <AvatarGroup size="sm" className="hidden lg:flex shrink-0 -space-x-1.5 opacity-80 transition-opacity group-hover:opacity-100">
                  {currentTeam.members.slice(0, 3).map(m => (
                    <Avatar key={m.id} size="sm" className="size-6 border-2 border-card shadow-xs">
                      {m.image && <AvatarImage src={m.image} alt={m.name} />}
                      <AvatarFallback className="bg-muted text-[9px] font-semibold text-muted-foreground">{m.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                  {currentTeam.members.length > 3 && (
                    <AvatarGroupCount className="size-6 border-2 border-card bg-muted text-[9px] font-semibold shadow-xs">+{currentTeam.members.length - 3}</AvatarGroupCount>
                  )}
                </AvatarGroup>
              )}
              
              <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-85 overflow-hidden rounded-xl border border-border/50 bg-background/95 p-1.5 shadow-xl backdrop-blur-xl"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
          >
            {session?.user && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="group/profile relative mb-2 flex items-center gap-3 rounded-lg border border-border/30 bg-linear-to-br from-muted/50 to-muted/20 p-3 shadow-xs transition-all hover:border-border/50 hover:bg-muted/50"
              >
                <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm ring-1 ring-border/20 transition-transform group-hover/profile:scale-105">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="size-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{session.user.name?.substring(0, 2) || 'U'}</span>
                  )}
                  <span className={cn(
                    "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background shadow-xs",
                    currentTeam.teamMember?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                  )} />
                </div>
                
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-semibold tracking-tight text-foreground">{session.user.name}</span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                      {roleDisplay(currentTeam.teamMember?.role || 'member')}
                    </span>
                    <span className="size-1 rounded-full bg-border" />
                    <span className="truncate text-xs font-medium text-muted-foreground">
                      {currentTeam.teamMember?.status === 'active' ? 'Online' : 'Away'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
              Your Teams
            </DropdownMenuLabel>
            
            <div className="flex flex-col gap-0.5 mt-1">
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setCurrentTeam(team.slug)}
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-all focus:bg-accent/80 focus:text-accent-foreground data-[state=checked]:bg-accent/50"
              >
                <div className="flex flex-1 items-center gap-3 overflow-hidden">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background shadow-xs transition-transform group-hover:scale-105 group-hover:shadow-sm">
                   {team.logo ? (
                     <img src={team.logo} alt={team.name} className="size-full rounded-md object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/10 text-primary dark:from-primary/30 dark:to-primary/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{team.name.substring(0, 2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium tracking-tight group-hover:text-foreground">{team.name}</span>
                    <span className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">{roleDisplay(team.teamMember?.role || 'none')}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {team.members && team.members.length > 0 && (
                    <AvatarGroup className="-space-x-1.5 opacity-80 transition-opacity group-hover:opacity-100">
                      {team.members.slice(0, 3).map(m => (
                        <Avatar key={m.id} size="sm" className="size-6 border-2 border-background shadow-xs">
                          {m.image && <AvatarImage src={m.image} alt={m.name} />}
                          <AvatarFallback className="bg-muted text-[8px] font-semibold">{m.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 3 && (
                        <AvatarGroupCount className="size-6 border-2 border-background bg-muted text-[8px] font-semibold shadow-xs">+{team.members.length - 3}</AvatarGroupCount>
                      )}
                    </AvatarGroup>
                  )}
                  {team.slug === currentTeam.slug && (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3.5 stroke-[3]" />
                    </motion.div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            </div>
            
            <DropdownMenuSeparator className="my-1.5 bg-border/50" />
            
            {currentTeam?.slug !== 'personal' && (
              <DropdownMenuItem onClick={() => router.push('/settings/team')} className="group flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-muted-foreground transition-all focus:bg-primary/5 focus:text-primary">
                <div className="flex size-8 items-center justify-center rounded-md border border-border/80 bg-transparent transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                  <Settings className="size-4 transition-transform group-hover:scale-110" />
                </div>
                <div className="font-medium tracking-tight">Team Settings</div>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => setCreateTeamOpen(true)} className="group flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-muted-foreground transition-all focus:bg-primary/5 focus:text-primary">
              <div className="flex size-8 items-center justify-center rounded-md border border-dashed border-border/80 bg-transparent transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                <Plus className="size-4 transition-transform group-hover:scale-110" />
              </div>
              <div className="font-medium tracking-tight">Create new team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <CreateTeamModal open={createTeamOpen} onOpenChange={setCreateTeamOpen} />
    </SidebarMenu>
  )
}
