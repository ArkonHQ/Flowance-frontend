'use client'

import { DashboardData, MonthlyHealthMetric } from "@/lib/api/dashboard"
import { useState, useEffect } from "react"
import { HeaderBar } from "./HeaderBar"
import { KPIStatCard } from "./KPIStatCard"
import { KPIStatsRow } from "./KPIStatsRow"
import { RevenueOverviewCard } from "./RevenueOverviewCard"
import { TopClientsCard } from "./TopClientsCard"
import { TimeTrackingCard } from "./TimeTrackingCard"
import { ProjectHealthCard } from "./ProjectHealthCard"
import { TasksDueCard } from "./TaskDueCard"
import { QuickActionsCard } from "./QuickActionsCard"


interface DashboardContentProps {
  initialDashboard: DashboardData
  initialHealthMetrics: MonthlyHealthMetric[]
  trends: any
  topClients: any[]
  sourceData: any[]
  weeklyHours: any[]
  pieData: any[]
}


export const DashboardContent = ({ initialDashboard, initialHealthMetrics, trends, topClients, sourceData, weeklyHours, pieData }: DashboardContentProps) => {
  
  // Period can be changed by header HeaderBar date picker
  const [selectPeriod, setSelectPeriod] = useState<string>("current")
  const [dashboard, setDashboard] = useState(initialDashboard)
  const [loading, setLoading] = useState(false)
  
  
  
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-8 pb-20">
      <HeaderBar onPeriodChange={setSelectPeriod} />

      <KPIStatsRow
        totalRevenue={dashboard.totalRevenue}
        activeProjects={dashboard.activeProject}
        totalHours={dashboard.totalHours}
        pendingInvoices={dashboard.pendingInvoices}
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
          />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <TopClientsCard 
            clients={topClients}
          />
          <TimeTrackingCard 
            totalHours={dashboard.totalHours}
            weeklyHours={weeklyHours}
            />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <ProjectHealthCard 
            total={dashboard.activeProject}
            pieData={pieData}
            />
          <TasksDueCard 
            tasks={dashboard.upcomingTasks}
            />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <QuickActionsCard />
        </div>
      </div>
    </div>
  )
}
