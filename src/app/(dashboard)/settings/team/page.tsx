"use client"

import { useState, useEffect } from "react"
import { useTeamStore } from "@/store/teamStore"
import { getTeam, updateTeam, deleteTeam, leaveTeam, removeMember, changeMemberRole, inviteMember } from "@/lib/api/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { useSession } from "@/lib/auth"
import {
  Trash2, LogOut, Crown, Shield, UserCheck, Mail,
  Send, Loader2, Users, Settings2, UserPlus, AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const AVATAR_PALETTE = [
  'from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600', 'from-indigo-500 to-blue-600',
]

const RoleBadge = ({ role }: { role: string }) => {
  if (role === 'owner') return (
    <Badge className="gap-1 bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] font-bold">
      <Crown className="h-2.5 w-2.5" /> Owner
    </Badge>
  )
  if (role === 'admin') return (
    <Badge className="gap-1 bg-violet-500/15 text-violet-500 border-violet-500/30 text-[10px] font-bold">
      <Shield className="h-2.5 w-2.5" /> Admin
    </Badge>
  )
  return (
    <Badge className="gap-1 bg-muted text-muted-foreground border-border/50 text-[10px] font-bold">
      <UserCheck className="h-2.5 w-2.5" /> Member
    </Badge>
  )
}

const TeamSettingsPage = () => {
  const { currentTeam, fetchTeams } = useTeamStore()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"general" | "members">("general")
  const [teamDetails, setTeamDetails] = useState<any>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [isInviting, setIsInviting] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (currentTeam) loadTeamDetails()
  }, [currentTeam])

  const loadTeamDetails = async () => {
    if (!currentTeam) return
    try {
      const data = await getTeam(currentTeam.slug)
      setTeamDetails(data)
      setName(data.name || "")
      setDescription(data.description || "")
    } catch (err: any) {
      toast.error(err.message || "Failed to load team details")
    }
  }

  const handleLogoUpload = async (url: string) => {
    if (!currentTeam) return
    await updateTeam(currentTeam.slug, { logo: url })
    await fetchTeams()
    loadTeamDetails()
  }

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTeam) return
    setIsUpdating(true)
    try {
      await updateTeam(currentTeam.slug, { name, description })
      toast.success("Team updated successfully")
      await fetchTeams()
      loadTeamDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to update team")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTeam || !inviteEmail.trim()) return
    setIsInviting(true)
    try {
      await inviteMember(currentTeam.slug, inviteEmail)
      toast.success(`Invitation sent to ${inviteEmail}!`)
      setInviteEmail("")
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!currentTeam) return
    if (!confirm(`Remove ${memberName} from the team?`)) return
    setRemovingId(memberId)
    try {
      await removeMember(currentTeam.slug, memberId)
      toast.success(`${memberName} removed`)
      loadTeamDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member")
    } finally {
      setRemovingId(null)
    }
  }

  const handleRoleChange = async (memberId: string, role: string) => {
    if (!currentTeam) return
    try {
      await changeMemberRole(currentTeam.slug, memberId, role)
      toast.success("Role updated")
      loadTeamDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to change role")
    }
  }

  const handleDeleteTeam = async () => {
    if (!currentTeam) return
    if (!confirm("Are you absolutely sure? This permanently deletes the team and all its data.")) return
    try {
      await deleteTeam(currentTeam.slug)
      toast.success("Team deleted")
      await fetchTeams()
      window.location.href = '/'
    } catch (err: any) {
      toast.error(err.message || "Failed to delete team")
    }
  }

  if (!currentTeam || !teamDetails) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p className="text-sm text-muted-foreground">Loading team settings...</p>
        </div>
      </div>
    )
  }

  const isAdminOrOwner = currentTeam.teamMember?.role === "admin" || currentTeam.teamMember?.role === "owner"
  const members = teamDetails?.members || []
  const teamInitials = (teamDetails.name || 'TM').substring(0, 2).toUpperCase()

  const TABS = [
    { key: 'general', label: 'General', icon: Settings2 },
    { key: 'members', label: `Members (${members.length})`, icon: Users },
  ] as const

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-6 space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <AvatarUpload
          currentImage={teamDetails.logo}
          fallback={teamInitials}
          onUpload={handleLogoUpload}
          size="lg"
          bucket="avatars"
          folder="teams"
          disabled={!isAdminOrOwner}
        />
        <div>
          <h1 className="text-2xl font-black tracking-tight">{teamDetails.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isAdminOrOwner ? 'Click the logo to change it' : 'Team Settings'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50 gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(key as any)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="border border-border/30 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base">Team Details</CardTitle>
                <CardDescription>Update your team name and description.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateGeneral} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="t-name">Team Name</Label>
                    <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdminOrOwner} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-desc">Description</Label>
                    <Textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isAdminOrOwner} rows={3} />
                  </div>
                  {isAdminOrOwner && (
                    <Button type="submit" disabled={isUpdating} className="gap-2">
                      {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {isAdminOrOwner && (
              <Card className="border border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible actions — proceed with caution.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-semibold">Delete Team</p>
                      <p className="text-xs text-muted-foreground">Permanently remove this team and all its data.</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDeleteTeam} className="gap-2">
                      <Trash2 className="h-4 w-4" /> Delete Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div key="members" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Invite Card */}
            {isAdminOrOwner && (
              <Card className="border border-border/30 bg-card/50 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                    </div>
                    Invite a Member
                  </CardTitle>
                  <CardDescription>Send an email invitation to join this team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" disabled={isInviting || !inviteEmail.trim()} className="gap-2 shrink-0">
                      {isInviting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <><Send className="h-4 w-4" /> Send Invite</>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Members List */}
            <Card className="border border-border/30 bg-card/50 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/10">
                    <Users className="h-4 w-4 text-pink-500" />
                  </div>
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <AnimatePresence>
                  {members.map((member: any, i: number) => {
                    const name = member.userName || member.name || 'Unknown'
                    const email = member.userEmail || member.email || ''
                    const avatar = member.userAvatar || member.image || undefined
                    const role = member.role || 'member'
                    const isMe = member.userId === session?.user?.id
                    const isRemoving = removingId === member.userId

                    return (
                      <motion.div
                        key={member?.userId || member?.id || member?.membershipId || `settings-member-${i}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/10 hover:bg-muted/30 transition-colors"
                      >
                        <Avatar className="h-10 w-10 border border-border/20 shrink-0">
                          <AvatarImage src={avatar} alt={name} />
                          <AvatarFallback className={`text-white text-xs font-bold bg-gradient-to-br ${AVATAR_PALETTE[i % AVATAR_PALETTE.length]}`}>
                            {name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate">{name}</span>
                            {isMe && <span className="text-[10px] text-muted-foreground">(you)</span>}
                            <RoleBadge role={role} />
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{email}</p>
                        </div>
                        {isAdminOrOwner && !isMe && role !== 'owner' && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Select defaultValue={role} onValueChange={(val) => handleRoleChange(member.userId, val)}>
                              <SelectTrigger className="h-7 w-24 text-xs">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeamSettingsPage;