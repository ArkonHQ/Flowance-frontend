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
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  
} from 'lucide-react'
import { motion } from 'framer-motion'

interface StatItem {
  title: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  gradient: string
  trend?: {
    percentage: number
    label: string
  }
}

interface QuickOverviewProps {
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  totalRevenue: number
  totalOverdue: number
  // trends (vs last month)
  totalInvoicesTrend?: number
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
  totalInvoicesTrend,
  paidInvoicesTrend,
  unpaidInvoicesTrend,
  totalRevenueTrend,
  totalOverdueTrend,
}: QuickOverviewProps) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);

  const stats: StatItem[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950',
      gradient: 'from-indigo-600 to-blue-600',
      trend: {
        percentage: totalRevenueTrend || 0,
        label: 'vs last month',
      },
    },
    {
      title: 'Paid',
      value: paidInvoices.toLocaleString(),
      icon: Check,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      gradient: 'from-emerald-600 to-teal-600',
      trend: {
        percentage: paidInvoicesTrend || 0,
        label: 'vs last month',
      },
    },
    {
      title: 'Pending',
      value: unpaidInvoices.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      gradient: 'from-yellow-500 to-amber-500',
      trend: {
        percentage: unpaidInvoicesTrend || 0,
        label: 'vs last month',
      },
    },
    {
      title: 'Overdue',
      value: totalOverdue.toLocaleString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950',
      gradient: 'from-red-500 to-rose-500',
      trend: {
        percentage: totalOverdueTrend || 0,
        label: 'vs last month',
      },
    },
  ]

  // ── Animation ──────────────────────────────────
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8"
    >
      {stats.map((stat) => {
        const trend = stat.trend
        const isUp = trend && trend.percentage > 0
        const isDown = trend && trend.percentage < 0
        const isNeutral = trend && trend.percentage === 0

        let trendColor = 'text-gray-400'
        if (isUp) {
          if (stat.title === 'Pending') trendColor = 'text-yellow-600'
          else if (stat.title === 'Overdue') trendColor = 'text-red-600'
          else trendColor = 'text-green-600'
        } else if (isDown) {
          if (stat.title === 'Pending' || stat.title === 'Overdue') trendColor = 'text-green-600'
          else trendColor = 'text-red-600'
        }

        return (
          <motion.div key={stat.title} variants={item}>
            <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              {/* Gradient accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${stat.gradient}`}
              />

              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </div>

                {/* ── Trend indicator ── */}
                {trend && (
                  <div className="flex items-center gap-1.5">
                    {isUp && (
                      <TrendingUp className={`h-4 w-4 ${trendColor}`} />
                    )}
                    {isDown && (
                      <TrendingDown className={`h-4 w-4 ${trendColor}`} />
                    )}
                    {isNeutral && (
                      <Minus className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${trendColor}`}>
                      {trend.percentage > 0 ? '+' : ''}
                      {trend.percentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {trend.label}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};