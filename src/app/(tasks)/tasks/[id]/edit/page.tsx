import { getAllProjects } from "@/lib/api/projects"
import { getTask } from "@/lib/api/tasks"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { EditTaskForm } from "../components/EditTaskForm"





interface Props{
  params: Promise<{ id: string }>
}


const EditTaskPage = async (props: Props) => {

  const params = await props.params
  const taskId = Number(params.id)

  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const [task, project] = await Promise.all([
    getTask(taskId, cookieHeader),
    getAllProjects(cookieHeader),
  ])

  if (!task) return notFound()


  
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
            <h1 className="text-3xl font-bold tracking-tight w-full">
              Edit Task
            </h1>
          </div>
        <EditTaskForm task={task} project={project} />
      </div>
    )


}


export default EditTaskPage