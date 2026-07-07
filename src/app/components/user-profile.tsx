"use client"

import { useState } from "react"
import { ChevronsUpDown, LogOut, Moon, Sun, User as UserIcon, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function UserProfile() {
  const { theme, setTheme } = useTheme()
  const { open } = useSidebar()
  const router = useRouter()
  
  // Get user from better-auth client
  const { data: session } = authClient.useSession()
  const user = session?.user

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative size-8 rounded-full overflow-hidden hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 hover:ring-offset-background transition-all"
        >
          <Avatar className="size-full">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {user.name?.substring(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-xl shadow-2xl border-border/40 backdrop-blur-xl bg-background/95" align="start" side="right" sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 rounded-full border shadow-xs">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback className="rounded-full bg-primary/10 text-primary font-semibold">
                {user.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-semibold tracking-tight truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50 my-1" />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer gap-3 p-2 rounded-md transition-colors focus:bg-primary/5 focus:text-primary">
            <UserIcon className="size-4 text-muted-foreground" />
            <span className="font-medium">Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-3 p-2 rounded-md transition-colors focus:bg-primary/5 focus:text-primary">
            <Settings className="size-4 text-muted-foreground" />
            <span className="font-medium">Preferences</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50 my-1" />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="cursor-pointer gap-3 p-2 rounded-md transition-colors focus:bg-primary/5 focus:text-primary"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === 'dark' ? (
              <Sun className="size-4 text-muted-foreground" />
            ) : (
              <Moon className="size-4 text-muted-foreground" />
            )}
            <span className="font-medium">Toggle Theme</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50 my-1" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer gap-3 p-2 rounded-md transition-colors focus:bg-destructive/10 focus:text-destructive text-destructive"
        >
          <LogOut className="size-4" />
          <span className="font-medium">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
