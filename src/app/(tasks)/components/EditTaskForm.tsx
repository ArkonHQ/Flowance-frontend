'use client'

import { FormModal } from "@/components/forms/FormModal"
import { Priority, PrioritySelector } from "@/components/forms/PrioritySelector"
import { Status, StatusSelector } from "@/components/forms/StatusSelector"
import { Subtask, SubtaskEditor } from "@/components/forms/SubtaskEditor"
import { useEditTaskForm } from "@/components/hooks/use-edit-task-form"
import { Button } from "@/components/ui/button"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { ProjectIcon } from "@/components/ui/project-icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagSelector } from "@/components/ui/tag-selector"
import { Textarea } from "@/components/ui/textarea"
import { Project } from "@/lib/api/projects"
import { deleteMission, updateTask, getMissions, addMission as apiAddMission, updateMission as apiUpdateMission } from "@/lib/api/tasks"
import { AnimatePresence } from "framer-motion"
import { ArrowUpRight, ListTodo, Pencil, X } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

const globalMissionsCache: Record<number, {id: number, name: string}[]> = {}

interface TaskToEdit {
  id: number
  title: string
  summary?: string
  description?: string
  status: Status
  priority?: Priority
  deadline: Date | string
  tagIds: number[]
  missions?: { id: number, name: string }[]
  projectId: number

}

interface Props {
  task: TaskToEdit
  isOpen: boolean
  onClose: () => void
  projects: Project[]
  onTaskUpdated?: () => void

}

export const EditTaskForm = ({
  task,
  isOpen,
  onClose,
  projects,
  onTaskUpdated
}: Props) => {

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingStep, setSubmittingStep] = useState('')
  const [fetchedInitialMissions, setFetchedInitialMissions] = useState<{id: number, name: string}[]>(globalMissionsCache[task.id] || [])


  // Map the task to the exact shape the hook expects
  const initialValues = {
    id: task.id,
    title: task.title,
    summary: task.summary || '',
    description: task.description || '',
    status: task.status,
    priority: task.priority || 'medium',
    deadline: new Date(task.deadline),
    tagIds: task.tagIds,
    missions: task.missions?.map(m => ({ id: m.id, name: m.name })) ?? globalMissionsCache[task.id] ?? [],
    projectId: task.projectId,
  }

  const {
    title, setTitle,
    summary, setSummary,
    description, setDescription,
    status, setStatus,
    priority, setPriority,
    date, setDate,
    selectedTagIds, setSelectedTagIds,
    missions, setMissions,
    projectId, setProjectId,
    formattedDeadline,
    addMission,
    updateMission,
    removeMission,
    resetForm,
  } = useEditTaskForm(initialValues)

  useEffect(() => {
    if (isOpen) {
      if (globalMissionsCache[task.id]) {
        setMissions(globalMissionsCache[task.id])
        setFetchedInitialMissions(globalMissionsCache[task.id])
      }
      
      getMissions(task.id).then((serverMissions) => {
        const formatted = serverMissions.map(m => ({ id: m.id, name: m.name }))
        globalMissionsCache[task.id] = formatted
        setMissions(formatted)
        setFetchedInitialMissions(formatted)
      }).catch(console.error)
    }
  }, [isOpen, task.id, setMissions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectId) return toast.error("Please select a project workspace")

    if (!title.trim() || title.length < 3) return toast.error("Task title must be at least 3 characters")

    if (!projects) return toast.error("Please select a project")

    setIsSubmitting(true)
    setSubmittingStep('Updating task...')

    try {

      // Update tha main task
      await updateTask(task.id, {
        title: title.trim(),
        summary: summary.trim() || undefined,
        description: description.trim() || undefined,
        status,
        priority,
        deadline: date || new Date(),
        tagIds: selectedTagIds,
        projectId: projectId,
      })

      // Sync misison get current missino IDs
      const currentMissionIds = missions.map(m => m.id)
      const initialMissionIds = fetchedInitialMissions.map(m => m.id)
      const deletedMissionIds = initialMissionIds.filter(id => !currentMissionIds.includes(id))

      // Loop throgh the deleted IDs and remove them 
      for (const missionId of deletedMissionIds) {
        setSubmittingStep(`Deleting mission ${deletedMissionIds.indexOf(missionId) + 1} of ${deletedMissionIds.length}...`)
        await deleteMission(task.id, missionId)
      }

      // if there's no id then create it else update it if there's a change on name by the user

      // Add new mission
      for (let m = 0; m < missions.length; m++) {
        setSubmittingStep(`Saving mission ${m + 1} of ${missions.length}...`)

        const mission = missions[m]
        if (!initialMissionIds.includes(mission.id)) {
          await apiAddMission(task.id, mission.name)

        } else {
          // Existing mission update if the name changed
          const original = fetchedInitialMissions.find(m => m.id === mission.id)

          if (original && original.name !== mission.name) {
            await apiUpdateMission(task.id, mission.id, { name: mission.name })
          }
        }
      }

      globalMissionsCache[task.id] = missions.map(m => ({ id: m.id, name: m.name }))
      toast.success("Task updated successfully!")
      resetForm()
      onClose()
      onTaskUpdated?.()

    } catch (error) {
      console.error(error)
      toast.error("Could not update task. Please try again.")
    } finally {

      setIsSubmitting(false)
      setSubmittingStep('')
    }
  }

   return (
    <FormModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" >
      <AnimatePresence>
        {isSubmitting &&
          <LoadingOverlay message={submittingStep} subMessage="Creating your task workspace." />}
      </AnimatePresence>

      <div className="relative flex flex-col h-full w-full">
        {/* Premium Gradient Accent */}
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/20 px-6 py-5 shrink-0 bg-muted/5">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-indigo-500" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">Edit Task</h2>
          </div>
          <Button
            type="button"
            variant={'ghost'}
            size={'icon'}
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 uppercase">
                  <span>01</span> Core Info
                </h3>

                {/* Task name */}
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
                    className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <Label htmlFor="summary" className="text-xs font-semibold tracking-wide text-foreground/80">
                    Brief Summary
                  </Label>
                  <Input
                    type="text"
                    name="summary"
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="A quick overview (optional)"
                    className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold tracking-wide text-foreground/80">
                    Description & Notes
                  </Label>
                  <Textarea
                    name="description"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write clear instructions, links, or context..."
                    rows={4}
                    className="bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50 resize-none"
                  />
                </div>

                {/* Project picker */}
                <div className="space-y-1.5">
                  <Label htmlFor="project" className="text-xs font-semibold tracking-wide text-foreground/80">
                    Project & Workspace <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={String(projectId)} onValueChange={(val) => setProjectId(Number(val))}>
                    <SelectTrigger className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 rounded-xl">
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

              {/* Subtasks (Missions) */}
              <div className="space-y-4 pt-4 border-t border-border/20">
                <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 uppercase">
                  <span>02</span> Missions & Subtasks
                </h3>
                <div className="space-y-1.5 rounded-xl border border-border/20 bg-muted/10 p-4">
                  <Label className="text-xs font-semibold tracking-wide text-foreground/80 mb-2 block">
                    Break it down into smaller steps
                  </Label>
                  <SubtaskEditor
                    items={missions}
                    onAdd={addMission}
                    onUpdate={updateMission}
                    onRemove={removeMission}
                    placeholder="Add a new mission..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Parameters & Goals */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 uppercase">
                <span>03</span> Parameters & Goals
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold tracking-wide text-foreground/80">
                  Status
                </Label>
                <StatusSelector value={status} onChange={setStatus} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline" className="text-xs font-semibold tracking-wide text-foreground/80">
                  Due Date
                </Label>
                <CustomDatePicker date={date} onChange={setDate} placeholder="Select deadline" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-xs font-semibold tracking-wide text-foreground/80">
                  Task Priority
                </Label>
                <PrioritySelector value={priority} onChange={setPriority} />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-wide text-foreground/80">
                  Tags Classification
                </Label>
                <div className="rounded-xl border border-border/20 bg-muted/10 p-2.5">
                  <TagSelector
                    selectedTagIds={selectedTagIds}
                    compact={true}
                    noIcon={true}
                    onChange={setSelectedTagIds}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border/20 pt-6 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant={'outline'}
              onClick={onClose}
              className="rounded-xl border-border/40 hover:bg-muted/40 h-10 px-5 text-xs font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 h-10 px-6 text-xs flex items-center gap-1.5 transition-all"
            >
              <span>{isSubmitting ? "Updating..." : 'Update Task'}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </FormModal>
  )
}
