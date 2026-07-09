'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, ArrowRight, FolderOpen, CheckCircle2, FileText, Clock, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ActivityItem {
  type: string
  description: string
  createdAt: string
}

interface RecentActivityCardProps {
  activity?: ActivityItem[]
}

const getActivityConfig = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'project_created':
    case 'project':
      return { icon: FolderOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    case 'task_completed':
    case 'task':
      return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    case 'invoice_sent':
    case 'invoice':
      return { icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/10' }
    case 'time_logged':
    case 'time':
      return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' }
    case 'member_joined':
    case 'member':
      return { icon: UserPlus, color: 'text-pink-500', bg: 'bg-pink-500/10' }
    default:
      return { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted/30' }
  }
}

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
}

export function RecentActivityCard({ activity = [] }: RecentActivityCardProps) {
  const hasData = activity && activity.length > 0

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 pt-5 border-b border-border/10 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            Recent Activity
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Latest workspace events</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="p-3 rounded-full bg-muted/30 mb-3">
              <Activity className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Workspace events will appear here</p>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="relative space-y-1"
          >
            {/* Vertical timeline line */}
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border/20 pointer-events-none" />

            {activity.slice(0, 6).map((item, i) => {
              const config = getActivityConfig(item.type)
              const Icon = config.icon
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors relative"
                >
                  <div className={`p-1.5 rounded-full shrink-0 z-10 ${config.bg}`}>
                    <Icon className={`h-3 w-3 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground line-clamp-2 font-medium leading-relaxed">
                      {item.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatTimeAgo(item.createdAt)}</p>
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
