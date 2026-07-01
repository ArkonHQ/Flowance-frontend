import { FormLayout } from "@/components/forms/FormLayout"
import { PrioritySelector } from "@/components/forms/PrioritySelector"
import { StatusSelector } from "@/components/forms/StatusSelector"
import { SubtaskEditor, Subtask } from "@/components/forms/SubtaskEditor"
import { useAppForm } from "@/components/hooks/use-app-form"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProjectIcon } from "@/components/ui/project-icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagSelector } from "@/components/ui/tag-selector"
import { Textarea } from "@/components/ui/textarea"
import { Project } from "@/lib/api/projects"
import { createTask, addMission as apiAddMission, Task } from "@/lib/api/tasks"
import { ListTodo } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface TaskFormProps {
  projects: Project[]
  onClose: () => void
  isOpen: boolean
  onTaskCreated?: (task: Task) => void
}

export const TaskForm = ({ projects, isOpen, onClose, onTaskCreated }: TaskFormProps) => {

  const { values, setFieldValue, setValues, resetForm } = useAppForm({
    title: '',
    summary: '',
    description: '',
    projectId: '',
    status: 'todo' as 'todo' | 'in_progress' | 'done' | 'delayed' | 'cancelled',
    priority: 'medium' as 'low' | 'medium' | 'high',
    selectedTagIds: [] as number[],
    missions: [] as Subtask[],
    date: new Date() as Date | undefined,
  })

  const { title, summary, description, projectId, status, priority, selectedTagIds, missions, date } = values

  const addMission = (name: string, id: number) => {
    setValues(prev => ({ ...prev, missions: [...prev.missions, { id, name, completed: false }] }))
  }
  const updateMission = (id: number, name: string) => {
    setValues(prev => ({ ...prev, missions: prev.missions.map(m => m.id === id ? { ...m, name } : m) }))
  }
  const removeMission = (id: number) => {
    setValues(prev => ({ ...prev, missions: prev.missions.filter(m => m.id !== id) }))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingStep, setSubmittingStep] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projects) return toast.error("Please select a project")
    if (!title.trim()) return toast.error("Type a name for your task")
    if (!projectId) return toast.error("Please select a project workspace!")

    try {
      setIsSubmitting(true)
      setSubmittingStep("Creating your task...")

      const taskObj = await createTask({
        title: title.trim(),
        summary: summary.trim() || undefined,
        description: description.trim() || undefined,
        status,
        priority,
        deadline: date || new Date(),
        tagIds: selectedTagIds,
        projectId: Number(projectId)
      })

      if (missions.length > 0) {
        for (let m = 0; m < missions.length; m++) {
          setSubmittingStep(`Adding mission ${m + 1} of ${missions.length}...`)
          const missionName = missions[m].name.trim()
          if (missionName) await apiAddMission(taskObj.id, missionName)
        }
      }

      setSubmittingStep("Task created successfully!")
      resetForm()
      onClose()
      onTaskCreated?.(taskObj)

    } catch (err) {
      console.error(err)
      toast.error("Could not save. Please try again.")
    } finally {
      setSubmittingStep('')
      setIsSubmitting(false)
    }
  }

  const leftCol = (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 uppercase">
        <span>01</span> Core Info
      </h3>
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-semibold tracking-wide text-foreground/80">
          Task Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="title" name="title" type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setFieldValue('title', e.target.value)}
          required
          className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="summary" className="text-xs font-semibold tracking-wide text-foreground/80">Brief Summary</Label>
        <Input
          type="text" name="summary" id="summary"
          value={summary}
          onChange={(e) => setFieldValue('summary', e.target.value)}
          placeholder="A quick overview (optional)"
          className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
        />
      </div>
      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-semibold tracking-wide text-foreground/80">Description & Notes</Label>
        <Textarea
          name="description" id="description"
          value={description}
          onChange={(e) => setFieldValue('description', e.target.value)}
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
        <Select value={String(projectId)} onValueChange={(val) => setFieldValue('projectId', val)}>
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
      <div className="space-y-4 pt-4 border-t border-border/20">
        <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 uppercase">
          <span>02</span> Missions & Subtasks
        </h3>
        <div className="space-y-1.5 rounded-xl border border-border/20 bg-muted/10 p-4">
          <Label className="text-xs font-semibold tracking-wide text-foreground/80 mb-2 block">
            Break it down into smaller steps
          </Label>
          <SubtaskEditor
            items={missions} onAdd={addMission} onUpdate={updateMission}
            onRemove={removeMission} placeholder="Add a new mission..."
          />
        </div>
      </div>
    </div>
  )

  const rightCol = (
    <div className="space-y-6">
      <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 uppercase">
        <span>03</span> Parameters & Goals
      </h3>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold tracking-wide text-foreground/80">Status</Label>
        <StatusSelector value={status} onChange={(v) => setFieldValue('status', v)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold tracking-wide text-foreground/80">Due Date</Label>
        <CustomDatePicker date={date} onChange={(v) => setFieldValue('date', v)} placeholder="Select deadline" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold tracking-wide text-foreground/80">Task Priority</Label>
        <PrioritySelector value={priority} onChange={(v) => setFieldValue('priority', v)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold tracking-wide text-foreground/80">Tags Classification</Label>
        <div className="rounded-xl border border-border/20 bg-muted/10 p-2.5">
          <TagSelector
            selectedTagIds={selectedTagIds} compact={true} noIcon={true}
            onChange={(v) => setFieldValue('selectedTagIds', v)}
          />
        </div>
      </div>
    </div>
  )

  return (
    <FormLayout
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      loadingMessage={submittingStep}
      loadingSubMessage="Creating your task workspace."
      title="Create New Task"
      icon={<ListTodo className="h-5 w-5" />}
      submitLabel="Create Task"
      leftColumn={leftCol}
      rightColumn={rightCol}
    />
  )
}
