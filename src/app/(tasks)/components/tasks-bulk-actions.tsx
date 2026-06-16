'use client'

import { Task } from '@/lib/api/tasks'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Trash2, X } from 'lucide-react'

interface TasksBulkActionsProps {
  selectedCount: number
  onBulkStatusChange: (newStatus: Task['status']) => void | Promise<void>
  onBulkDelete: () => void | Promise<void>
  onClearSelection: () => void
}

export const TasksBulkActions = ({
  selectedCount,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection,
}: TasksBulkActionsProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/90 dark:bg-card/85 backdrop-blur-xl border border-border/40 px-4 py-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-5 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold border border-primary/20 flex items-center justify-center">
            {selectedCount}
          </span>
          <span className="text-xs font-bold text-muted-foreground">selected</span>
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={(val) => onBulkStatusChange(val as Task['status'])}>
            <SelectTrigger className="h-9 px-3 bg-background border-border/50 hover:bg-muted text-xs font-bold text-foreground w-32 rounded-xl">
              <SelectValue placeholder="Set Status" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-xl border-border/40 rounded-xl">
              <SelectItem value="todo">Mark To Do</SelectItem>
              <SelectItem value="in_progress">Mark In Progress</SelectItem>
              <SelectItem value="done">Mark Completed</SelectItem>
              <SelectItem value="delayed">Mark Delayed</SelectItem>
              <SelectItem value="cancelled">Mark Cancelled</SelectItem>
              <SelectItem value="overdue">Mark Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-xs font-bold text-red-600 hover:bg-red-500/10 hover:text-red-600 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-xl border border-border/40 shadow-2xl p-0 gap-0 overflow-hidden rounded-xl">
              <div className="h-1.5 bg-linear-to-r from-red-500 to-rose-500" />
              <div className="p-6 space-y-5">
                <DialogHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/20">
                    <Trash2 className="h-7 w-7 text-destructive" />
                  </div>
                  <DialogTitle className="text-lg font-bold text-foreground">Delete {selectedCount} Tasks?</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                    Are you sure you want to permanently delete the {selectedCount} selected tasks? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2.5 justify-center">
                  <DialogTrigger asChild>
                    <Button variant="outline" className="min-w-24 text-xs h-9 rounded-xl">
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={onBulkDelete}
                      className="min-w-28 text-xs h-9 rounded-xl gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Tasks</span>
                    </Button>
                  </DialogTrigger>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="h-5 w-px bg-border/40 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
