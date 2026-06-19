'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Check, Edit2, Trash2 } from "lucide-react"
import { useState } from "react"



interface MissionProps {
  taskId: number
  name: string
  id: number
  completedById: number | null
  assigneeId: number | null
  completed: boolean
  completedAt: Date | null,
  createdAt: Date,

  onToggle: (missionId: number, completed: boolean) => void 
  onDelete: (missionId: number) => Promise<void> | void
  onEdit?: (missionId: number, newName: string) => Promise<void> | void
  isLoading?: boolean
}


export const MissionItem = ({
  id,
  taskId,
  completedById,
  assigneeId,
  completed,
  name,
  completedAt,
  isLoading,
  onDelete,
  onToggle,
  onEdit
}: MissionProps) =>{

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [isloading, setIsLoading] = useState(false)

  const  handleToggle = async () => {
    setIsLoading(true)

    try{
    
      await onToggle(id, !completed)

    }finally{
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if(!confirm('Delete this mission')) return
    setIsLoading(true)

    try{
      await onDelete(id)
    }finally{
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!onEdit || !editName.trim()) return
    setIsLoading(true)

    try{

      await onEdit(id, editName.trim())
      setIsEditing(false)

    }finally{
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 group py-1">
      <Checkbox
        checked={completed}
        onCheckedChange={handleToggle}
        disabled={isloading}
        className={'shrink-0'}
          />

        {isEditing ? (
          <div className="flex flex-1 gap-2">
            <Input
              type='text'
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              className="flex-1 text-sm border rounded px-2 py-1"
              autoFocus
            />
            <Button 
              size='sm'
              onClick={handleEdit}
              disabled={isloading}
              >
                Save
              </Button>
          </div>
        ): (
          <>
            <span className={`text-sm flex-1 ${completed ? 'line-through text-muted-foreground' : ""}`}>
              {name}
            </span>

            {/* show who completed it  */}
            {completed && completedById && (
              <span className="text-xs text-muted-foreground"><Check size={'xs'} /> by user {completedById}</span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

              {onEdit && (
                <Button
                  size={'icon'}
                  variant={'ghost'}
                  className="h-6 w-6"
                  onClick={() => setIsEditing(true)}
                  disabled={isloading}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
              )}
              <Button 
                size={'icon'}
                variant={'ghost'}
                className="h-6 w-6"
                onClick={handleDelete}
                disabled={isloading}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
                </Button>
            </div>
          </> 
        )}
    </div>
  )

}