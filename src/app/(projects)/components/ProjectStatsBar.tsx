import { StatCard } from '@/components/ui/StatCard'
import { Briefcase, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

interface ProjectStatsBarProps {
  total: number
  active: number
  completed: number
  atRisk: number
}

export function ProjectStatsBar({ total, active, completed, atRisk }: ProjectStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Projects"
        value={total.toString()}
        icon={Briefcase}
        color="text-indigo-500"
        bg="bg-indigo-100/70 dark:bg-indigo-950/40"
        gradient="from-indigo-500 to-blue-500"
      />
      <StatCard
        title="Active"
        value={active.toString()}
        icon={CheckCircle}
        color="text-emerald-500"
        bg="bg-emerald-100/70 dark:bg-emerald-950/40"
        gradient="from-emerald-500 to-teal-500"
      />
      <StatCard
        title="Completed"
        value={completed.toString()}
        icon={CheckCircle}
        color="text-blue-500"
        bg="bg-blue-100/70 dark:bg-blue-950/40"
        gradient="from-blue-500 to-cyan-500"
      />
      <StatCard
        title="At Risk"
        value={atRisk.toString()}
        icon={AlertTriangle}
        color="text-rose-500"
        bg="bg-rose-100/70 dark:bg-rose-950/40"
        gradient="from-rose-500 to-pink-500"
      />
    </div>
  )
}