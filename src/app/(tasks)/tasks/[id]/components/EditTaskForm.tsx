'use client'

import { Project } from "@/lib/api/projects"
import { Task } from "@/lib/api/tasks"
import { useActionState } from "react"
import { updateTaskAction } from "../edit/action"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"






interface props{
  task: Task
  project: Project[]
}


export const EditTaskForm = ({ task, project}: props) => {

  const [state, formAction, isPending] = useActionState(updateTaskAction, null)

  return (
    <div className="relative overflow-hidden border border-border/30 bg-card/50 shadow-sm backdrop-blur-md rounded-xl">
      <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-indigo-500 to-blue-500" />
        <CardHeader className="pt-5">
          <CardTitle className="text-lg font-semibold">
            Task Details
          </CardTitle>
          <form
            action={formAction}
            className="space-y-6"
            >
              {/* Error state */}
              {state?.error && (
                <Alert
                  variant={'destructive'}
                  >
                    <AlertDescription>
                      {state?.error}
                    </AlertDescription>
                  </Alert>
              )}
              {/* Hidden field for task ID */}
              <input
                type="hidden"
                name="taskId"
                value={task.id}
              />
              {/* Hidden field for project ID */}
              <input 
                type="hidden"
                name="projectId"
                value={task.projectId}
              />

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Task Title
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                    defaultValue={task.title}
                    required
                    className="bg-card/70"
                    />
                </Label>
              </div>
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  <Input 
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    defaultValue={task.description || ''}
                    className="bg-card/70"
                  />
                </Label>
              </div>

              {/* Project */}
              <div className="space-y-2">
                <Label htmlFor="projectId">
                  Project
                </Label>
                <Select
                  name="projectId"
                  defaultValue={String(task.projectId)}
                  required
                  >
                    <SelectTrigger className="bg-card/70">
                      <SelectValue placeholder='Select a project' />
                    </SelectTrigger>
                    <SelectContent>
                    {project.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.title}
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
                      defaultValue={task.status}
                      required
                      >
                        <SelectTrigger className="bg-card/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">
                      priority
                    </Label>
                    <Select 
                      name="priority"
                      defaultValue={task.priority}
                      required
                      >
                        <SelectTrigger className="bg-card/70">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
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