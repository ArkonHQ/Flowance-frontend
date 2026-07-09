'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, CheckCircle2, Clock, AlertCircle, FileEdit, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Invoice {
  id: number
  invoiceNumber: number
  amount: number
  status: 'paid' | 'sent' | 'overdue' | 'draft' | 'cancelled' | 'partially_paid'
  clientId: number
  projectId: number
  dueDate: string | Date
  createdAt: string | Date
}

interface RecentInvoicesCardProps {
  invoices?: Invoice[]
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  paid:          { label: 'Paid',         icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  sent:          { label: 'Sent',         icon: Clock,        className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  overdue:       { label: 'Overdue',      icon: AlertCircle,  className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  draft:         { label: 'Draft',        icon: FileEdit,     className: 'bg-muted/80 text-muted-foreground border-border/50' },
  cancelled:     { label: 'Cancelled',    icon: XCircle,      className: 'bg-muted/50 text-muted-foreground/70 border-border/30' },
  partially_paid:{ label: 'Partial',      icon: Clock,        className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
}

const formatDate = (date: string | Date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

export function RecentInvoicesCard({ invoices = [] }: RecentInvoicesCardProps) {
  const hasData = invoices.length > 0

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 pt-5 border-b border-border/10 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <FileText className="h-4 w-4 text-violet-500" />
            </div>
            Recent Invoices
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Latest billing activity</p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/invoices">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="p-3 rounded-full bg-muted/30 mb-3">
              <FileText className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No invoices yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Your recent billing will appear here</p>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {invoices.slice(0, 5).map((invoice) => {
              const config = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.draft
              const StatusIcon = config.icon
              return (
                <motion.div
                  key={invoice.id}
                  variants={itemVariants}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/10 bg-background/30 hover:bg-background/70 hover:border-border/30 transition-all duration-200 cursor-pointer group/item"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg border shrink-0 ${config.className}`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">INV-{String(invoice.invoiceNumber).padStart(3, '0')}</p>
                      <p className="text-[10px] text-muted-foreground">Due {formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold">${invoice.amount.toLocaleString()}</span>
                    <Badge variant="outline" className={`text-[9px] h-4 px-1.5 font-semibold border ${config.className}`}>
                      {config.label}
                    </Badge>
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
