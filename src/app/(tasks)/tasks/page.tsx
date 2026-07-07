import { getAllProjects, Project } from "@/lib/api/projects"
import { getAllTasks } from "@/lib/api/tasks"
import { Task } from "@/lib/api/tasks"
import { getDashboard } from "@/lib/api/dashboard"
import { cookies } from "next/headers"
import { TaskPageContent } from "../components/TaskPageContent"
import { isOverdue } from "@/lib/utils/date"
import { getActiveTeamSlug } from "@/lib/utils/team"




export const metadata = {
  title: 'Tasks | Command Center',
}

const TaskPage = async () => {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  
  const teamSlug = await getActiveTeamSlug(cookieHeader)

  const [{tasks, totalHours}, lastWeekDashboard, projects] = await Promise.all([
    getAllTasks(cookieHeader, teamSlug),
    getDashboard(cookieHeader, '7days', teamSlug),
    getAllProjects(cookieHeader, teamSlug),
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
  const overdue = tasks.filter(t => isOverdue(t.deadline, t.status)).length
  

  const stats = { total, todo, in_progress, done, cancelled, delayed, totalHours, overdue }

  return <TaskPageContent initialTask={tasks} stats={stats} projects={projects} totalHours={totalHours} lastWeekHours={lastWeekHours} />
  
}

export default TaskPage