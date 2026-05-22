import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ListTodo } from 'lucide-react'

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

export function TasksDueCard({ tasks }: TasksDueCardProps) {
  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between pt-5">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ListTodo className="h-4.5 w-4.5 text-indigo-500" />
            Tasks Due Soon
          </CardTitle>
          <p className="text-xs text-muted-foreground">Actionable deliverables</p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-[10px]">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task, i) => {
          const priorityColors = {
            High: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
            Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            Low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          }
          return (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-border/10 bg-background/25">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${
                  task.priority === 'High' ? 'bg-rose-500 animate-pulse' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <span className="text-xs font-semibold truncate">{task.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase py-0.5 px-1.5 rounded-md leading-none border ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">{task.deadline}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}