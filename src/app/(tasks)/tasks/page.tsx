import { getAllProjects, Project } from "@/lib/api/projects"
import { getAllTasks } from "@/lib/api/tasks"
import { Task } from "@/lib/api/tasks"
import { cookies } from "next/headers"
import { TaskPageContent } from "../components/TaskPageContent"




export const metadata = {
  title: 'Tasks | Command Center',
}

const TaskPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const task: Task[] = await getAllTasks(cookieHeader)
  const project:Project [] = await getAllProjects(cookieHeader)
  
  // Compute stats
  const total = task.length
  const todo = task.filter(t => t.status === 'todo').length
  const in_progress = task.filter(t => t.status === 'in_progress').length
  const done = task.filter(t => t.status === 'done').length
  const cancelled = task.filter(t => t.status === 'cancelled').length
  const delayed = task.filter(t => t.status === 'delayed').length
  const high = task.filter(t => t.priority === 'high').length

  const stats = { total, todo, in_progress, done, cancelled, delayed, high }

  return <TaskPageContent initialTask={task} stats={stats} />

    
}

export default TaskPage