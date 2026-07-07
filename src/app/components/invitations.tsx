"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getInvitations, acceptInvitation, declineInvitation } from "@/lib/api/teams"
import { useTeamStore } from "@/store/teamStore"
import { toast } from "sonner"

export function Invitations() {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { fetchTeams } = useTeamStore()

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      const data = await getInvitations()
      setInvitations(data)
    } catch (err) {
      console.error("Failed to load invitations", err)
    }
  }

  const handleAccept = async (token: string) => {
    try {
      await acceptInvitation(token)
      toast.success("Invitation accepted!")
      await fetchTeams()
      loadInvitations()
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invitation")
    }
  }

  const handleDecline = async (token: string) => {
    try {
      await declineInvitation(token)
      toast.success("Invitation declined.")
      loadInvitations()
    } catch (err: any) {
      toast.error(err.message || "Failed to decline invitation")
    }
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" side="right" sideOffset={16}>
        <div className="p-4 border-b border-border">
          <h4 className="font-medium text-sm">Invitations</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {invitations.map((inv) => (
            <div key={inv.id} className="p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{inv.team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Invited by {inv.inviter?.name || inv.inviter?.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => handleAccept(inv.invitationToken)}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => handleDecline(inv.invitationToken)}>
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
