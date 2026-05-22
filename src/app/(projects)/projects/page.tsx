import { getAllProjects, Project } from "@/lib/api/projects"
import { ProjectPageContent } from "../components/ProjectPageContent"

const ProjectsPage = async () => {
  const project: Project[] = await getAllProjects()
  

  // Compute stats
  const total = project.length
  const active = project.filter(a => a.status === 'active').length
  const completed = project.filter(c => c.status === 'completed').length
  const onHold = project.filter(a => a.status === 'on_hold').length
  const cancelled = project.filter(a => a.status === 'cancelled').length

  const stats = { total, active, completed, onHold, cancelled }

  return <ProjectPageContent initialProjects={project} stats={stats} />

}









export default ProjectsPage