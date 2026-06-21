'use client'

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"


export type Status = 'todo' | 'in_progress' | 'done' | 'delayed' | 'cancelled'

interface StatusSelectorProps {
  value: Status
  onChange: (status: Status) => void
}

const statuses: {value:Status; label: string; dot:string; ringColor: string} [] = [
  {value: 'todo', label:'To Do', dot: 'bg-blue-500', ringColor: 'ring-blue-500/30'},
  {value: 'in_progress', label: 'In Progress', dot: 'bg-amber-500', ringColor: 'ring-amber-500/30'},
  {value: 'done', label:'Done', dot: 'bg-emerald-500', ringColor: 'ring-emerald-500/30'},
  {value: 'delayed', label:'Delayed', dot: 'bg-slate-400', ringColor: 'ring-slate-400/30'},
  {value: 'cancelled', label:'Cancelled', dot: 'bg-rose-500', ringColor: 'ring-rose-500/30'},
]

export const StatusSelector = ({value, onChange}: StatusSelectorProps) => {

  return (
    <Select value={value} onValueChange={(val) => onChange(val as Status)}>
      <SelectTrigger className="h-10 px-4 min-w-[140px] bg-muted/20 border-border/40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 rounded-xl transition-all">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-border/60">
        {statuses.map((s) =>(
          <SelectItem key={s.value} value={s.value} className="rounded-lg py-2">
            <div className="flex items-center gap-2.5">
              <span className={cn('h-2 w-2 rounded-full transition-all duration-300 ml-1 shrink-0', s.dot, value === s.value ? `ring-[3px] ${s.ringColor}` : 'ring-0')} />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}