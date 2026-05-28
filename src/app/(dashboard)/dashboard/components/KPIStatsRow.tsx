'use client'

import { motion } from 'framer-motion'
import { DollarSign, Briefcase, Clock, FileText, CheckCircle, LucideCircleDollarSign } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'

interface KPIStatsRowProps {
  totalRevenue: number
  activeProjects: number
  totalHours: number
  unpaidInvoices: number
  tasksCompletedThisWeek: number
  unpaidAmount: number
  trends: {
    totalHours: number
    activeProjects: number
    tasksCompletedThisWeek: number
    totalRevenue: number
    unpaidInvoices: number
    unpaidAmount: number
  }
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

export function KPIStatsRow({
  totalRevenue,
  activeProjects,
  totalHours,
  unpaidInvoices,
  tasksCompletedThisWeek,
  unpaidAmount,
  trends,
}: KPIStatsRowProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      <StatCard
        title='Total Revenue'
        value={`$${totalRevenue.toLocaleString()}`}
        icon={DollarSign}
        color='text-emerald-500'
        gradient="from-emerald-500 to-teal-500"
        bg="bg-emerald-100/70 dark:bg-emerald-950/40"
        trend={{
          value: trends.totalRevenue,
          isPositive: trends.totalRevenue >= 0,
          label: 'vs last month'
        }}
      />
      <StatCard
        title='Active Projects'
        value={`${activeProjects}`}
        icon={Briefcase}
        color='text-blue-500'
        bg='bg-blue-100/70 dark:bg-blue-950/40'
        gradient="from-blue-500 to-indigo-500"
        trend={{
          value: trends.activeProjects,
          isPositive: trends.activeProjects >= 0,
          label: 'vs last month'
        }}
      />
      <StatCard
        title='Total Hours'
        value={totalHours.toFixed(1)}
        icon={Clock}
        color='text-orange-500'
        bg='bg-orange-100/70 dark:bg-orange-950/40'
        gradient="from-orange-500 to-red-500"
        trend={{
          value: trends.totalHours,
          isPositive: trends.totalHours >= 0,
          label: 'vs last month'
        }}
      />
      <StatCard
        title='Unpaid Invoices'
        value={`${unpaidInvoices}`}
        icon={FileText}
        color='text-red-500'
        bg='bg-red-100/70 dark:bg-red-950/40'
        gradient='from-red-500 to-pink-500'
        trend={{
          value: trends.unpaidInvoices,
          isPositive: trends.unpaidInvoices <= 0,
          label: 'vs last month'
        }}
      />
      <StatCard
        title='Tasks Completed'
        value={`${tasksCompletedThisWeek}`}
        icon={CheckCircle}
        color='text-emerald-500'
        bg='bg-emerald-100/70 dark:bg-emerald-950/40'
        gradient='from-emerald-700 to-teal-950'
        trend={{
          value: trends.tasksCompletedThisWeek,
          isPositive: trends.tasksCompletedThisWeek >= 0,
          label: 'vs last month'
        }}
      />
      <StatCard
        title='Unpaid Amount'
        value={`$${unpaidAmount.toLocaleString()}`}
        icon={LucideCircleDollarSign}
        color='text-yellow-500'
        bg='bg-yellow-100/70 dark:bg-yellow-950/40'
        gradient='from-yellow-500 to-yellow-700'
        trend={{
          value: trends.unpaidAmount,
          label: 'vs last month'
        }}
      />
    </motion.div>
  )
}