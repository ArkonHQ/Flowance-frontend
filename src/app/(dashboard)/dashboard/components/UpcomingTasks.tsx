"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CheckSquare, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Task = {
  id: number
  title: string
  deadline: string
  projectName: string
  priority?: 'High' | 'Medium' | 'Low'
}

type UpcomingTasksProps = {
  upcomingTasks: Task[]
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22 } },
}

const getDaysLeft = (dateStr: string) => {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const formatDeadline = (dateStr: string) => {
  if (!dateStr) return 'No date'
  const days = getDaysLeft(dateStr)
  if (days === null) return 'No date'
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 7) return `${days}d left`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const PRIORITY_DOT: Record<string, string> = {
  High: 'bg-rose-500 animate-pulse',
  Medium: 'bg-amber-500',
  Low: 'bg-emerald-500',
}

export default function UpcomingTasks({ upcomingTasks }: UpcomingTasksProps) {
  const sorted = [...(upcomingTasks || [])].sort((a, b) => {
    const da = getDaysLeft(a.deadline) ?? 999
    const db = getDaysLeft(b.deadline) ?? 999
    return da - db
  })

  return (
    <Card className="border border-border/30 bg-card/50 backdrop-blur-md shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-border/10 pt-5">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10">
              <CheckSquare className="h-4 w-4 text-indigo-500" strokeWidth={2.5} />
            </div>
            Recent Activity
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">Upcoming tasks</p>
            {upcomingTasks.length > 0 && (
              <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 border text-[9px] h-4 px-1.5 font-bold">
                {upcomingTasks.length}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/tasks">
            All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {sorted.slice(0, 5).map((t) => {
            const daysLeft = getDaysLeft(t.deadline)
            const isOverdue = daysLeft !== null && daysLeft < 0
            const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2
            const deadlineLabel = formatDeadline(t.deadline)
            const dotClass = t.priority ? PRIORITY_DOT[t.priority] : (isUrgent ? 'bg-amber-500' : 'bg-muted-foreground/30')

            return (
              <motion.div
                key={t.id}
                variants={itemVariants}
                className={`flex items-start justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isOverdue
                    ? 'border-rose-500/15 bg-rose-500/5 hover:bg-rose-500/10'
                    : isUrgent
                    ? 'border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10'
                    : 'border-border/10 bg-background/30 hover:bg-background/70 hover:border-border/30'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">{t.title}</p>
                    <Badge
                      variant="outline"
                      className="text-[9px] text-muted-foreground py-0 px-1.5 border-border/40 font-medium mt-1 h-4"
                    >
                      {t.projectName}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                  <span
                    className={`text-[10px] font-semibold flex items-center gap-1 ${
                      isOverdue ? 'text-rose-500' : isUrgent ? 'text-amber-500' : 'text-muted-foreground'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {deadlineLabel}
                  </span>
                </div>
              </motion.div>
            )
          })}

          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="p-3 rounded-full bg-muted/30 mb-3">
                <Calendar className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">All clear!</p>
              <p className="text-xs text-muted-foreground/70 mt-1">No upcoming tasks in the next 7 days.</p>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}
