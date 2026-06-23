'use client'

import { useCallback, useState } from "react"
import { Priority } from "../forms/PrioritySelector"
import { Status } from "../forms/StatusSelector"
import { Subtask } from "../forms/SubtaskEditor"
import { format } from "date-fns"



interface UseTaskFormOptions {
  initTitle?: string
  initSummary?: string
  initDescription?: string
  initProjectId?: string
  initStatus?: Status
  initPriority?: Priority
  initTagIds?: number[]
  initMissions?: Subtask[]
  initDate?: Date
}

export const useTaskFormState = (options: UseTaskFormOptions = {}) => {
  
  const {
  initTitle = '',
  initSummary = '',
  initDescription = '',
  initProjectId = '',
  initStatus = 'todo',
  initPriority = 'medium',
  initTagIds = [],
  initMissions = [],
  initDate = new Date(),
} = options


  const [title, setTitle] = useState(initTitle)
  const [summary, setSummary] = useState(initSummary)
  const [description, setDescription] = useState(initDescription)
  const [projectId, setProjectId] = useState(initProjectId)
  const [status, setStatus] = useState<Status>(initStatus)
  const [priority, setPriority] = useState<Priority>(initPriority)
  const [missions, setMissions] = useState<Subtask[]>(initMissions)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initTagIds)
  const [date, setDate] = useState<Date | undefined>(initDate)

  const formattedDeadline = date ? format(date, 'yyyy-MM-dd') : ''


  const addMission = useCallback((name:string, id:number) => {
    const newMission: Subtask = {
      id,
      name,
    }
    setMissions((prev) => [...prev, newMission])
  }, [])

  const updateMission = useCallback((id:number, name: string) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? {...m, name} : m )))
  }, [])

  const removeMission = useCallback((id: number) => {
    setMissions((prev) => prev.filter((m) => m.id !== id))
  }, [])


  const resetForm = useCallback(() => {
    setTitle(initTitle)
    setSummary(initSummary)
    setDescription(initDescription)
    setProjectId(initProjectId)
    setStatus(initStatus)
    setPriority(initPriority)
    setMissions(initMissions)
    setSelectedTagIds(initTagIds)
    setDate(initDate)
  }, [initDate, initDescription, initPriority, initProjectId, initSummary, initStatus, initTagIds, initTitle])

    return {

    // values
    title,
    summary,
    description,
    projectId,
    status,
    priority,
    selectedTagIds,
    missions,
    date,
    formattedDeadline,

    // setters
    setTitle,
    setSummary,
    setDescription,
    setProjectId,
    setStatus,
    setPriority,
    setSelectedTagIds,
    setMissions,
    setDate,

    // mission helpers
    addMission,
    updateMission,
    removeMission,

    // actions
    resetForm,
  }
}