'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  DollarSign,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

interface SparklineProps {
  color: 'indigo' | 'emerald' | 'amber' | 'rose'
}

const Sparkline = ({ color }: SparklineProps) => {
  const configs = {
    indigo: {
      path: "M 0 15 C 10 10, 15 18, 25 5 C 35 2, 40 10, 50 15 C 55 12, 58 6, 65 3",
      stroke: "#818cf8"
    },
    emerald: {
      path: "M 0 16 C 15 15, 25 10, 35 12 C 45 8, 50 4, 65 2",
      stroke: "#34d399"
    },
    amber: {
      path: "M 0 15 C 15 18, 25 12, 35 10 C 45 8, 50 14, 65 8",
      stroke: "#fbbf24"
    },
    rose: {
      path: "M 0 8 C 15 15, 25 4, 35 10 C 45 12, 50 6, 65 2",
      stroke: "#f87171"
    }
  }

  const active = configs[color] || configs.indigo

  return (
    <svg className="w-16 h-7 overflow-visible" viewBox="0 0 65 20">
      <path
        d={active.path}
        fill="none"
        stroke={active.stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface StatItem {
  title: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
  iconColor: string
  sparklineColor: 'indigo' | 'emerald' | 'amber' | 'rose'
  trend: {
    percentage: number
    label: string
  }
}

interface QuickOverviewProps {
  totalInvoices: number
  paidInvoices: number // This is amount sum in mockup match
  unpaidInvoices: number // This is amount sum in mockup match
  totalRevenue: number
  totalOverdue: number // This is amount sum in mockup match
  // trends
  paidInvoicesTrend?: number
  unpaidInvoicesTrend?: number
  totalRevenueTrend?: number
  totalOverdueTrend?: number
}

export const QuickOverview = ({
  totalInvoices,
  paidInvoices,
  unpaidInvoices,
  totalRevenue,
  totalOverdue,
  paidInvoicesTrend = 8.2,
  unpaidInvoicesTrend = 4.1,
  totalRevenueTrend = 12.5,
  totalOverdueTrend = 3.7,
}: QuickOverviewProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);

  const stats: StatItem[] = [
    {
      title: 'Total Revenue',
      value: totalRevenue,
      icon: DollarSign,
      color: 'border-slate-100 dark:border-border/30',
      bg: 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100/30 dark:border-indigo-900/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      sparklineColor: 'indigo',
      trend: {
        percentage: totalRevenueTrend || 12.5,
        label: 'from last month',
      },
    },
    {
      title: 'Paid',
      value: paidInvoices,
      icon: Check,
      color: 'border-slate-100 dark:border-border/30',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-100/30 dark:border-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      sparklineColor: 'emerald',
      trend: {
        percentage: paidInvoicesTrend || 8.2,
        label: 'from last month',
      },
    },
    {
      title: 'Pending',
      value: unpaidInvoices,
      icon: Clock,
      color: 'border-slate-100 dark:border-border/30',
      bg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-100/30 dark:border-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      sparklineColor: 'amber',
      trend: {
        percentage: unpaidInvoicesTrend || 4.1,
        label: 'from last month',
      },
    },
    {
      title: 'Overdue',
      value: totalOverdue,
      icon: AlertCircle,
      color: 'border-slate-100 dark:border-border/30',
      bg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-100/30 dark:border-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      sparklineColor: 'rose',
      trend: {
        percentage: totalOverdueTrend || 3.7,
        label: 'from last month',
      },
    },
  ]

  // ── Animation ──────────────────────────────────
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4"
    >
      {stats.map((stat) => {
        const trend = stat.trend
        const isUp = trend.percentage > 0
        const isDown = trend.percentage < 0

        let trendColor = 'text-slate-500'
        if (stat.sparklineColor === 'emerald' || stat.sparklineColor === 'indigo') {
          trendColor = 'text-emerald-600 dark:text-emerald-400'
        } else if (stat.sparklineColor === 'amber') {
          trendColor = 'text-amber-600 dark:text-amber-400'
        } else if (stat.sparklineColor === 'rose') {
          trendColor = 'text-rose-600 dark:text-rose-400'
        }

        return (
          <motion.div key={stat.title} variants={item}>
            <Card className="relative overflow-hidden border border-slate-150/60 dark:border-border/30 bg-white/70 dark:bg-card/25 backdrop-blur-md shadow-2xs hover:shadow-xs transition-all duration-300 rounded-[20px] px-5 py-4">
              
              {/* Card Top Title & Icon */}
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-semibold text-muted-foreground/85">
                  {stat.title}
                </span>
                <div className={cn("rounded-full p-2 border flex items-center justify-center h-8.5 w-8.5 shadow-3xs", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.iconColor)} strokeWidth={2.4} />
                </div>
              </div>

              {/* Card Body (Value & Sparkline/Trend) */}
              <div className="space-y-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {formatCurrency(stat.value)}
                </div>

                {/* Trend Info and SVG Sparkline */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className={cn("text-xs font-bold", trendColor)}>
                      {isUp ? '+' : ''}{trend.percentage.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground/80">
                      {trend.label}
                    </span>
                  </div>
                  
                  {/* Custom sparkline drawing */}
                  <Sparkline color={stat.sparklineColor} />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};