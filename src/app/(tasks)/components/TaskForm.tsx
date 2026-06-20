'use client'

import { useActionState, useEffect, useState } from "react"
import { handleCreateTask } from "../tasks/new/action"
import { Project } from "@/lib/api/projects"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SelectItem, SelectTrigger, SelectValue, Select, SelectContent } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TagSelector } from "@/components/ui/tag-selector"
import { Task } from "@/lib/api/tasks"



interface TaskFormProps {
  projects: Project[]
  task?: Task
}

export const TaskForm = ({ projects, task }: TaskFormProps) => {

  const [state, formAction, isPending] = useActionState(handleCreateTask, null)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  

  useEffect(() => {
    if (task) {
      setSelectedTagIds(task.tags?.map(t => t.id) || [])
    }
  }, [task])



  return (
    <div className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm rounded-xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-blue-500" />
      <div className="p-6">
        <CardHeader className="px-0 pt-0 pb-6">
          <CardTitle className="text-xl font-semibold">Task Details</CardTitle>
        </CardHeader>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="tagIds" value={JSON.stringify(selectedTagIds)} />
          {state?.error && (
            <Alert
              variant={'destructive'}>
                {state.error}
              </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title"
              name="title"
              placeholder="e.g. "
              required
              className="bg-card/70"
                />
          </div>

          {/* Summery */}
          <div className="space-y-2">
            <Label htmlFor="summery">Summary</Label>
            <Textarea
              id="summery"
              name="summery"
              placeholder="Brief summary of what this task involves..."
              className="bg-card/70 resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagSelector
                selectedTagIds={selectedTagIds}
                onChange={setSelectedTagIds}
              />  
          </div>
          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <Select name="projectId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
          </div>
          
          {/* Status */}

          <div className="space-y-2 ">
            <Label htmlFor="status">Status</Label>
            <Select name="status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" /> 
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Button 
              type="submit"
              disabled={isPending}
              className="gap-2"
              >
                {isPending ? 'Creating...' : 'Create Task'}
                </Button>
          </div>
        </form>
      </div>
    </div>
  )



}