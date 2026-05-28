'use client'

import { Invoice } from "@/lib/api/invoices"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Pencil, FileDown, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import DeleteButton from "./DeleteButton"




interface InvoicesRowProps {
  invoice: Invoice
  isSelected: boolean
  onDelete: (id: number) => void
  onToggle: (id: number) => void
}

const getStatusColors = (status: string) => {
  const statusColors: Record<string, string> = {
    draft: 'bg-blue-100 text-blue-700 border-blue-200',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    sent: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    overdue: 'bg-gray-100 text-gray-700 border-gray-200',
    partially_paid: 'bg-green-100 text-green-700 border-green-200'
  }
  return statusColors[status] || statusColors.overdue
}

const formatDate = (date: string | Date | undefined | null) => {
  if(!date) return 'N/A'
  const d = new Date(date)
  if(Number.isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-US',{
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}


export const InvoicesRow = ({invoice, onDelete, onToggle, isSelected}: InvoicesRowProps ) => {

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const displayStatus = (invoice.status || 'draft').replace(/_/g, ' ')

  return (
      <div className="grid grid-cols-15 gap-4 items-center px-5 py-4 bg-card/40 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm hover:shadow-md hover:border-border/80 hover:bg-card/60 transition-all group">
        {/* Checkbox columns */}
        <div className="col-span-1 flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(invoice.id)}
            aria-label={`Select invoice ${invoice.id}`}
              />
        </div>

        {/* Invoice columns */} 
        <div className="col-div-1 flex items-center justify-center text-sm font-bold text-primary">
          #{invoice.id}
        </div>

        {/* Client name column */}
        <div className="col-span-2 flex items-center justify-start text-sm font-medium">
          Client {invoice.clientId}
        </div>

         {/* Project name columns */}
         <div className="col-span-2 flex items-center justify-start text-sm text-muted-foreground">
          Project {invoice.projectId}
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
        <div className="col-span-1 flex items-center justify-center">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild >
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground"/>
              </Button>
            </DropdownMenuTrigger> 
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit invoice
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <FileDown className="h-4 w-4" />
                Download PDF
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