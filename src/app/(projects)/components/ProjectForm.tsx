'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useActionState } from "react"
import { handleCreateProject } from "../projects/new/action"
import type { Client } from "@/lib/api/clients"



interface ProjectFormProps {
  clients: Client[]
}

export const ProjectForm = ({ clients }: ProjectFormProps) => {
  const [state, formAction, isPending] = useActionState(handleCreateProject, null)

  return (
    <div className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm rounded-xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-blue-500" />
      <div className="p-6">
        <CardHeader className="px-0 pt-0 pb-6">
          <CardTitle className="text-xl font-semibold">Project Details</CardTitle>
        </CardHeader>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <Alert
              variant={'destructive'}>
              <AlertDescription>{state.error}</AlertDescription>
              </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input 
              id="title"
              name="title"
              placeholder="e.g. Website Redesign"
              required
              className="bg-card/70"
                />
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Client</Label>
            <Select name="clientId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>        
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button 
              type="submit"
              disabled={isPending}
              className="gap-2"
              >
                {isPending ? 'Creating...' : 'Create Project'}
              </Button>
              <Button 
                variant={'outline'}
                type="button"
                onClick={() => history.back()}>
                  Cancel
                </Button>
          </div>
        </form>
      </div>



    </div>
  )

  



}