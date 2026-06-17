'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"


interface FilterSortRowProps {
  //Search 
  searchQuery: string
  onSearchChange: (query: string) => void

  //Filters
  priorityFilter: string | null
  onPriorityChange: (priority: string | null) => void
  assigneeFilter: string | null
  onAssigneeChange: (assignee: string | null) => void
  projectFilter: string | null
  onProjectChange: (project: string | null) => void

  //Sort
  sortBy: string
  onSortChange: (sort: string) => void

  // Data for dropdown options
  assignees: { id: number, name: string }[]
  projects: { id: number, name: string }[]
  priorities: string[]
  sortOptions: { value: string, label: string }[]

}


const FilterSortRow = ({
  searchQuery,
  onSearchChange,
  assigneeFilter,
  onAssigneeChange,
  projectFilter,
  onProjectChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  assignees,
  projects,
  priorities,
  sortOptions,
}: FilterSortRowProps) => {

  return (
    <div className="flex w-full flex-wrap items-center gap-3 px-1 py-3">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[180px] flex">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 py-6"
          />
        </div>

        {/* Priority Filter */}
        <Select
          value={priorityFilter ?? 'all'}
          onValueChange={(value) => onPriorityChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[140px] py-6">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {priorities.map((p) => (
              <SelectItem key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Project Filter */}
        <Select
          value={projectFilter?.toString() ?? 'all'}
          onValueChange={(value) => onProjectChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[160px] py-6">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select
          value={assigneeFilter?.toString() ?? 'all'}
          onValueChange={(value) => onAssigneeChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[150px] py-6">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {assignees.map((a) => (
              <SelectItem key={a.id} value={a.id.toString()}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Active filters count */}
        {(assigneeFilter || projectFilter || priorityFilter) && (
          <Button
            onClick={() => {
              onAssigneeChange(null)
              onProjectChange(null)
              onPriorityChange(null)
            }}
            variant={'destructive'}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
      
      {/* Sort */}
      {sortBy && (
          <Button
            onClick={() => onSortChange('')}
            variant={'destructive'}
            >
            <X className="h-4 w-4" />
            Clear sort
          </Button>
        )}
      <div className="ml-auto flex items-center">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px] py-6">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        
      </div>
    </div>
    
  )
}




export default FilterSortRow;