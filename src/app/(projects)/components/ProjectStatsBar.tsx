import { StatCard } from '@/components/ui/StatCard'
import { Briefcase, CheckCircle, AlertTriangle, Clock, Activity } from 'lucide-react'

interface ProjectStatsBarProps {
  total: number
  active: number
  completed: number
  atRisk: number
}

export function ProjectStatsBar({ total, active, completed, atRisk }: ProjectStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Tasks"
          value={total.toString()}
          icon={Briefcase}
          color="text-yellow-500"
          bg="bg-yellow-100/70 dark:bg-yellow-950/40"
          gradient="from-yellow-500 to-orange-500"
          trend={{ value: weeklyTotal, isPositive: true, label: "this month", suffix: "" }}
        />
        <StatCard
          title="In Progress"
          value={active.toString()}
          icon={Activity}
          color="text-blue-500"
          bg="bg-blue-100/70 dark:bg-blue-950/40"
          gradient="from-blue-500 to-cyan-500"
          trend={{ value: statusPercentage.in_progress, isPositive: true, label: "of total" }}
        />
        <StatCard
          title="Completed"
          value={taskStats.done.toString()}
          icon={CheckCircle}
          color="text-emerald-500"
          bg="bg-emerald-100/70 dark:bg-emerald-950/40"
          gradient="from-emerald-500 to-teal-500"
          trend={{ value: statusPercentage.done, isPositive: true, label: "of total" }}
        />
    </div>
  )
}