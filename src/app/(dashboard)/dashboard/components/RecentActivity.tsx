"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Plus, FileText, CheckCircle2, User, DollarSign, MessageSquare } from 'lucide-react'

type ActivityItem = {
  type: string
  description: string
  createdAt: string
}

type RecentActivityProps = {
  recentActivity: ActivityItem[]
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function RecentActivity({ recentActivity }: RecentActivityProps) {
  // Map activity type to proper icon and color
  const getActivityIcon = (type: string, description: string) => {
    const desc = description.toLowerCase()
    if (desc.includes('invoice') || desc.includes('payment') || type === 'invoice') {
      return { Icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/55' }
    }
    if (desc.includes('client') || type === 'client') {
      return { Icon: User, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/55' }
    }
    if (desc.includes('completed') || desc.includes('done') || desc.includes('finish') || type === 'completed') {
      return { Icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-950/40 border-green-200 dark:border-green-900/55' }
    }
    if (desc.includes('created') || desc.includes('new') || desc.includes('added') || type === 'create') {
      return { Icon: Plus, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/55' }
    }
    if (desc.includes('task') || type === 'task') {
      return { Icon: FileText, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/55' }
    }
    return { Icon: MessageSquare, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700/60' }
  }

  // Format date elegantly
  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="border border-border/30 bg-card/40 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          System Activity Stream
        </CardTitle>
        <p className="text-xs text-muted-foreground">Historical ledger of changes, task completions, and invoice status updates</p>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border/35"
        >
          {recentActivity.slice(0, 8).map((act, i) => {
            const { Icon, color, bg } = getActivityIcon(act.type, act.description)
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-1.5 p-3 rounded-lg border border-transparent hover:border-border/10 hover:bg-background/25 transition-all duration-200"
              >
                {/* Timeline circular indicator */}
                <div className={`absolute -left-[27px] top-[14px] flex h-5 w-5 items-center justify-center rounded-full border ${bg} shadow-xs z-10 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-3 w-3 ${color}`} />
                </div>

                <div className="space-y-1 max-w-[80%]">
                  <p className="text-sm font-medium text-foreground tracking-tight leading-relaxed">
                    {act.description}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 py-0.5 px-1.5 rounded-full border border-border/20 self-start md:self-center whitespace-nowrap">
                  {formatTime(act.createdAt)}
                </span>
              </motion.div>
            )
          })}

          {recentActivity.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm pl-0 before:hidden">
              No recent activity recorded.
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}
