"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X, MailOpen, UserPlus, Sparkles, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getInvitations, acceptInvitation, declineInvitation } from "@/lib/api/teams"
import { useTeamStore } from "@/store/teamStore"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function Invitations() {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    setIsLoading(true)
    try {
      await acceptInvitation(token)
      toast.success("Welcome to the team!", { icon: <Sparkles className="size-4 text-amber-500" /> })
      await fetchTeams()
      loadInvitations()
    } catch (err: any) {
      toast.error(err.message || "Failed to accept invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async (token: string) => {
    setIsLoading(true)
    try {
      await declineInvitation(token)
      toast.info("Invitation declined.")
      loadInvitations()
    } catch (err: any) {
      toast.error(err.message || "Failed to decline invitation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all">
          <Bell className="h-4 w-4" />
          {invitations.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0 shadow-2xl rounded-xl border-border/40 overflow-hidden backdrop-blur-xl bg-background/95" align="end" side="right" sideOffset={16}>
        <div className="relative overflow-hidden bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b border-border/40">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MailOpen className="size-16" />
          </div>
          <div className="relative z-10">
            <h4 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              Invitations
            </h4>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {invitations.length} pending {invitations.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {invitations.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col items-center justify-center py-12 px-4 text-center"
              >
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="size-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">You're all caught up!</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">No new team invitations at the moment.</p>
              </motion.div>
            ) : (
              invitations.map((inv) => (
                <motion.div 
                  key={inv.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="size-10 border shadow-xs bg-background">
                      {inv.team.logo ? (
                        <AvatarImage src={inv.team.logo} alt={inv.team.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/5 text-primary">
                          <Building2 className="size-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold tracking-tight">{inv.team.name}</p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                          {inv.role || 'Member'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        Invited by <span className="font-medium text-foreground">{inv.inviter?.name || inv.inviter?.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 h-9 text-xs font-semibold shadow-xs hover:shadow-sm transition-all" 
                      onClick={() => handleAccept(inv.invitationToken)}
                      disabled={isLoading}
                    >
                      <Check className="size-3.5 mr-1" /> Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 h-9 text-xs font-medium hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors" 
                      onClick={() => handleDecline(inv.invitationToken)}
                      disabled={isLoading}
                    >
                      <X className="size-3.5 mr-1" /> Decline
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  )
}
