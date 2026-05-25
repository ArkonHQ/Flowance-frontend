import { getAllProjects } from "@/lib/api/projects";
import { cookies } from "next/headers";
import { TaskForm } from "../../components/TaskForm";




export default async function NewProjectPage() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const project = await getAllProjects(cookieHeader)


  return (
    <div className="container mx-auto py-8 px-4 md::px6 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold tracking-tight">New Tasks</div>
      </div>
      <TaskForm projects={project} />
    </div>
  )
}








