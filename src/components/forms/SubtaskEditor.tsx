'use client'

import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Plus, Trash2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export interface Subtask {
  id: number
  name: string
}

interface SubtaskEditorProps {
  items: Subtask[]
  onAdd: (name: string, id: number) => void
  onUpdate: (id: number, name: string) => void
  onRemove: (id: number) => void
  placeholder?: string 
}


export const SubtaskEditor = ({items, onAdd, onUpdate, onRemove, placeholder}: SubtaskEditorProps) => {

  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const trimmedValue = inputValue.trim()
    if(!trimmedValue) return 
    onAdd(trimmedValue, Date.now())
    setInputValue('')
  }

  return (
    <div className="space-y-2 ">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="h-8 bg-muted/20 border-border/40 rounded-xl placeholder:text-muted-foreground/45" 
        />
        <Button 
          type="button"
          size={'sm'}
          onClick={handleAdd}
          className="h-8 px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 shrink-0 "
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="max-h-[140px] overflow-auto space-y-1 pr-1">
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x:10, height:0 }}
              animate= {{ opacity: 1, x:0, height:'auto'  }}
              exit={{ opacity: 0, x:10, height:0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              >
                <div className="flex items-center gap-2 group p-1.5 bg-muted/10 border border-border/20 rounded-lg hover:border-border/40 transition-colors">
                  <span className="text-[9px] font-semibold text-muted-foreground/60 w-4 text-center">
                    {index +1}
                  </span>
                  <Input
                    type="text"
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs focus:ring-0 focus:outline-none py-0 px-1 font-medium"
                  />
                  <Button
                    type="button"
                    variant={'ghost'}
                    size={'icon'}
                    onClick={() => onRemove(item.id)}
                    className="h-5 w-5 text-muted-foreground/40 hover:text-rose-500 rounded-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity:"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 &&(
          <p className="text-center text-[11px] text-muted-foreground/60 py-3 italic border border-dashed border-border/20 rounded-lg bg-muted/5">
            No missions yet.
          </p>
        )}
      </div>
    </div>
  )
}