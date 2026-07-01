import { cookies } from 'next/headers'
import { getAllProjects, Project } from "@/lib/api/projects"
import { getAllClients } from "@/lib/api/clients"
import { getAllInvoices, Invoice } from "@/lib/api/invoices" 
import { ProjectPageContent } from "../components/ProjectPageContent"

export const metadata = {
  title: 'Projects | Command Center',
}

const ProjectsPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const project: Project[] = await getAllProjects(cookieHeader)
  const clients = await getAllClients(cookieHeader)
  const invoices: Invoice[] = await getAllInvoices(cookieHeader)

  const clientNames = Object.fromEntries(clients.map((client) => [client.id, client.name])) as Record<number, string>

  // Compute stats
  const total = project.length
  const active = project.filter(a => a.status === 'active').length
  const completed = project.filter(c => c.status === 'completed').length
  const onHold = project.filter(a => a.status === 'on_hold').length
  const cancelled = project.filter(a => a.status === 'cancelled').length
  const planning = project.filter(a => a.status === 'planning').length
  const archived = project.filter(a => a.isArchived).length

  const stats = { total, active, completed, onHold, cancelled, planning, archived }

  return <ProjectPageContent initialProjects={project} clients={clients} clientNames={clientNames} stats={stats} invoices={invoices} />

}









export default ProjectsPage