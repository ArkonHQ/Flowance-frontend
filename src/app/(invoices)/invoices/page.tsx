import { getAllInvoices, Invoice } from '@/lib/api/invoices'
import React from 'react'
import { InvoicesRow } from './components/InvoicesRow'
import { InvoicesContent } from './components/InvoicesContent'
import { cookies } from 'next/headers'



const InvoicesPage = async () => {
  
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const invoice: Invoice[] = await getAllInvoices(cookieHeader)



  return (
    <div className='container mx-auto space-y-0 flex items-center justify-center'>
      <InvoicesContent initialInvoices={invoice} />
    </div>
  )
}


export default InvoicesPage