import { cookies } from 'next/headers'
import { getAllProjects, Project } from "@/lib/api/projects"
import { getAllClients } from "@/lib/api/clients"
import { getAllInvoices, Invoice } from "@/lib/api/invoices" 
import { ProjectPageContent } from "../components/ProjectPageContent"
import { getActiveTeamSlug } from "@/lib/utils/team"

export const metadata = {
  title: 'Projects | Command Center',
}

const ProjectsPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const teamSlug = await getActiveTeamSlug(cookieHeader)

  const [project, clients, invoices] = await Promise.all([
    getAllProjects(cookieHeader, teamSlug).catch((e) => { console.error('projects:', e.message); return [] as Project[] }),
    getAllClients(cookieHeader, teamSlug).catch((e) => { console.error('clients:', e.message); return [] }),
    getAllInvoices(cookieHeader, teamSlug).catch((e) => { console.error('invoices:', e.message); return [] as Invoice[] }),
  ])

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