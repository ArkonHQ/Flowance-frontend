
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