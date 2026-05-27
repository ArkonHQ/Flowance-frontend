'use client'

import { Invoice } from "@/lib/api/invoices"
import { useState } from "react"



interface InvoicesRowProps {
  invoice: Invoice
  onDelete: (id: number) => void
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


export const InvoicesRow = ({invoice, onDelete}: InvoicesRowProps ) => {

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const displayStatus = (invoice.status).replace(/_/g, ' ')

  return (

    <div className="grid grid-cols-12 flex-row "></div>
  
  )
}