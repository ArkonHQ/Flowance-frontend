import { cookies } from 'next/headers'
import { getAllClients } from '@/lib/api/clients'
import { getAllProjects } from '@/lib/api/projects'
import { InvoiceForm } from '../components/InvoiceForm'

export default async function NewInvoicePage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const clients = await getAllClients(cookieHeader)
  const projects = await getAllProjects(cookieHeader)

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1.5 rounded-full bg-primary" />
        <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
      </div>
      <InvoiceForm clients={clients} projects={projects} />
    </div>
  )
}
