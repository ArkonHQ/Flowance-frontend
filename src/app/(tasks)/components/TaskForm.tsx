"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Plus, Trash2, TagsIcon, 
  CheckSquare, ListTodo, Loader2, ArrowUpRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TagSelector } from "@/components/ui/tag-selector"
import { Project } from "@/lib/api/projects"
import { createTask } from "@/lib/api/tasks"
import { ProjectIcon } from "@/components/ui/project-icon"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"

type Priority = "low" | "medium" | "high"
type Status = "todo" | "in_progress" | "done" | "delayed" | "cancelled"

interface NewMission {
  id: string
  title: string
}

interface TaskFormProps {
  projects: Project[]
  isOpen: boolean
  onClose: () => void
  onTaskCreated?: () => void
}

const priorities: { value: Priority; label: string; color: string; bg: string; border: string; glow: string }[] = [
  { value: "low", label: "Low", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
  { value: "medium", label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/20" },
  { value: "high", label: "High", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/20" },
]

const statuses: { value: Status; label: string; dot: string }[] = [
  { value: "todo", label: "To Do", dot: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", dot: "bg-amber-500" },
  { value: "done", label: "Done", dot: "bg-emerald-500" },
  { value: "delayed", label: "Delayed", dot: "bg-slate-400" },
  { value: "cancelled", label: "Cancelled", dot: "bg-rose-500" },
]

export function TaskForm({ projects, isOpen, onClose, onTaskCreated }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingStep, setSubmittingStep] = useState("")

  // Form states
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState<string>("")
  const [status, setStatus] = useState<Status>("todo")
  const [priority, setPriority] = useState<Priority>("medium")
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [missions, setMissions] = useState<NewMission[]>([])
  const [newMissionInput, setNewMissionInput] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())

  const addMission = () => {
    const val = newMissionInput.trim()
    if (!val) return
    const newMission: NewMission = {
      id: Date.now().toString(),
      title: val,
    }
    setMissions((prev) => [...prev, newMission])
    setNewMissionInput("")
  }

  const removeMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id))
  }

  const updateMission = (id: string, title: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, title } : m))
    )
  }

  const resetForm = () => {
    setTitle("")
    setSummary("")
    setDescription("")
    setProjectId("")
    setStatus("todo")
    setPriority("medium")
    setSelectedTagIds([])
    setMissions([])
    setNewMissionInput("")
    setDate(new Date())
  }

  const formattedDeadline = date ? format(date, "yyyy-MM-dd") : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) {
      toast.error("Please select a project")
      return
    }
    if (!title.trim() || title.trim().length < 3) {
      toast.error("Task title must be at least 3 characters")
      return
    }

    setIsSubmitting(true)
    setSubmittingStep("Creating task...")

    try {
      const taskObj = await createTask({
        title,
        summery: summary || undefined,
        status,
        priority,
        deadline: date || new Date(),
        projectId: Number(projectId),
        tagIds: selectedTagIds,
      })

      if (missions.length > 0) {
        for (let i = 0; i < missions.length; i++) {
          setSubmittingStep(`Adding mission ${i + 1} of ${missions.length}...`)
          const m = missions[i]
          if (m.title.trim()) {
            await import("@/lib/api/tasks").then(mod => mod.addMission(taskObj.id, m.title.trim()))
          }
        }
      }

      toast.success("Task and missions created successfully!")
      resetForm()
      onClose()
      onTaskCreated?.()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to create task")
    } finally {
      setIsSubmitting(false)
      setSubmittingStep("")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/30 bg-card/90 shadow-2xl backdrop-blur-xl max-h-[90vh] flex flex-col"
          >
            {/* Premium Gradient Top Border */}
            <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />

            {/* Loading Overlay */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md"
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-semibold tracking-wide animate-pulse">{submittingStep}</p>
                    <p className="text-xs text-muted-foreground">Creating your task workspace.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Create New Task</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form Fields - Scrollable Area */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>01</span> Basic Details
                  </h3>

                  {/* Task Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-semibold tracking-wide text-foreground/80">
                      Task Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="What needs to be done?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="h-10 bg-muted/20 border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <Label htmlFor="summary" className="text-xs font-semibold tracking-wide text-foreground/80">
                      Brief Summary
                    </Label>
                    <Input
                      id="summary"
                      name="summary"
                      type="text"
                      placeholder="A quick overview (optional)"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="h-10 bg-muted/20 border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-semibold tracking-wide text-foreground/80">
                      Description & Notes
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Write clear instructions, links, or context..."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-muted/20 border-border/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 rounded-xl transition-all placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>

                  {/* Project Picker */}
                  <div className="space-y-1.5">
                    <Label htmlFor="project" className="text-xs font-semibold tracking-wide text-foreground/80">
                      Project & Workspace <span className="text-rose-500">*</span>
                    </Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger className="h-10 bg-muted/20 border-border/40 focus:border-primary/60 rounded-xl">
                        <SelectValue placeholder="Select target project" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60">
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)} className="rounded-lg py-2">
                            <div className="flex items-center gap-2">
                              <ProjectIcon project={p} showTooltip={true} className="w-4 h-4 shrink-0" />
                              <span className="font-medium text-sm">{p.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <span>02</span> Parameters & Goals
                  </h3>

                  {/* Status & Deadline Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="status" className="text-xs font-semibold tracking-wide text-foreground/80">
                        Status
                      </Label>
                      <Select value={status} onValueChange={(val: Status) => setStatus(val)}>
                        <SelectTrigger className="h-9 bg-muted/20 border-border/40 rounded-xl">
                          <SelectValue placeholder="Select Status" />
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

                    <div className="space-y-1.5">
                      <Label htmlFor="deadline" className="text-xs font-semibold tracking-wide text-foreground/80">
                        Due Date
                      </Label>
                      <CustomDatePicker
                        date={date}
                        onChange={setDate}
                        placeholder="Select deadline"
                      />
                    </div>
                  </div>

                  {/* Priority Button Group */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold tracking-wide text-foreground/80">
                      Task Priority
                    </Label>
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
                                ? cn(p.bg, p.border, p.color, p.glow, "shadow-sm border-current") 
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

                  {/* Tags classification */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold tracking-wide text-foreground/80 flex items-center gap-1">
                      <TagsIcon className="h-3.5 w-3.5" /> Tags Classification
                    </Label>
                    <div className="rounded-xl border border-border/20 bg-muted/10 p-2.5">
                      <TagSelector 
                        selectedTagIds={selectedTagIds}
                        compact={true}
                        noIcon={true}
                        onChange={(newTagIds) => setSelectedTagIds(newTagIds)}
                      />
                    </div>
                  </div>

                  {/* Missions Checklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold tracking-wide text-foreground/80 flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5 text-primary" /> Missions Checklist
                      </Label>
                      <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">
                        {missions.length} Goal{missions.length !== 1 && "s"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add subtask goal..."
                        value={newMissionInput}
                        onChange={(e) => setNewMissionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addMission()
                          }
                        }}
                        className="h-8 bg-muted/20 border-border/40 rounded-xl text-xs placeholder:text-muted-foreground/45"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={addMission}
                        className="h-8 px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1">
                      <AnimatePresence initial={false}>
                        {missions.map((m, index) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, x: -10, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: "auto" }}
                            exit={{ opacity: 0, x: 10, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center gap-2 group p-1.5 bg-muted/10 border border-border/20 rounded-lg hover:border-border/40 transition-colors">
                              <span className="text-[9px] font-semibold text-muted-foreground/60 w-4 text-center">
                                {index + 1}
                              </span>
                              <input
                                type="text"
                                value={m.title}
                                onChange={(e) => updateMission(m.id, e.target.value)}
                                className="flex-1 bg-transparent border-none text-xs focus:ring-0 focus:outline-none py-0 px-1 font-medium"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMission(m.id)}
                                className="h-5 w-5 text-muted-foreground/40 hover:text-rose-500 rounded-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {missions.length === 0 && (
                        <p className="text-center text-[11px] text-muted-foreground/60 py-3 italic border border-dashed border-border/20 rounded-xl bg-muted/5">
                          No missions yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer inside the modal */}
              <div className="border-t border-border/20 pt-4 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl border-border/40 hover:bg-muted/40 h-10 px-5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 h-10 px-6 text-xs flex items-center gap-1.5"
                >
                  <span>Create Task</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}