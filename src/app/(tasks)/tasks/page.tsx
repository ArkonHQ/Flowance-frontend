import { getAllProjects, Project } from "@/lib/api/projects"
import { getAllTasks } from "@/lib/api/tasks"
import { Task } from "@/lib/api/tasks"
import { getDashboard } from "@/lib/api/dashboard"
import { cookies } from "next/headers"
import { TaskPageContent } from "../components/TaskPageContent"




export const metadata = {
  title: 'Tasks | Command Center',
}

const TaskPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  
  const [{tasks, totalHours}, lastWeekDashboard, projects] = await Promise.all([
    getAllTasks(cookieHeader),
    getDashboard(cookieHeader, '7days'),
    getAllProjects(cookieHeader),
  ])
  
  // Last week's total hours
  const lastWeekHours = lastWeekDashboard.totalHours
  
  // Compute stats
  const total = tasks.length
  const todo = tasks.filter(t => t.status === 'todo').length
  const in_progress = tasks.filter(t => t.status === 'in_progress').length
  const done = tasks.filter(t => t.status === 'done').length
  const cancelled = tasks.filter(t => t.status === 'cancelled').length
  const delayed = tasks.filter(t => t.status === 'delayed').length
  const overdue = tasks.filter(t => {
    if (t.status === 'overdue') return true
    if (['done', 'cancelled'].includes(t.status)) return false
    if (!t.deadline) return false
    return new Date(t.deadline).getTime() < Date.now()
  }).length
  

  const stats = { total, todo, in_progress, done, cancelled, delayed, totalHours, overdue }

  return <TaskPageContent initialTask={tasks} stats={stats} projects={projects} totalHours={totalHours} lastWeekHours={lastWeekHours} />
  
}

export default TaskPage