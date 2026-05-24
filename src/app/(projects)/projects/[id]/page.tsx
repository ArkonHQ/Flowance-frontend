import { getProject } from "@/lib/api/projects"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ProjectDetail } from "./components/ProjectDetail"



interface Props {
  params: Promise<{ id: string }>
}



const ProjectDetailsPage = async (props: Props) => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const params = await props.params
  const id = Number(params?.id)
  if (!Number.isInteger(id) || id <= 0) return notFound()

  let project
  try {
    project = await getProject(id, cookieHeader)
    if (!project) return notFound()
  } catch {
    return notFound()
  }



  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-3xl space-y-6">
      
      <ProjectDetail project={project} />
      

    </div>
  )
}

export default ProjectDetailsPage
