'use client'

import { Invoice } from '@/lib/api/invoices'
import React, { useState } from 'react'
import { InvoicesRow } from './InvoicesRow'

interface Props  {
  initialInvoices: Invoice []
}

export const InvoicesContent = ({ initialInvoices }: Props) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const handleToggle = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end px-2">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground italic">Total of {initialInvoices.length} entries</p>
        </div>

        <div className='flex flex-col gap-4 w-full'>
          {/* Table Header */}
          <div className='grid grid-cols-15 gap-4 py-3 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/50'>
            <div className='col-span-1 flex justify-center'>Select</div>
            <div className='col-span-1 flex justify-center'>ID</div>
            <div className='col-span-2'>Client</div>
            <div className='col-span-2'>Project</div>
            <div className='col-span-2 flex justify-center'>Date</div>
            <div className='col-span-2 flex justify-center'>Due Date</div>
            <div className='col-span-2 flex justify-center'>Amount</div>
            <div className='col-span-2 flex justify-center'>Status</div>
            <div className='col-span-1'></div>
          </div>

          {/* Rows */}
          <div className='flex flex-col gap-3'>
            {initialInvoices.map((invoice) => (
              <InvoicesRow 
                key={invoice.id} 
                invoice={invoice} 
                isSelected={selectedIds.has(invoice.id)}
                onToggle={handleToggle}
                onDelete={(id) => console.log('Delete requested for invoice:', id)} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}