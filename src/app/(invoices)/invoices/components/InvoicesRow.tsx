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

interface StatusConfig {
  badge: string
}

const getStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    draft: {
      badge: 'bg-slate-50 text-slate-700 border-slate-200/80 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800/40',
    },
    paid: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40',
    },
    cancelled: {
      badge: 'bg-slate-100/50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-550 dark:border-slate-800/40',
    },
    sent: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/40',
    },
    overdue: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/40',
    },
    partially_paid: {
      badge: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/40',
    }
  }
  return configs[status] || configs.draft
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
  
  const displayStatus = (invoice.status || 'draft')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const statusConfig = getStatusConfig(invoice.status)
  
  const formattedId = `INV-2026-${String(invoice.id).padStart(4, '0')}`

  const dropdownTrigger = (
    <Button
      className={cn(
        'h-8 w-8 rounded-full transition-colors duration-200',
        isOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
      variant="ghost"
      size="icon"
      id={`invoice-row-actions-${invoice.id}`}
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  )

  const dropdownContent = (
    <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-xl border border-border/40 shadow-xl rounded-xl">
      <DropdownMenuItem asChild>
        <Link href={`/invoices/${invoice.id}`} className="flex items-center gap-2.5 py-2 px-3 text-sm rounded-lg hover:bg-muted cursor-pointer transition-colors">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>View details</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`/invoices/${invoice.id}/edit`} className="flex items-center gap-2.5 py-2 px-3 text-sm rounded-lg hover:bg-muted cursor-pointer transition-colors">
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span>Edit invoice</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`/invoices/${invoice.id}/download`} className="flex items-center gap-2.5 py-2 px-3 text-sm rounded-lg hover:bg-muted cursor-pointer transition-colors">
          <FileDown className="h-4 w-4 text-muted-foreground" />
          <span>Download PDF</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="border-border/40" />
      <div className="px-1 py-1">
        <DeleteButton
          invoiceId={invoice.id}
          invoiceName={`Invoice #${invoice.id}`}
          onDeleted={() => onDelete(invoice.id)}
          redirectAfterDelete={false}
        >
          <Button variant="ghost" className="w-full justify-start gap-2.5 py-1.5 px-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 rounded-lg h-auto font-normal">
            <Trash2 className="h-4 w-4" />
            <span>Delete Invoice</span>
          </Button>
        </DeleteButton>
      </div>
    </DropdownMenuContent>
  )

  return (
    <div className={cn(
      "flex flex-col md:grid md:grid-cols-[40px_130px_1fr_1fr_110px_110px_100px_110px_40px] gap-4 items-start md:items-center px-4 py-3.5 md:px-5 md:py-3.5 border-b border-slate-150/60 dark:border-border/25 last:border-0 transition-colors duration-150 relative",
      isSelected
        ? "bg-primary/5 dark:bg-primary/10"
        : "bg-transparent hover:bg-slate-50/50 dark:hover:bg-muted/10"
    )}>
      
      {/* Mobile Layout */}
      <div className="flex md:hidden w-full items-center justify-between gap-3 pr-8">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="flex items-center justify-center h-5 w-5">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(invoice.id)}
              aria-label={`Select invoice ${invoice.id}`}
              className="border-slate-300 dark:border-muted-foreground/45 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formattedId}</span>
              <Badge variant="outline" className={cn("text-[10px] font-semibold py-0.5 px-2 flex items-center rounded-full border shadow-3xs", statusConfig.badge)}>
                {displayStatus}
              </Badge>
            </div>
            
            <div className="space-y-0.5">
              <Link href={`/clients/${invoice.clientId}`} className="text-sm font-semibold hover:underline text-foreground block truncate">
                {clientName}
              </Link>
              <Link href={`/projects/${invoice.projectId}`} className="text-xs text-muted-foreground hover:underline hover:text-primary block truncate">
                {projectName}
              </Link>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-border/10">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Due: {formatDate(invoice.dueDate)}
              </span>
              <span className="text-sm font-semibold text-foreground">
                ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:contents">
        {/* Checkbox */}
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(invoice.id)}
            aria-label={`Select invoice ${invoice.id}`}
            className="border-slate-300 dark:border-muted-foreground/45 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        {/* Invoice ID */}
        <div className="text-sm font-semibold text-slate-850 dark:text-foreground">
          {formattedId}
        </div>

        {/* Client Name */}
        <div className="text-sm text-slate-700 dark:text-slate-300 truncate px-1">
          <Link href={`/clients/${invoice.clientId}`} className="hover:underline hover:text-primary transition-colors cursor-pointer block truncate font-medium">
            {clientName}
          </Link>
        </div>

        {/* Project Name */}
        <div className="text-sm text-slate-500 dark:text-slate-400 truncate px-1">
          <Link href={`/projects/${invoice.projectId}`} className="hover:underline hover:text-primary transition-colors cursor-pointer block truncate">
            {projectName}
          </Link>
        </div>

        {/* Issued Date */}
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {formatDate(invoice.createdAt)}
        </div>

        {/* Due Date */}
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {formatDate(invoice.dueDate)}
        </div>

        {/* Amount */}
        <div className="text-sm font-semibold text-slate-800 dark:text-foreground">
          ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        {/* Status Pill */}
        <div className="flex items-center">
          <Badge variant="outline" className={cn("text-[10px] font-semibold py-0.5 px-2.5 rounded-full border shadow-3xs", statusConfig.badge)}>
            {displayStatus}
          </Badge>
        </div>
      </div>

      {/* Actions Button (Single unified instance to prevent focus trap loop) */}
      <div className="absolute top-3.5 right-3.5 md:static md:col-span-1 flex items-center justify-end md:pr-1">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            {dropdownTrigger}
          </DropdownMenuTrigger>
          {dropdownContent}
        </DropdownMenu>
      </div>
      
    </div>
  )
}
