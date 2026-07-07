"use client"

import { useState, useEffect } from "react"
import { useTeamStore } from "@/store/teamStore"
import { getTeam, updateTeam, deleteTeam, leaveTeam, transferOwnership, removeMember, changeMemberRole, inviteMember } from "@/lib/api/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useSession } from "@/lib/auth"
import { Trash, LogOut } from "lucide-react"
import { toast } from "sonner"

export default function TeamSettingsPage() {
  const { currentTeam, fetchTeams } = useTeamStore()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"general" | "members">("general")
  const [teamDetails, setTeamDetails] = useState<any>(null)
  
  // General settings state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Members state
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (currentTeam) {
      loadTeamDetails()
    }
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
      toast.success("Invitation sent successfully")
      setInviteEmail("")
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!currentTeam) return
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await removeMember(currentTeam.slug, memberId)
      toast.success("Member removed")
      loadTeamDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member")
    }
  }

  const handleChangeRole = async (memberId: number, role: string) => {
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
    if (!confirm("Are you absolutely sure you want to delete this team? This cannot be undone.")) return

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
    return <div className="p-8 text-center text-muted-foreground">Loading team settings...</div>
  }

  const isAdminOrOwner = currentTeam.teamMember?.role === "admin" || currentTeam.teamMember?.role === "owner"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
        <p className="text-muted-foreground">
          Manage your team settings and members for {currentTeam.name}.
        </p>
      </div>

      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
              <CardDescription>Update your team's name and description.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateGeneral} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={!isAdminOrOwner}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    disabled={!isAdminOrOwner}
                  />
                </div>
                {isAdminOrOwner && (
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {isAdminOrOwner && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your team.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Delete Team</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete this team and all of its data.</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteTeam}>
                    <Trash className="size-4 mr-2" />
                    Delete Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6">
          {isAdminOrOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Invite Member</CardTitle>
                <CardDescription>Invite a new member to your team via email.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="flex gap-4">
                  <Input 
                    placeholder="user@example.com" 
                    type="email" 
                    value={inviteEmail} 
                    onChange={(e) => setInviteEmail(e.target.value)} 
                    required 
                    className="max-w-md"
                  />
                  <Button type="submit" disabled={isInviting || !inviteEmail.trim()}>
                    {isInviting ? "Sending..." : "Send Invite"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People with access to this team.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamDetails.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {isAdminOrOwner && member.id !== session?.user?.id ? (
                        <Select 
                          defaultValue={member.role || 'member'} 
                          onValueChange={(val) => handleChangeRole(member.id, val)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                          {member.role || 'member'}
                        </span>
                      )}

                      {isAdminOrOwner && member.id !== session?.user?.id && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                          <Trash className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
