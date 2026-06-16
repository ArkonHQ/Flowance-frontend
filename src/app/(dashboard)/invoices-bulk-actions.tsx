'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Trash2, X, FileText, SendHorizontal, CheckCircle2 } from 'lucide-react'

interface InvoicesBulkActionsProps {
  selectedCount: number
  onBulkStatusChange: (newStatus: string) => void | Promise<void>
  onBulkDelete: () => void | Promise<void>
  onClearSelection: () => void
}

export const InvoicesBulkActions = ({
  selectedCount,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection,
}: InvoicesBulkActionsProps) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-fit max-w-[95vw] animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out">
      <div className="bg-background/95 backdrop-blur-2xl border border-border px-5 py-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-4 text-foreground">
        <div className="flex items-center gap-3 pr-4 border-r border-border">
          <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/20">
            {selectedCount}
          </div>
          <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Selected</span>
        </div>

        <div className="flex items-center gap-3">
          <Select onValueChange={onBulkStatusChange}>
            <SelectTrigger className="h-9 px-3 bg-muted/50 border-border hover:bg-muted text-xs font-semibold text-foreground w-40 rounded-xl transition-all focus:ring-0 border-none ring-offset-0">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <SelectValue placeholder="Update Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
              <SelectItem value="draft">
                <div className="flex items-center gap-2">Mark as Draft</div>
              </SelectItem>
              <SelectItem value="sent">
                <div className="flex items-center gap-2 text-blue-500 font-medium">Mark as Sent</div>
              </SelectItem>
              <SelectItem value="paid">
                <div className="flex items-center gap-2 text-emerald-500 font-medium">Mark as Paid</div>
              </SelectItem>
              <SelectItem value="overdue">
                <div className="flex items-center gap-2 text-rose-500 font-medium">Mark as Overdue</div>
              </SelectItem>
              <SelectItem value="voided">Mark as Voided</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background border-border shadow-2xl p-0 gap-0 overflow-hidden rounded-2xl">
              <div className="h-1.5 bg-destructive" />
              <div className="p-6 space-y-5">
                <DialogHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/5">
                    <Trash2 className="h-7 w-7 text-destructive" />
                  </div>
                  <DialogTitle className="text-xl font-bold">Delete {selectedCount} Invoices?</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                    Are you sure you want to permanently delete these {selectedCount} invoices? This will also remove associated payment records.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 justify-center">
                  <DialogTrigger asChild>
                    <Button variant="outline" className="min-w-28 text-xs h-10 rounded-xl">Cancel</Button>
                  </DialogTrigger>
                  <DialogTrigger asChild>
                    <Button variant="destructive" onClick={onBulkDelete} className="min-w-32 text-xs h-10 rounded-xl gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Invoices</span>
                    </Button>
                  </DialogTrigger>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="h-6 w-px bg-border mx-1" />

          <Button variant="ghost" size="icon" onClick={onClearSelection} className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}