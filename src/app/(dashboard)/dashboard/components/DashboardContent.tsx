'use client'

import { DashboardData, MonthlyHealthMetric, getDashboard } from "@/lib/api/dashboard"
import { useState, useEffect } from "react"
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
  trends: any
  topClients: any[]
  sourceData: any[]
  weeklyHours: any[]
  pieData: any[]
  userName?: string
}


export const DashboardContent = ({ initialDashboard, initialHealthMetrics, trends, topClients, sourceData, weeklyHours, pieData, userName }: DashboardContentProps) => {
  
  // Period can be changed by header HeaderBar date picker
  const [selectPeriod, setSelectPeriod] = useState<string>("all")
  const [dashboard, setDashboard] = useState(initialDashboard)
  const [loading, setLoading] = useState(false)

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7days':
        return 'Last Week'
      case '30days':
        return 'Last Month'
      case '90days':
        return 'Last 90 Days'
      case 'thisyear':
        return 'This Year'
      default:
        return 'All Time'
    }
  }

  const getTrendLabel = (period: string) => {
    switch (period) {
      case '7days':
        return 'vs last Week'
      case '30days':
        return 'vs last Month'
      case '90days':
        return 'vs last 90 Days'
      case 'thisyear':
        return 'vs this Year'
      default:
        return 'vs all Time'
    }
  }

  const periodLabel = getPeriodLabel(selectPeriod)
  const trendLabel = getTrendLabel(selectPeriod)

  const reloadDashboard = async (period: string) => {
    setLoading(true)
    try {
      const periodArg = period === 'all' ? undefined : period
      const newData = await getDashboard(undefined, periodArg)
      setDashboard(newData)
    } catch (error) {
      console.error('Failed to reload dashboard after time logging:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectPeriod === 'all') {
      setDashboard(initialDashboard)
      return
    }

    let active = true

    const loadDashboard = async () => {
      setLoading(true)
      try {
        const newData = await getDashboard(undefined, selectPeriod)
        if (active) {
          setDashboard(newData)
        }
      } catch (error) {
        console.error('Failed to load dashboard for period:', selectPeriod, error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [selectPeriod, initialDashboard])

  useEffect(() => {
    const handleTaskTimeLogged = () => {
      reloadDashboard(selectPeriod)
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
