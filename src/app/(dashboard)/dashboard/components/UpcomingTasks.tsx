"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckSquare, Clock, Flag } from 'lucide-react'

type Task = {
  id: number
  title: string
  deadline: string
  projectName: string
}

type Deadline = {
  type: string
  title: string
  deadline: string
}

type UpcomingTasksProps = {
  upcomingTasks: Task[]
  deadlines: Deadline[]
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

export default function UpcomingTasks({ upcomingTasks, deadlines }: UpcomingTasksProps) {
  
  // Helper to check if date is very close (e.g. less than 3 days)
  const isUrgent = (dateStr: string) => {
    if (!dateStr) return false
    const diffTime = new Date(dateStr).getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  }

  // Format date elegantly
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Upcoming Tasks Card */}
      <Card className="border border-border/30 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-indigo-500" />
              Tasks Due Soon
            </CardTitle>
            <p className="text-xs text-muted-foreground">Actionable deliverables scheduled for the next 7 days</p>
          </div>
          <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]">
            {upcomingTasks.length} Pending
          </Badge>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {upcomingTasks.slice(0, 5).map((t) => {
              const urgent = isUrgent(t.deadline)
              return (
                <motion.div
                  key={t.id}
                  variants={itemVariants}
                  className={`flex items-start justify-between p-3 rounded-lg border transition-all duration-200 ${
                    urgent
                      ? 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
                      : 'border-border/10 bg-background/40 hover:bg-background/80 hover:border-border/35'
                  }`}
                >
                  <div className="space-y-1.5 max-w-[70%]">
                    <p className="text-sm font-semibold tracking-tight text-foreground line-clamp-1">{t.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] text-muted-foreground py-0 px-1 border-border/40 font-medium">
                        {t.projectName}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${urgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                      <Clock className="h-3 w-3" />
                      {formatDate(t.deadline)}
                    </span>
                    {urgent && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold py-0.5 px-1 leading-none rounded">
                        Soon
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {upcomingTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
                <p>No upcoming tasks in next 7 days.</p>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Key Deadlines Card */}
      <Card className="border border-border/30 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Flag className="h-5 w-5 text-indigo-500" />
              Critical Deadlines
            </CardTitle>
            <p className="text-xs text-muted-foreground">Milestones, project timelines, and major checkpoints</p>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {deadlines.slice(0, 5).map((d, i) => {
              const urgent = isUrgent(d.deadline)
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className={`flex items-start justify-between p-3 rounded-lg border transition-all duration-200 ${
                    urgent
                      ? 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10'
                      : 'border-border/10 bg-background/40 hover:bg-background/80 hover:border-border/35'
                  }`}
                >
                  <div className="space-y-1.5 max-w-[70%]">
                    <p className="text-sm font-semibold tracking-tight text-foreground line-clamp-1">{d.title}</p>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-extrabold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                      {d.type}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${urgent ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(d.deadline)}
                    </span>
                    {urgent && (
                      <Badge className="bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-bold py-0.5 px-1 leading-none rounded">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {deadlines.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <Flag className="h-8 w-8 text-muted-foreground/40" />
                <p>No critical deadlines set.</p>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
