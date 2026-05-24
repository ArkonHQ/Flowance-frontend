'use client'

import { Client } from "@/lib/api/clients"
import { Project } from "@/lib/api/projects"
import { useActionState } from "react"
import { updateProjectAction } from "../edit/action"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"


interface Props {
  project: Project
  clients: Client[]
}


export const EditProjectFrom = ({ project, clients }: Props) => {

  const [state, formAction, isPending] = useActionState(updateProjectAction, null)

  return (
    <div className="relative overflow-hidden border border-border/30 bg-card/50 shadow-sm backdrop-blur-md rounded-xl">
      <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-indigo-500 to-blue-500" />
        <CardHeader className="pt-5">
          <CardTitle className="text-lg font-semibold">
            Project Details
          </CardTitle>
          <form 
            action={formAction}
            className="space-y-6">
              {/* Error state */}
              {state?.error &&(
              <Alert variant={'destructive'}>
                <AlertDescription> {state.error} </AlertDescription>
              </Alert>
              )}

              {/* Hidden field for the project ID  */}
              <Input 
                type="hidden" 
                name="projectId"
                value={project.id}
                  />

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Project Title
                    </Label>
                    <Input 
                      id="title" 
                      name="title"
                      placeholder="Enter project title"
                      defaultValue={project.title}
                      required
                      className="bg-card/70"
                      />
                  </div>
                  {/* Client */}
                  <div className="space-y-2">
                    <Label htmlFor="clientId">
                      Client
                    </Label>
                    <Select 
                      name="clientId"
                      defaultValue={String(project.clientId)}
                      required
                    >
                      <SelectTrigger className="bg-card/70">
                        <SelectValue placeholder='Select a client' />
                      </SelectTrigger>
                      
                      <SelectContent >
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
                        <Label htmlFor="status">
                          Status
                        </Label>
                        <Select 
                          name="status"
                          defaultValue={project.status}
                          required
                        >
                          <SelectTrigger className="bg-card/70">
                            <SelectValue />
                          </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem> 
                              </SelectContent>
                            </Select>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-4">
                    <Button 
                      type="submit"
                      disabled={isPending}
                      className="gap-2"
                      >
                        {isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant={'outline'}
                        type="button"
                        onClick={() => history.back()}
                        >
                          Cancel
                        </Button>
                  </div>
            </form>
        </CardHeader>
    </div>
  )
}