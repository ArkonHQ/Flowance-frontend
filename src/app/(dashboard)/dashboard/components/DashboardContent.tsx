'use client'

import { DashboardData, MonthlyHealthMetric } from "@/lib/api/dashboard"
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
  const [selectPeriod, setSelectPeriod] = useState<string>("current")
  const [dashboard, setDashboard] = useState(initialDashboard)
  const [loading, setLoading] = useState(false)
  
  // Simulate data fetching when period changes to make the dashboard feel "real"
  useEffect(() => {
    if (selectPeriod !== "current") {
      setLoading(true)
      const timer = setTimeout(() => {
        setLoading(false)
        // const newData = await fetchDashboardData(selectPeriod);
        // setDashboard(newData);
      }, 800)
      return () => clearTimeout(timer)
    }
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
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <RevenueOverviewCard
                totalRevenue={dashboard.totalRevenue}
                sourceData={sourceData}
                weeklyHours={weeklyHours}          
                trends={trends.totalRevenue}
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
