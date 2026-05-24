import { getAllClients } from "@/lib/api/clients";
import { getProject } from "@/lib/api/projects";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EditProjectFrom } from "../components/EditProjectForm";




interface Props {
  params: Promise<{ id: string }>
}


const EditPage = async (props: Props) => {
  
  const params = await props.params
  const projectId = Number(params.id)


  // 1.Read cookies from the incoming request
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()

    
  // 2.Fetch the existing project and all clients in parallel
  const [project, clients] = await Promise.all([
    getProject(projectId, cookieHeader),
    getAllClients(cookieHeader),
  ])

  // 3.If the project doesn't exist, show a 404 page
  if (!project) return notFound()


  // 4.pass the data to the client component
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1.5 rounded-full bg-primary" />
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Project
        </h1>
      </div>
      <EditProjectFrom project={project} clients={clients} />
    </div>
  )
}


export default EditPage
