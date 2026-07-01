'use client'

import { FormLayout } from "@/components/forms/FormLayout"
import { useAppForm } from "@/components/hooks/use-app-form"
import { CustomDatePicker } from "@/components/ui/custom-date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagSelector } from "@/components/ui/tag-selector"
import { Textarea } from "@/components/ui/textarea"
import { Client } from "@/lib/api/clients"
import { createProject, updateProject, Project } from "@/lib/api/projects"
import { Briefcase } from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProjectFormProps {
  clients: Client[]
  isOpen: boolean
  onClose: () => void
  onProjectCreated?: (project: Project) => void
  onProjectUpdated?: (project: Project) => void
  initialData?: Project | null
}

const statuses: { value: string; label: string; dot: string; ringColor: string }[] = [
  { value: 'planning', label: 'Planning', dot: 'bg-slate-500', ringColor: 'ring-slate-500/30' },
  { value: 'active', label: 'Active', dot: 'bg-blue-500', ringColor: 'ring-blue-500/30' },
  { value: 'completed', label: 'Completed', dot: 'bg-emerald-500', ringColor: 'ring-emerald-500/30' },
  { value: 'on_hold', label: 'On Hold', dot: 'bg-amber-400', ringColor: 'ring-amber-400/30' },
  { value: 'cancelled', label: 'Cancelled', dot: 'bg-rose-500', ringColor: 'ring-rose-500/30' },
]

export const ProjectForm = ({ clients, isOpen, onClose, onProjectCreated, onProjectUpdated, initialData }: ProjectFormProps) => {
  const router = useRouter()

  const { values, setFieldValue, resetForm, setValues } = useAppForm({
    title: initialData?.title || '',
    description: initialData?.description || '',
    clientId: initialData?.clientId ? String(initialData.clientId) : '',
    status: (initialData?.status as 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled') || 'planning',
    budget: initialData?.budget ? String(initialData.budget) : '',
    date: initialData?.deadline ? new Date(initialData.deadline) : (new Date() as Date | undefined),
    selectedTagIds: initialData?.tags?.map(t => t.id) || ([] as number[])
  })



  const { title, description, clientId, status, budget, date, selectedTagIds } = values

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingStep, setSubmittingStep] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || title.length < 3) return toast.error("Title must be at least 3 characters")
    if (!clientId) return toast.error("Please select a client")
    if (!status) return toast.error("Please select a valid project status")

    try {
      setIsSubmitting(true)
      setSubmittingStep(initialData ? "Updating project details..." : "Creating project workspace...")

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        clientId: Number(clientId),
        status: status as 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled',
        budget: budget ? Number(budget) : 0,
        deadline: date || new Date(),
        tagIds: selectedTagIds
      }

      let projectObj: Project;

      if (initialData) {
        projectObj = await updateProject(initialData.id, payload)
        setSubmittingStep("Project updated successfully!")
      } else {
        projectObj = await createProject(payload)
        setSubmittingStep("Project created successfully!")
      }

      resetForm()
      onClose()

      if (initialData && onProjectUpdated) {
        onProjectUpdated(projectObj)
      } else if (!initialData && onProjectCreated) {
        onProjectCreated(projectObj)
      } else {
        router.refresh()
      }

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Could not save project. Please try again.")
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
          Project Title <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Website Redesign"
          value={title}
          onChange={(e) => setFieldValue('title', e.target.value)}
          required
          className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-semibold tracking-wide text-foreground/80">
          Description (Optional)
        </Label>
        <Textarea
          name="description"
          id="description"
          value={description}
          onChange={(e) => setFieldValue('description', e.target.value)}
          placeholder="Write brief description..."
          rows={3}
          className="bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="client" className="text-xs font-semibold tracking-wide text-foreground/80" defaultValue={Number(clientId)}>
          Client <span className="text-rose-500">*</span>
        </Label>
        <Select value={String(clientId)} onValueChange={(val) => setFieldValue('clientId', val)}>
          <SelectTrigger className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 rounded-xl">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            {clients.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} className="rounded-lg py-2">
                <span className="font-medium text-sm">{c.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="budget" className="text-xs font-semibold tracking-wide text-foreground/80">
          Budget ($)
        </Label>
        <Input
          id="budget"
          name="budget"
          type="number"
          placeholder="e.g. 5000"
          value={budget}
          onChange={(e) => setFieldValue('budget', e.target.value)}
          className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  )

  const rightCol = (
    <div className="space-y-6">
      <h3 className="text-[10px] font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 uppercase">
        <span>02</span> Parameters &amp; Goals
      </h3>

      <div className="space-y-1.5">
        <Label htmlFor="status" className="text-xs font-semibold tracking-wide text-foreground/80">
          Status
        </Label>
        <Select value={status} onValueChange={(val: any) => setFieldValue('status', val)}>
          <SelectTrigger className="h-10 bg-muted/20 border-border/40 focus:border-indigo-500/60 rounded-xl">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value} defaultValue={status}>
                <span className={cn('h-2 w-2 rounded-full transition-all duration-300 ml-1 shrink-0', s.dot, status === s.value ? `ring-[3px] ${s.ringColor}` : 'ring-0')} />
                <span className='text-xs font-medium'>{s.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deadline" className="text-xs font-semibold tracking-wide text-foreground/80">
          Deadline
        </Label>
        <CustomDatePicker date={date} onChange={(v) => setFieldValue('date', v)} placeholder="Select deadline" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold tracking-wide text-foreground/80">
          Tags Classification
        </Label>
        <div className="rounded-xl border border-border/20 bg-muted/10 p-2.5">
          <TagSelector
            selectedTagIds={selectedTagIds}
            compact={true}
            iconOnly={true}
            maxTags={1}
            existTitle="Select an Icon"
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
      loadingSubMessage={initialData ? "Saving your changes." : "Setting up your new workspace."}
      title={initialData ? "Edit Project" : "Create New Project"}
      icon={<Briefcase className="h-5 w-5" />}
      submitLabel={initialData ? "Save Changes" : "Create Project"}
      leftColumn={leftCol}
      rightColumn={rightCol}
    />
  )
}