'use client'

import { Invoice } from "@/lib/api/invoices"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Pencil, FileDown, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import DeleteButton from "./DeleteButton"
import { cn } from "@/lib/utils"
import Link from "next/link"




interface InvoicesRowProps {
  invoice: Invoice
  isSelected: boolean
  onDelete: (id: number) => void
  onToggle: (id: number) => void
  clientName: string
  projectName: string
}

const getStatusColors = (status: string) => {
  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100/80 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800',
    paid: 'bg-emerald-100/80 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    cancelled: 'bg-rose-100/80 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    sent: 'bg-sky-100/80 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    overdue: 'bg-amber-100/80 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    partially_paid: 'bg-violet-100/80 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800'
  }
  return statusColors[status] || statusColors.overdue
}

const formatDate = (date: string | Date | undefined | null) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}


export const InvoicesRow = ({ invoice, onDelete, onToggle, isSelected, clientName, projectName }: InvoicesRowProps) => {

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const displayStatus = (invoice.status || 'draft').replace(/_/g, ' ')

  return (
    <div className={cn(
      "grid grid-cols-15 gap-4 items-center px-5 py-4 backdrop-blur-sm rounded-xl border transition-all duration-200 group",
      isSelected
        ? "bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/20"
        : "bg-card/40 border-border/40 shadow-sm hover:shadow-md hover:border-border/80 hover:bg-card/60"
    )}>
      {/* Checkbox columns */}
      <div className="col-span-1 flex items-center justify-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(invoice.id)}
          aria-label={`Select invoice ${invoice.id}`}
        />
      </div>

      {/* Invoice columns */}
      <div className="col-span-1 flex items-center justify-center text-sm font-bold text-primary/80 group-hover:text-primary transition-colors">
        #{invoice.id}
      </div>

      {/* Client name column */}
      <div className="col-span-2 flex items-center justify-start text-sm font-medium truncate">
        <Link href={`/clients/${invoice.clientId}`} className="hover:underline hover:text-primary transition-colors cursor-pointer">
          {clientName}
        </Link>
      </div>

      {/* Project name columns */}
      <div className="col-span-2 flex items-center justify-start text-sm text-muted-foreground truncate">
        <Link href={`/projects/${invoice.projectId}`} className="hover:underline hover:text-primary transition-colors cursor-pointer">
          {projectName}
        </Link>
      </div>

      {/* Invoice date column */}
      <div className="col-span-2 flex items-center justify-center text-sm text-muted-foreground">
        {formatDate(invoice.createdAt)}
      </div>

      {/* Invoice duedate column */}
      <div className="col-span-2 flex items-center justify-center text-sm text-muted-foreground">
        {formatDate(invoice.dueDate)}
      </div>

      {/* Invoice Amount column */}
      <div className="col-span-2 flex items-center justify-center text-sm font-bold">
        ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>

      {/* Invoice status column */}
      <div className="col-span-2 flex items-center justify-center">
        <Badge variant="outline" className={getStatusColors(invoice.status)}>
          {displayStatus}
        </Badge>
      </div>

      {/* Action column */}
      <div className="col-span-1 flex justify-end">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                'h-8 w-8 rounded-full',
                isOpen ? 'bg-gray-200 text-indigo-600' : 'text-gray-400'
              )}
              variant="ghost"
              size="icon"
            >
              <MoreHorizontal
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen ? 'rotate-0 text-indigo-600' : 'rotate-90 text-gray-400'
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${invoice.id}`} className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${invoice.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit invoice
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${invoice.id}/download`} className="flex items-center gap-2 cursor-pointer">
                <FileDown className="h-4 w-4" />
                Download PDF
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteButton
              invoiceId={invoice.id}
              invoiceName={`Invoice ${invoice.id}`}
              onDeleted={() => onDelete(invoice.id)}
              redirectAfterDelete={false}
            />
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  )
}