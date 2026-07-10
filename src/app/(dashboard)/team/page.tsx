'use client'

import { useState, useEffect } from 'react'
import { useTeamStore } from '@/store/teamStore'
import { getTeam, inviteMember, removeMember, changeMemberRole, updateTeam } from '@/lib/api/teams'
import { useSession } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Crown, Shield, Mail, Trash2,
  Activity, Clock, CheckCircle2, Loader2, Send,
  BarChart3, Zap, UserCheck
} from 'lucide-react'

const AVATAR_PALETTE = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-600',
]

const RoleBadge = ({ role }: { role: string }) => {
  if (role === 'owner') return (
    <Badge className="gap-1 bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/20 text-[10px] font-bold">
      <Crown className="h-2.5 w-2.5" /> Owner
    </Badge>
  )
  if (role === 'admin') return (
    <Badge className="gap-1 bg-violet-500/15 text-violet-500 border-violet-500/30 hover:bg-violet-500/20 text-[10px] font-bold">
      <Shield className="h-2.5 w-2.5" /> Admin
    </Badge>
  )
  return (
    <Badge className="gap-1 bg-muted text-muted-foreground border-border/50 text-[10px] font-bold">
      <UserCheck className="h-2.5 w-2.5" /> Member
    </Badge>
  )
}

const getOnlineStatus = (lastActiveAt?: string | null) => {
  if (!lastActiveAt) return 'offline'
  const diff = Date.now() - new Date(lastActiveAt).getTime()
  if (diff < 5 * 60 * 1000) return 'online'
  if (diff < 60 * 60 * 1000) return 'away'
  return 'offline'
}

const statusDot: Record<string, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-slate-400',
}

export default function TeamCapacityPage() {
  const { currentTeam, fetchTeams } = useTeamStore()
  const { data: session } = useSession()
  const [teamDetails, setTeamDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [isInviting, setIsInviting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (currentTeam) loadTeam()
  }, [currentTeam])

  const loadTeam = async () => {
    if (!currentTeam) return
    setLoading(true)
    try {
      const data = await getTeam(currentTeam.slug)
      setTeamDetails(data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (url: string) => {
    if (!currentTeam) return
    try {
      await updateTeam(currentTeam.slug, { logo: url })
      await fetchTeams()
      loadTeam()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update logo')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTeam || !inviteEmail.trim()) return
    setIsInviting(true)
    try {
      await inviteMember(currentTeam.slug, inviteEmail)
      toast.success(`Invitation sent to ${inviteEmail}!`)
      setInviteEmail('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (memberId: string, name: string) => {
    if (!currentTeam) return
    if (!confirm(`Remove ${name} from the team?`)) return
    setRemovingId(memberId)
    try {
      await removeMember(currentTeam.slug, memberId)
      toast.success(`${name} removed from team`)
      loadTeam()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member')
    } finally {
      setRemovingId(null)
    }
  }

  const handleRoleChange = async (memberId: string, role: string) => {
    if (!currentTeam) return
    try {
      await changeMemberRole(currentTeam.slug, memberId, role)
      toast.success('Role updated')
      loadTeam()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role')
    }
  }

  const members = teamDetails?.members || []
  const workload = teamDetails?.workload || []
  const isAdminOrOwner = currentTeam?.teamMember?.role === 'admin' || currentTeam?.teamMember?.role === 'owner'
  const totalOpenTasks = workload.reduce((acc: number, w: any) => acc + (w.openTask || 0), 0)
  const onlineCount = members.filter((m: any) => getOnlineStatus(m.lastActiveAt) === 'online').length
  const maxWorkload = Math.max(...workload.map((w: any) => w.openTask || 0), 1)

  if (!currentTeam || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p className="text-sm text-muted-foreground">Loading team...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-6 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <AvatarUpload
            currentImage={teamDetails?.logo || undefined}
            fallback={(currentTeam.name || '?').substring(0, 2).toUpperCase()}
            onUpload={handleLogoUpload}
            size="lg"
            bucket="avatars"
            folder="teams"
            disabled={!isAdminOrOwner}
          />
          <div>
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest mb-1">Team</p>
            <h1 className="text-3xl font-black tracking-tight">{currentTeam.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {members.length} member{members.length !== 1 ? 's' : ''} · {onlineCount} online now
            </p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {members.slice(0, 6).map((m: any, i: number) => (
            <Avatar key={m?.userId || m?.id || m?.membershipId || `avatar-${i}`} className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarImage src={m.userAvatar || m.image || undefined} alt={m.userName || m.name} />
              <AvatarFallback className={`text-white text-xs font-bold bg-gradient-to-br ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]}`}>
                {(m.userName || m.name || '?').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {members.length > 6 && (
            <div className="h-9 w-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              +{members.length - 6}
            </div>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Team Size', value: members.length, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Online Now', value: onlineCount, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Open Tasks', value: totalOpenTasks, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Avg Load', value: members.length ? Math.round(totalOpenTasks / members.length) : 0, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="border border-border/30 bg-card/50 backdrop-blur-md hover:shadow-md transition-all">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Members list */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-border/30 bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-3 pt-5 border-b border-border/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10">
                  <Users className="h-4 w-4 text-pink-500" />
                </div>
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <AnimatePresence>
                {members.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-3 text-center">
                    <div className="p-4 rounded-full bg-muted/30">
                      <Users className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No members yet</p>
                    <p className="text-xs text-muted-foreground/60">Invite your first team member below</p>
                  </div>
                ) : members.map((member: any, i: number) => {
                  const name = member.userName || member.name || 'Unknown'
                  const email = member.userEmail || member.email || ''
                  const avatar = member.userAvatar || member.image || undefined
                  const role = member.role || 'member'
                  const status = getOnlineStatus(member.lastActiveAt)
                  const memberWorkload = workload.find((w: any) =>
                    w.name === name || w.userId === member.userId
                  )
                  const openTasks = memberWorkload?.openTask || 0
                  const loadPct = Math.round((openTasks / maxWorkload) * 100)
                  const isCurrentUser = member.userId === session?.user?.id
                  const isRemoving = removingId === member.userId

                  return (
                    <motion.div
                      key={member?.userId || member?.id || member?.membershipId || `member-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/10 bg-background/20 hover:bg-background/50 hover:border-border/30 transition-all"
                    >
                      {/* Avatar + status */}
                      <div className="relative shrink-0">
                        <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                          <AvatarImage src={avatar} alt={name} />
                          <AvatarFallback className={`text-white text-xs font-bold bg-gradient-to-br ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]}`}>
                            {name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusDot[status]}`} />
                      </div>

                      {/* Info + workload bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold truncate">{name}</span>
                          {isCurrentUser && <span className="text-[10px] text-muted-foreground">(you)</span>}
                          <RoleBadge role={role} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1.5">{email}</p>
                        {/* Capacity bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-border/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                loadPct > 75 ? 'bg-rose-500' : loadPct > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${loadPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                            {openTasks} task{openTasks !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {isAdminOrOwner && !isCurrentUser && role !== 'owner' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Select defaultValue={role} onValueChange={(val) => handleRoleChange(member.userId, val)}>
                            <SelectTrigger className="h-7 w-24 text-xs border-border/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemove(member.userId, name)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Invite + Capacity Legend */}
        <div className="lg:col-span-4 space-y-4">
          {/* Invite Card */}
          {isAdminOrOwner && (
            <Card className="border border-border/30 bg-card/50 backdrop-blur-md">
              <CardHeader className="pb-3 pt-5 border-b border-border/10">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                  </div>
                  Invite Member
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleInvite} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-9 border-border/30 bg-background/30 focus:bg-background/80"
                      required
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="border-border/30 bg-background/30">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          Member
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-violet-500" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim()}
                    className="w-full gap-2 font-semibold"
                  >
                    {isInviting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="h-4 w-4" /> Send Invitation</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Capacity Legend */}
          <Card className="border border-border/30 bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-3 pt-5 border-b border-border/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <Zap className="h-4 w-4 text-emerald-500" />
                </div>
                Capacity Key
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[
                { label: 'Low', desc: '0–40% of max load', color: 'bg-emerald-500' },
                { label: 'Medium', desc: '41–75% of max load', color: 'bg-amber-500' },
                { label: 'High', desc: '76–100% of max load', color: 'bg-rose-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.color}`} />
                  <div>
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
