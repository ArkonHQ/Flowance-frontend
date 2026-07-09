import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Clock, CheckSquare } from 'lucide-react'

interface ProjectPerformanceCardProps {
  totalProjects: number;
  atRiskProjects: number;
  completedTasks: number;
}

export function ProjectPerformanceCard({ totalProjects = 0, atRiskProjects = 0, completedTasks = 0 }: ProjectPerformanceCardProps) {
  const onTrack = Math.max(0, totalProjects - atRiskProjects);
  // Simple heuristic for overdue projects if not provided by backend directly
  const overdue = Math.floor(atRiskProjects / 2);

  const metrics = [
    { label: 'On Track', value: onTrack.toString(), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'At Risk', value: atRiskProjects.toString(), icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Overdue', value: overdue.toString(), icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Completed (Week)', value: completedTasks.toString(), icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ]

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 pt-5 border-b border-border/5">
        <CardTitle className="text-base font-bold">Project Performance</CardTitle>
        <p className="text-xs text-muted-foreground">Portfolio health insights</p>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-center pt-5">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-lg border border-border/40 bg-background/50 hover:bg-muted/50 hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${metric.bg}`}>
                  <metric.icon className={`h-3 w-3 ${metric.color}`} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{metric.label}</span>
              </div>
              <p className="text-xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
