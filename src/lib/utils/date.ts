import { formatDistanceToNow, format, isToday  } from "date-fns"


export const getThisWeekRange = ():{start: Date, end: Date} => {

  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1 )

  const start = new Date(now)
  start.setDate(now.getDate() - diffToMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  end.setHours(0, 0, 0, 0)

  return { start, end }
} 

export const isTaskInThisWeek = (task: {createdAt: Date | string}): boolean => {
  const {start, end } = getThisWeekRange()
  const date = new Date(task.createdAt)
  return date >= start && date < end
} 

/**
 * Format completedAt conditionally:
 * - If completedAt is today → show time (ex: "2:30 PM")
 * - If completedAt is before today → show date (ex: "Jun 20, 2025")
 * - If null → return empty string
 */

export const formatCompletedAt = (completedAt: string | null): string => {
  if (!completedAt) return ''
  
  const now = new Date()
  const date = new Date(completedAt)
  
  // if completed today show only the time
  if (isToday(date)) {
    return format(date, 'h:mm a')
  }

  // If completed more than 1 day ago show full date
  return format(date, 'MMM dd, yyyy')
}

/**
 * Checks if a task is overdue.
 * A task is overdue if its status is 'overdue' OR 
 * if it's not done/cancelled, has a deadline and the end of the deadline day is in the past.
 */
export const isOverdue = (deadline: string | Date | null | undefined, status: string): boolean => {
  if (status === 'overdue') return true;
  if (['done', 'cancelled'].includes(status)) return false;
  if (!deadline) return false;
  
  const deadlineDate = new Date(deadline);
  // Set to the end of the selected day
  deadlineDate.setHours(23, 59, 59, 999);
  
  return deadlineDate.getTime() < Date.now();
}