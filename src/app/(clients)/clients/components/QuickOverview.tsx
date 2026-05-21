'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Users,
  CheckCircle,
  DollarSign,
  Clock,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
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
  totalClients: number
  activeClients: number
  totalRevenue: number
  pendingPayments: number 
  avgProjectValue: number
  // trend percentages (vs last month)
  totalClientsTrend?: number
  activeClientsTrend?: number
  totalRevenueTrend?: number
  pendingPaymentsTrend?: number
  avgProjectValueTrend?: number
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export const QuickOverview = ({
  totalClients,
  activeClients,
  totalRevenue,
  pendingPayments,
  avgProjectValue,
  totalClientsTrend = 0,
  activeClientsTrend = 0,
  totalRevenueTrend = 0,
  pendingPaymentsTrend = 0,
  avgProjectValueTrend = 0,
}: QuickOverviewProps) => {
  const stats: StatItem[] = [
    {
      title: 'Total Clients',
      value: totalClients.toLocaleString(),
      icon: Users,
      color: 'text-indigo-500',
      bg: 'bg-indigo-100 dark:bg-indigo-950',
      gradient: 'from-indigo-500 to-blue-500',
      trend: {
        percentage: totalClientsTrend,
        label: 'vs last month',
      },
    },
    {
      title: 'Active Clients',
      value: activeClients.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-950',
      gradient: 'from-green-500 to-emerald-500',
      trend: {
        percentage: activeClientsTrend,
        label: 'vs last month',
      },
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-950',
      gradient: 'from-emerald-500 to-teal-500',
      trend: {
        percentage: totalRevenueTrend,
        label: 'vs last month',
      },
    },
    {
      title: 'Pending Payments',
      value: `$${pendingPayments.toLocaleString()}`,
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-950',
      gradient: 'from-orange-500 to-amber-500',
      trend: {
        percentage: pendingPaymentsTrend,
        label: 'vs last month',
      },
    },
    {
      title: 'Avg. Project Value',
      value: `$${avgProjectValue.toLocaleString()}`,
      icon: Briefcase,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-950',
      gradient: 'from-purple-500 to-pink-500',
      trend: {
        percentage: avgProjectValueTrend,
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
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8"
    >
      {stats.map((stat) => {
        const trend = stat.trend
        const isUp = trend && trend.percentage > 0
        const isDown = trend && trend.percentage < 0
        const isNeutral = trend && trend.percentage === 0

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
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                    {isDown && (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    {isNeutral && (
                      <Minus className="h-4 w-4 text-gray-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isUp
                          ? 'text-green-600'
                          : isDown
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {Math.abs(trend.percentage)}%{' '}
                      {isUp ? 'more' : isDown ? 'less' : 'no change'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {trend.label}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )


  // Skeleton
function QuickOverviewSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
      {Array(5).fill(0).map((_, i) => (
        <Card key={i} className="p-4 border border-border/30">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </Card>
      ))}
    </div>
  )
}

// Error
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="rounded-full bg-destructive/10 p-4 mx-auto w-fit">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <p className="text-destructive font-medium">Failed to load dashboard stats</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  )
}


}