'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, FileText, Clock, ListTodo } from 'lucide-react'

export function QuickActionsCard() {
  const actions = [
    {
      label: 'New Project',
      icon: Briefcase,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      hoverBg: 'hover:bg-indigo-500/5',
      hoverBorder: 'hover:border-indigo-500/40',
    },
    {
      label: 'Create Invoice',
      icon: FileText,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      hoverBg: 'hover:bg-emerald-500/5',
      hoverBorder: 'hover:border-emerald-500/40',
    },
    {
      label: 'Log Time',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      hoverBg: 'hover:bg-blue-500/5',
      hoverBorder: 'hover:border-blue-500/40',
    },
    {
      label: 'Add Task',
      icon: ListTodo,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      hoverBg: 'hover:bg-violet-500/5',
      hoverBorder: 'hover:border-violet-500/40',
    },
  ]

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm">
      
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-base font-bold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className={`h-11 justify-start gap-2.5 text-xs font-bold border-border/40 rounded-xl group transition-all duration-200 ${action.hoverBg} ${action.hoverBorder}`}
          >
            <div
              className={`h-7 w-7 rounded-lg ${action.bg} ${action.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
            >
              <action.icon className="h-4 w-4" />
            </div>
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}