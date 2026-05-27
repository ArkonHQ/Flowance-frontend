'use client'

import { Invoice } from '@/lib/api/invoices'
import React from 'react'
import { InvoicesRow } from './InvoicesRow'

interface Props  {
  initialInvoices: Invoice []
}


export const InvoicesContent = ({ initialInvoices }: Props) => {
  return (
    <div className='felx items-center justify-center'>
    <InvoicesRow invoice={initialInvoices} onDelete={() => {}} />
    </div>
  )
}