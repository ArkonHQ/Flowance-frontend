'use client'

import { useCallback, useRef, useState } from "react"
import { Priority } from "../forms/PrioritySelector"
import { Status } from "../forms/StatusSelector"
import { Subtask } from "../forms/SubtaskEditor"
import { format } from "date-fns"





interface EditTaskData {
  id: number
  title: string
  summary: string
  description: string
  projectId: number
  tagIds: number[]
  status: Status
  priority: Priority
  missions: Subtask[]
  deadline: Date
}


export const useEditTaskForm = (task: EditTaskData) => {

  const [title, setTitle] = useState(task.title)
  const [summary, setSummary] = useState(task.summary)
  const [description, setDescription] = useState(task.description)
  const [projectId, setProjectId] = useState(task.projectId)
  const [status, setStatus] = useState<Status>(task.status)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(task.tagIds)
  const [missions, setMissions] = useState<Subtask[]>(task.missions || [])
  const [date, setDate] = useState<Date | undefined>(task.deadline)


  const formattedDeadline = date ? format(date, 'yyyy-MM-dd') : ''

  // Generate a negative id for frontend to avoid collision with the server id generator
  const missionCounter = useRef(-1)
  const addMission = useCallback((name: string) => {
    const newMission: Subtask = {
      id: missionCounter.current--,
      name,
      completed: false,
    }
    setMissions((prev) => [...prev, newMission])
  }, [])


  const updateMission = useCallback((id: number, name: string) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? {...m, name} : m) ))
  }, [])


  const removeMission = useCallback((id: number) => {
    setMissions((prev) => prev.filter((m) => m.id !== id))
  }, [])


  const resetForm = useCallback(() => {
    setTitle(task.title)
    setSummary(task.summary)
    setDescription(task.description)
    setStatus(task.status)
    setPriority(task.priority)
    setProjectId(task.projectId)
    setSelectedTagIds(task.tagIds)
    setMissions(task.missions || [])
    setDate(task.deadline)
  }, [task])


  return {
    title, setTitle,
    summary, setSummary,
    description, setDescription,
    projectId, setProjectId,
    status, setStatus,
    priority, setPriority,
    selectedTagIds, setSelectedTagIds,
    missions, setMissions,
    date, setDate,
    formattedDeadline,
    addMission,
    updateMission,
    removeMission,
    resetForm,
  }
}