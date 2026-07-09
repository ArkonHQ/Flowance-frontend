'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ListTodo, ArrowRight, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Task {
  id: number
  title: string
  priority: 'High' | 'Medium' | 'Low'
  deadline: string
  projectName: string
}

interface TasksDueCardProps {
  tasks: Task[]
}

const PRIORITY_CONFIG = {
  High:   { bar: 'bg-rose-500',    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20',    dot: 'bg-rose-500 animate-pulse' },
  Medium: { bar: 'bg-amber-500',   badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
  Low:    { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
}

const formatDeadline = (dateStr: string) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `${diffDays}d left`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const isUrgent = (dateStr: string) => {
  if (!dateStr) return false
  const diffMs = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) <= 2
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
}

export function TasksDueCard({ tasks }: TasksDueCardProps) {
  const sorted = [...(tasks || [])].sort((a, b) => {
    const priority = { High: 0, Medium: 1, Low: 2 }
    return priority[a.priority] - priority[b.priority]
  })

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 pt-5 border-b border-border/10 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <ListTodo className="h-4 w-4 text-indigo-500" />
            </div>
            Upcoming Deadlines
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Tasks requiring immediate attention</p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/tasks">
            All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="p-3 rounded-full bg-muted/30 mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">All clear!</p>
            <p className="text-xs text-muted-foreground/70 mt-1">No tasks due soon</p>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {sorted.slice(0, 6).map((task) => {
              const config = PRIORITY_CONFIG[task.priority]
              const urgent = isUrgent(task.deadline)
              const deadlineLabel = formatDeadline(task.deadline)
              return (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  className={`relative flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                    urgent
                      ? 'border-rose-500/15 bg-rose-500/5 hover:bg-rose-500/10'
                      : 'border-border/10 bg-background/30 hover:bg-background/70 hover:border-border/30'
                  }`}
                >
                  {/* left priority bar */}
                  <div className={`absolute left-0 top-0 h-full w-[3px] rounded-r-full ${config.bar}`} />
                  <span className={`h-2 w-2 rounded-full shrink-0 ml-1 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-foreground">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{task.projectName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={`text-[9px] h-4 px-1.5 font-bold uppercase border ${config.badge}`}>
                      {task.priority}
                    </Badge>
                    <span className={`text-[10px] font-semibold ${deadlineLabel === 'Overdue' ? 'text-rose-500' : urgent ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {deadlineLabel}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}