import { getAllInvoices, Invoice } from '@/lib/api/invoices'
import { getAllClients } from '@/lib/api/clients'
import { getAllProjects } from '@/lib/api/projects'
import React from 'react'
import { InvoicesContent } from './components/InvoicesContent'
import { cookies } from 'next/headers'

const InvoicesPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const [invoices, clients, projects] = await Promise.all([
    getAllInvoices(cookieHeader),
    getAllClients(cookieHeader).catch((err) => {
      console.error(err)
      return []
    }),
    getAllProjects(cookieHeader).catch((err) => {
      console.error(err)
      return []
    })
  ])

  return (
    <div className='container mx-auto space-y-0 flex items-center justify-center'>
      <InvoicesContent initialInvoices={invoices} clients={clients} projects={projects} />
    </div>
  )
}

export default InvoicesPage