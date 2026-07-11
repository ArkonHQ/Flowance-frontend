'use client'

import React from 'react'
import { useTeamStore } from '@/store/teamStore'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface PermissionGuardProps {
  children: React.ReactNode
  allowedRoles?: ('owner' | 'admin' | 'member')[]
  fallback?: React.ReactNode
  actionName?: string
}

export function PermissionGuard({
  children,
  allowedRoles = ['owner', 'admin'],
  fallback,
  actionName = 'perform this action',
}: PermissionGuardProps) {
  const { currentTeam } = useTeamStore()
  const router = useRouter()
  
  const role = currentTeam?.teamMember?.role || 'member'
  const hasPermission = allowedRoles.includes(role as any)

  if (hasPermission) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="border-destructive/20 bg-destructive/5 shadow-2xl overflow-hidden relative backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-destructive/20 blur-[80px] rounded-full pointer-events-none" />
          
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-background w-16 h-16 rounded-full flex items-center justify-center shadow-sm border border-border/50">
              <div className="bg-destructive/10 p-3 rounded-full">
                <ShieldAlert className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Restricted Access
            </CardTitle>
            <CardDescription className="text-sm mt-2 text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
              You don't have the required permissions to {actionName}. Only team admins and the owner can do this.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6 px-6">
            <div className="flex flex-col gap-3">
              <Button 
                variant="default" 
                className="w-full gap-2 shadow-md shadow-primary/10"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" /> Go Back
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-background/50 backdrop-blur border-border/50"
                onClick={() => router.push('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
