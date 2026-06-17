'use client'

import { DashboardData, MonthlyHealthMetric, getDashboard, getLastMonthKPIs, LastMonthKPIs } from "@/lib/api/dashboard"
import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { HeaderBar } from "./HeaderBar"
import { KPIStatsRow } from "./KPIStatsRow"
import { RevenueOverviewCard } from "./RevenueOverviewCard"
import { TopClientsCard } from "./TopClientsCard"
import { TimeTrackingCard } from "./TimeTrackingCard"
import { ProjectHealthCard } from "./ProjectHealthCard"
import { TasksDueCard } from "./TaskDueCard"
import { QuickActionsCard } from "./QuickActionsCard"
import UpcomingTasks from "./UpcomingTasks"


interface DashboardContentProps {
  initialDashboard: DashboardData
  initialHealthMetrics: MonthlyHealthMetric[]
  initialTrends: {
    totalRevenue: number
    activeProjects: number
    totalHours: number
    unpaidInvoices: number
    tasksCompletedThisWeek: number
    unpaidAmount: number
  }
  topClients: any[]
  sourceData: any[]
  weeklyHours: any[]
  pieData: any[]
  userName?: string
}

// Map a selected period to the comparison period (the "previous" window)
const getPrevPeriod = (period: string): string => {
  switch (period) {
    case '7days':   return 'prev7days'
    case '30days':  return 'prev30days'
    case '90days':  return 'prev90days'
    case 'thisyear': return 'lastyear'
    default:        return 'all'
  }
}

// Compute % change between two dashboard snapshots
const computeTrends = (curr: DashboardData, prev: DashboardData | null) => {
  const pct = (c: number, p: number) => {
    if (p === 0) return c > 0 ? 100 : 0
    return Math.round(((c - p) / p) * 100)
  }

  if (!prev) {
    return {
      totalRevenue: 0,
      activeProjects: 0,
      totalHours: 0,
      unpaidInvoices: 0,
      tasksCompletedThisWeek: 0,
      unpaidAmount: 0,
    }
  }

  return {
    totalRevenue:          
      pct(curr.totalRevenue, prev.totalRevenue),
    activeProjects:
      curr.activeProject - prev.activeProject,
    totalHours: 
      pct(curr.totalHours, prev.totalHours),
    unpaidInvoices: 
      pct(curr.pendingInvoices, prev.pendingInvoices),
    tasksCompletedThisWeek:
     pct(curr.tasksCompletedThisWeek, prev.tasksCompletedThisWeek),
    unpaidAmount: 
      pct(curr.unpaidAmount, prev.unpaidAmount),
  }
}

const getPeriodLabel = (period: string) => {
  switch (period) {
    case '7days':    return 'Last Week'
    case '30days':   return 'Last Month'
    case '90days':   return 'Last 90 Days'
    case 'thisyear': return 'This Year'
    default:         return 'All Time'
  }
}

const getTrendLabel = (period: string) => {
  switch (period) {
    case '7days':    return 'vs prev week'
    case '30days':   return 'vs prev month'
    case '90days':   return 'vs prev 90 days'
    case 'thisyear': return 'vs last year'
    default:         return 'vs last month'
  }
}

export const DashboardContent = ({
  initialDashboard,
  initialHealthMetrics,
  initialTrends,
  topClients,
  sourceData,
  weeklyHours,
  pieData,
  userName,
}: DashboardContentProps) => {

  const [selectPeriod, setSelectPeriod] = useState<string>("all")
  const [dashboard, setDashboard] = useState(initialDashboard)
  const [prevDashboard, setPrevDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  const periodLabel = getPeriodLabel(selectPeriod)
  const trendLabel  = getTrendLabel(selectPeriod)

  // Compute live trends from current vs previous period data
  const trends = useMemo(() => {
    if (selectPeriod === 'all') return initialTrends
    return computeTrends(dashboard, prevDashboard)
  }, [dashboard, prevDashboard, selectPeriod, initialTrends])

  // Fetch both current + comparison period in parallel on period change
  useEffect(() => {
    if (selectPeriod === 'all') {
      setDashboard(initialDashboard)
      setPrevDashboard(null)
      return
    }

    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const prevPeriod = getPrevPeriod(selectPeriod)
        const [curr, prev] = await Promise.all([
          getDashboard(undefined, selectPeriod),
          getDashboard(undefined, prevPeriod),
        ])
        if (active) {
          setDashboard(curr)
          setPrevDashboard(prev)
        }
      } catch (err) {
        console.error('Failed to load dashboard for period:', selectPeriod, err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [selectPeriod, initialDashboard])

  // Reload on time-log events
  useEffect(() => {
    const handleTaskTimeLogged = async () => {
      setLoading(true)
      try {
        const periodArg = selectPeriod === 'all' ? undefined : selectPeriod
        const prevPeriod = getPrevPeriod(selectPeriod)
        const [curr, prev] = await Promise.all([
          getDashboard(undefined, periodArg),
          selectPeriod !== 'all' ? getDashboard(undefined, prevPeriod) : Promise.resolve(null as any),
        ])
        setDashboard(curr)
        if (prev) setPrevDashboard(prev)
      } catch (err) {
        console.error('Failed to reload dashboard after time logging:', err)
      } finally {
        setLoading(false)
      }
    }

    window.addEventListener('taskTimeLogged', handleTaskTimeLogged)
    return () => window.removeEventListener('taskTimeLogged', handleTaskTimeLogged)
  }, [selectPeriod])


  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 pb-20">
      <HeaderBar onPeriodChange={setSelectPeriod} userName={userName} />

      {loading ? (
        <div className="flex h-[60vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing performance data...</p>
          </div>
        </div>
      ) : (
        <>
          <KPIStatsRow
            totalRevenue={dashboard.totalRevenue}
            activeProjects={dashboard.activeProject}
            totalHours={dashboard.totalHours}
            unpaidInvoices={dashboard.pendingInvoices}
            tasksCompletedThisWeek={dashboard.tasksCompletedThisWeek}
            unpaidAmount={dashboard.unpaidAmount}
            trends={trends}
            trendLabel={trendLabel}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <RevenueOverviewCard
                totalRevenue={dashboard.totalRevenue}
                sourceData={sourceData}
                weeklyHours={weeklyHours}
                trends={trends.totalRevenue}
                periodLabel={periodLabel}
                trendLabel={trendLabel}
              />
              <UpcomingTasks
                upcomingTasks={dashboard.upcomingTasks}
              />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <TopClientsCard clients={topClients} />
              <TimeTrackingCard 
                totalHours={dashboard.totalHours}
                weeklyHours={weeklyHours}
                trendPercent={trends.totalHours}
                trendLabel={trendLabel}
              />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <ProjectHealthCard 
                total={dashboard.activeProject}
                pieData={pieData}
              />
              <TasksDueCard tasks={dashboard.upcomingTasks} />
              <QuickActionsCard />
          </div>
        </div>
        </>
      )}
    </div>
  )
}
