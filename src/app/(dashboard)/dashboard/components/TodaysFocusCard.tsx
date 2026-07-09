import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Clock, FileWarning, CheckCircle2, DollarSign } from 'lucide-react'

interface TodaysFocusCardProps {
  highPriorityTasks: number;
  pendingInvoices: number;
  atRiskProjects: number;
  unpaidAmount: number;
}

export function TodaysFocusCard({
  highPriorityTasks = 0,
  pendingInvoices = 0,
  atRiskProjects = 0,
  unpaidAmount = 0,
}: TodaysFocusCardProps) {
  const focuses = [
    ...(highPriorityTasks > 0 ? [{ id: 1, title: `${highPriorityTasks} high-priority tasks due`, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' }] : []),
    ...(pendingInvoices > 0 ? [{ id: 2, title: `${pendingInvoices} pending invoices`, icon: FileWarning, color: 'text-amber-500', bg: 'bg-amber-500/10' }] : []),
    ...(atRiskProjects > 0 ? [{ id: 3, title: `${atRiskProjects} project${atRiskProjects > 1 ? 's' : ''} at risk`, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' }] : []),
    ...(unpaidAmount > 0 ? [{ id: 4, title: `$${unpaidAmount.toLocaleString()} unpaid balance`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' }] : []),
  ];

  if (focuses.length === 0) {
    focuses.push({ id: 0, title: 'All caught up for today!', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' });
  }

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm w-full group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 pt-4 border-b border-border/10">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Today's Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {focuses.slice(0, 4).map((focus) => (
            <div key={focus.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50 hover:bg-muted/50 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm">
              <div className={`p-2 rounded-full ${focus.bg}`}>
                <focus.icon className={`h-4 w-4 ${focus.color}`} />
              </div>
              <span className="text-xs font-semibold">{focus.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
