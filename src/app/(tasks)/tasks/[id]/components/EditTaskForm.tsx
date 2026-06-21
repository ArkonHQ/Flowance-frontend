'use client'

import { useState } from "react"
import { useActionState } from "react"
import { motion } from "framer-motion"
import { Project } from "@/lib/api/projects"
import { Task } from "@/lib/api/tasks"
import { updateTaskAction } from "../edit/action"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ProjectIcon } from "@/components/ui/project-icon"
import { TagSelector } from "@/components/ui/tag-selector"
import { cn } from "@/lib/utils"
import { 
  TagsIcon, 
  ArrowUpRight, AlertCircle, Sparkles
} from "lucide-react"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  task: Task
  project: Project[]
}

type Priority = "low" | "medium" | "high"
type Status = "todo" | "in_progress" | "done" | "delayed" | "cancelled"

const priorities: { value: Priority; label: string; color: string; bg: string; border: string }[] = [
  { value: "low", label: "Low", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { value: "medium", label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { value: "high", label: "High", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
]

const statuses: { value: Status; label: string; dot: string }[] = [
  { value: "todo", label: "To Do", dot: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", dot: "bg-amber-500" },
  { value: "done", label: "Done", dot: "bg-emerald-500" },
  { value: "delayed", label: "Delayed", dot: "bg-slate-400" },
  { value: "cancelled", label: "Cancelled", dot: "bg-rose-500" },
]

export const EditTaskForm = ({ task, project }: Props) => {
  const [state, formAction, isPending] = useActionState(updateTaskAction, null)

  // Manage form fields to support interactive states
  const [projectId, setProjectId] = useState<string>(String(task.projectId))
  const [status, setStatus] = useState<Status>(task.status as Status)
  const [priority, setPriority] = useState<Priority>(task.priority as Priority)
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(() => {
    if (!task.deadline) return new Date()
    return new Date(task.deadline)
  })
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(() => {
    return task.tags?.map((t) => t.id) || []
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden border border-border/30 bg-card/45 shadow-2xl backdrop-blur-xl rounded-2xl p-6 lg:p-8"
    >
      {/* Premium Gradient Accent */}
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/20">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h2 className="text-xl font-bold tracking-tight text-foreground">Task Details & Settings</h2>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Error message */}
        {state?.error && (
          <Alert variant="destructive" className="rounded-xl border-rose-500/20 bg-rose-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-semibold">{state?.error}</AlertDescription>
          </Alert>
        )}

        {/* Hidden Fields */}
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="tagIds" value={JSON.stringify(selectedTagIds)} />
        <input type="hidden" name="priority" value={priority} />
        <input type="hidden" name="deadline" value={deadlineDate ? deadlineDate.toISOString() : new Date().toISOString()} />
        <input type="hidden" name="status" value={status} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <span>01</span> Core Info
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold tracking-wide text-foreground/80">Task Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter task title"
                defaultValue={task.title}
                required
                className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 rounded-xl"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <Label htmlFor="summery" className="text-xs font-semibold tracking-wide text-foreground/80">Summary</Label>
              <Textarea
                id="summery"
                name="summery"
                placeholder="Enter task summary (optional)"
                defaultValue={task.summery || ""}
                className="bg-muted/20 border-border/40 focus:border-indigo-500/60 rounded-xl resize-none"
                rows={3}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold tracking-wide text-foreground/80">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter task description"
                defaultValue={task.description || ""}
                className="bg-muted/20 border-border/40 focus:border-indigo-500/60 rounded-xl resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Right Column: Parameters & Classification */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <span>02</span> Parameters & tags
            </h3>

            {/* Project Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="projectId" className="text-xs font-semibold tracking-wide text-foreground/80">Project</Label>
              <Select value={projectId} onValueChange={setProjectId} name="projectId">
                <SelectTrigger className="h-10 bg-muted/20 border-border/40 rounded-xl">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  {project.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <ProjectIcon project={p} showTooltip={false} className="w-4.5 h-4.5 shrink-0" />
                        <span className="text-sm font-medium">{p.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status & Deadline Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-wide text-foreground/80">Status</Label>
                <Select value={status} onValueChange={(val: Status) => setStatus(val)}>
                  <SelectTrigger className="h-9 bg-muted/20 border-border/40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                          <span className="text-xs">{s.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline Datepicker */}
              <div className="space-y-1.5">
                <Label htmlFor="deadline" className="text-xs font-semibold tracking-wide text-foreground/80">Due Date</Label>
                <CustomDatePicker
                  date={deadlineDate}
                  onChange={setDeadlineDate}
                  placeholder="Select deadline"
                />
              </div>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide text-foreground/80">Priority</Label>
              <div className="grid grid-cols-3 gap-2">
                {priorities.map((p) => {
                  const active = priority === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-[11px] font-semibold transition-all relative overflow-hidden",
                        active 
                          ? cn(p.bg, p.border, p.color, "shadow-sm border-current") 
                          : "border-border/40 hover:bg-muted/30"
                      )}
                    >
                      <span className={cn("h-1 w-1 rounded-full bg-current")} />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tags Classification */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide text-foreground/80 flex items-center gap-1">
                <TagsIcon className="h-3.5 w-3.5" /> Tags Classification
              </Label>
              <div className="rounded-xl border border-border/20 bg-muted/10 p-2.5">
                <TagSelector 
                  selectedTagIds={selectedTagIds}
                  compact={true}
                  onChange={setSelectedTagIds}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/20">
          <Button
            variant="outline"
            type="button"
            onClick={() => history.back()}
            className="rounded-xl border-border/40 hover:bg-muted/40 h-10 px-5 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 h-10 px-6 text-xs flex items-center gap-1.5"
          >
            {isPending ? "Saving..." : "Save Changes"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}