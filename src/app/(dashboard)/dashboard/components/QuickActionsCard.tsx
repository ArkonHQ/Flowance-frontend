'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, FileText, Clock, ListTodo } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function QuickActionsCard() {
  const router = useRouter()

  const actions = [
    {
      label: 'New Project',
      icon: Briefcase,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      hoverBg: 'hover:bg-indigo-500/5',
      hoverBorder: 'hover:border-indigo-500/40',
      onClick: () => router.push('/projects?newProject=1')
    },
    {
      label: 'Create Invoice',
      icon: FileText,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      hoverBg: 'hover:bg-emerald-500/5',
      hoverBorder: 'hover:border-emerald-500/40',
      href: 'invoices/new'
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
      href: 'tasks/new'
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
        {actions.map((action) => {
          const btnContent = (
            <Button
              key={action.label}
              variant="outline"
              className={`h-14 w-full justify-start gap-3 text-xs font-bold border-border/40 rounded-xl group transition-all duration-200 ${action.hoverBg} ${action.hoverBorder} shadow-sm`}
              onClick={action.onClick}
            >
              <div
                className={`h-9 w-9 rounded-xl ${action.bg} ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-sm`}
              >
                <action.icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              {action.label}
            </Button>
          )

          return 'href' in action && action.href ? (
            <Link key={action.label} href={action.href}>
              {btnContent}
            </Link>
          ) : (
            <div key={action.label}>{btnContent}</div>
          )
        })}
      </CardContent>
    </Card>
  )
}