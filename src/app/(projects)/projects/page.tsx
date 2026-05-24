import { cookies } from 'next/headers'
import { getAllProjects, Project } from "@/lib/api/projects"
import { getAllClients } from "@/lib/api/clients"
import { ProjectPageContent } from "../components/ProjectPageContent"

export const metadata = {
  title: 'Projects | Command Center',
}

const ProjectsPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const project: Project[] = await getAllProjects(cookieHeader)
  const clients = await getAllClients(cookieHeader)

  const clientNames = Object.fromEntries(clients.map((client) => [client.id, client.name])) as Record<number, string>

  // Compute stats
  const total = project.length
  const active = project.filter(a => a.status === 'active').length
  const completed = project.filter(c => c.status === 'completed').length
  const onHold = project.filter(a => a.status === 'on_hold').length
  const cancelled = project.filter(a => a.status === 'cancelled').length

  const stats = { total, active, completed, onHold, cancelled }

  return <ProjectPageContent initialProjects={project} clientNames={clientNames} stats={stats} />

}









export default ProjectsPage