


const LS_KEY = 'fcc_today_hours'

interface TodayRecord {
  date: string
  tasks: Record<string, number>
}

const todayDate = () => new Date().toISOString().slice(0, 10)

const readRecord = (): TodayRecord => {
  if (typeof window === 'undefined') return { date: todayDate(), tasks: {} }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { date: todayDate(), tasks: {} }
    const parsed = JSON.parse(raw) as TodayRecord
    // If it's a new day, wipe the record
    if (parsed.date !== todayDate()) return { date: todayDate(), tasks: {} }
    return parsed
  } catch {
    return { date: todayDate(), tasks: {} }
  }
}

const writeRecord = (record: TodayRecord) => {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(record)) } catch { /* Silent for now */ }
}

// Add seconds to the running today-total for a task.
// Called by the timer store after each pause/stop that logs hours.

export const addTodaySeconds = (taskId: number, seconds: number) => {
  if (seconds <= 0) return
  const rec = readRecord()
  rec.tasks[String(taskId)] = (rec.tasks[String(taskId)] ?? 0) + seconds
  writeRecord(rec)
}

// Returns the total seconds logged today for a task (persisted chunks only).
// Add the current live running chunk on top of this for a real-time display.

export const getTodaySeconds = (taskId: number): number => {
  const rec = readRecord()
  return rec.tasks[String(taskId)] ?? 0
}
