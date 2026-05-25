import { getTask } from "@/lib/api/tasks"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { TaskDetail } from "./components/TaskDetail"








interface Props {
  params: Promise<{ id: string }>
}

const TaskDetailsPage = async (props: Props) => {

  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const params = await props.params
  const id = Number (params?.id)
  if (!Number.isInteger(id) || id <= 0) return notFound()
  
  let task 
  try {

    task = await getTask(id, cookieHeader)
    if (!task) return notFound()

  }catch (err: any) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-3xl space-y-6">

      <TaskDetail task={task} />
      
    </div>
  )

}


export default TaskDetailsPage