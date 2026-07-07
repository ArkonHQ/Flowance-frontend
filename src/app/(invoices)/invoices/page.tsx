import { getAllInvoices, Invoice } from '@/lib/api/invoices'
import { getAllClients } from '@/lib/api/clients'
import { getAllProjects } from '@/lib/api/projects'
import React from 'react'
import { InvoicesContent } from './components/InvoicesContent'
import { cookies } from 'next/headers'

import { getActiveTeamSlug } from '@/lib/utils/team'

const InvoicesPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const teamSlug = await getActiveTeamSlug(cookieHeader)

  const [invoices, clients, projects] = await Promise.all([
    getAllInvoices(cookieHeader, teamSlug),
    getAllClients(cookieHeader, teamSlug).catch((err) => {
      console.error(err)
      return []
    }),
    getAllProjects(cookieHeader, teamSlug).catch((err) => {
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