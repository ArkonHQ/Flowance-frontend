'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Activity, Clock, CheckCircle2, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TeamMember {
  id: number
  name: string
  image?: string | null
  status?: string
  lastActiveAt?: string | null
}

interface TeamOverviewCardProps {
  workload?: Array<{ name: string; openTask: number }>
  members?: TeamMember[]
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-500',
  'bg-emerald-500/20 text-emerald-500',
  'bg-violet-500/20 text-violet-500',
  'bg-rose-500/20 text-rose-500',
  'bg-amber-500/20 text-amber-500',
]

export function TeamOverviewCard({ workload = [], members = [] }: TeamOverviewCardProps) {
  // If we have actual members from the DB, use those, else use workload names, else empty
  const totalMembers = members.length > 0 ? members.length : workload.length
  const displayMembers = members.length > 0 
    ? members 
    : workload.map((w, i) => ({ id: i, name: w.name, image: null }))

  const runningTasks = workload.reduce((acc, curr) => acc + curr.openTask, 0)
  
  const activeToday = members.length > 0 ? members.filter(m => {
    if (!m.lastActiveAt) return false;
    const lastActive = new Date(m.lastActiveAt);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length : 0;

  const online = members.length > 0 ? members.filter(m => {
    if (!m.lastActiveAt) return false;
    const diff = new Date().getTime() - new Date(m.lastActiveAt).getTime();
    return diff < 60 * 60 * 1000; // within last 1 hour
  }).length : 0;

  const teamStats = [
    { label: 'Online Now', value: online.toString(), icon: Activity, color: 'text-emerald-500' },
    { label: 'Active Today', value: activeToday.toString(), icon: CheckCircle2, color: 'text-blue-500' },
    { label: 'Open Tasks', value: runningTasks.toString(), icon: Clock, color: 'text-orange-500' },
    { label: 'Team Size', value: totalMembers.toString(), icon: Users, color: 'text-violet-500' },
  ]

  const remainingCount = Math.max(0, totalMembers - 5)

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 pt-5 border-b border-border/10 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10">
              <Users className="h-4 w-4 text-pink-500" />
            </div>
            Team Capacity
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Resource allocation</p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/team">
            Manage <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 pt-5 flex flex-col justify-between space-y-6">
        <div className="flex items-center -space-x-3 overflow-hidden px-2">
          {totalMembers === 0 ? (
            <div className="text-sm text-muted-foreground italic">No team members yet</div>
          ) : (
            <>
              {displayMembers.slice(0, 5).map((member, i) => {
                const initials = member.name.substring(0, 2).toUpperCase()
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
                return (
                  <Avatar key={member.id} className="inline-block border-2 border-background h-11 w-11 transition-transform duration-200 hover:-translate-y-1 hover:z-20 cursor-pointer shadow-sm">
                    {member.image && <AvatarImage src={member.image} alt={member.name} />}
                    <AvatarFallback className={`text-xs font-bold ${color}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )
              })}
              {remainingCount > 0 && (
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-bold text-muted-foreground z-10 shadow-sm">
                  +{remainingCount}
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {teamStats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1 p-2.5 rounded-xl border border-border/10 bg-background/30 hover:bg-background/70 hover:border-border/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                <span>{stat.label}</span>
              </div>
              <p className="text-xl font-black text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
