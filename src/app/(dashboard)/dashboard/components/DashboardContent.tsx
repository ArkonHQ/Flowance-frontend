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
import UpcomingTasks from "./UpcomingTasks"
import { TodaysFocusCard } from "./TodaysFocusCard"
import { TeamOverviewCard } from "./TeamOverviewCard"
import { ProductivitySummaryCard } from "./ProductivitySummaryCard"
import { RecentInvoicesCard } from "./RecentInvoicesCard"
import { ProjectPerformanceCard } from "./ProjectPerformanceCard"
import { RecentActivityCard } from "./RecentActivityCard"


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
  hoursChartData?: any[]
  pieData: any[]
  userName?: string
  recentInvoices?: any[]
  teamMembers?: any[]
  allClientInsights?: any[]
  allInvoices?: any[]
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
  hoursChartData = [],
  pieData,
  userName,
  recentInvoices = [],
  teamMembers = [],
  allClientInsights = [],
  allInvoices = [],
}: DashboardContentProps) => {

  const [selectPeriod, setSelectPeriod] = useState<string>("all")
  const [dashboard, setDashboard] = useState(initialDashboard)
  const [prevDashboard, setPrevDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  // Independent card periods
  const [revenuePeriod, setRevenuePeriod] = useState<string>("all")
  const [timePeriod, setTimePeriod] = useState<string>("all")
  const [clientsPeriod, setClientsPeriod] = useState<string>("all")

  const [revenueDashboard, setRevenueDashboard] = useState<DashboardData | null>(null)
  const [timeDashboard, setTimeDashboard] = useState<DashboardData | null>(null)
  const [clientsDashboard, setClientsDashboard] = useState<DashboardData | null>(null)

  const periodLabel = getPeriodLabel(selectPeriod)
  const trendLabel  = getTrendLabel(selectPeriod)

  const dynamicRevenueChart = useMemo(() => {
    const now = Date.now();
    let start = 0;
    if (revenuePeriod === '7days') start = now - 7 * 24 * 60 * 60 * 1000;
    else if (revenuePeriod === '30days') start = now - 30 * 24 * 60 * 60 * 1000;
    else if (revenuePeriod === '90days') start = now - 90 * 24 * 60 * 60 * 1000;
    else if (revenuePeriod === 'thisyear') start = new Date(new Date().getFullYear(), 0, 1).getTime();

    const filtered = allInvoices.filter(inv => {
      if (inv.status !== 'paid') return false;
      if (start > 0 && new Date(inv.createdAt).getTime() < start) return false;
      return true;
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<string, number> = {};
    for (const inv of filtered) {
      const d = new Date(inv.createdAt);
      let key;
      if (revenuePeriod === '7days') {
          key = days[d.getDay()];
      } else if (revenuePeriod === '30days') {
          key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
          key = d.toLocaleDateString('en-US', { month: 'short' });
      }
      map[key] = (map[key] || 0) + (Number(inv.amount) || 0);
    }
    
    // For 7days we should map over the last 7 days so empty days show 0 like TimeTrackingCard
    if (revenuePeriod === '7days') {
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now - i * 24 * 60 * 60 * 1000);
            const name = days[d.getDay()];
            weeklyData.push({ name, revenue: map[name] || 0 });
        }
        return weeklyData;
    }

    // Sort keys by actual date for chronological order for the rest
    const sortedKeys = Object.keys(map).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return sortedKeys.slice(-8).map(name => ({ name, revenue: map[name] }));
  }, [allInvoices, revenuePeriod]);

  const dynamicTopClients = useMemo(() => {
    const now = Date.now();
    let start = 0;
    if (clientsPeriod === '7days') start = now - 7 * 24 * 60 * 60 * 1000;
    else if (clientsPeriod === '30days') start = now - 30 * 24 * 60 * 60 * 1000;
    else if (clientsPeriod === '90days') start = now - 90 * 24 * 60 * 60 * 1000;
    else if (clientsPeriod === 'thisyear') start = new Date(new Date().getFullYear(), 0, 1).getTime();

    const filtered = allInvoices.filter(inv => {
      if (inv.status !== 'paid') return false;
      if (start > 0 && new Date(inv.createdAt).getTime() < start) return false;
      return true;
    });

    const revenueByClient: Record<string, number> = {};
    for (const inv of filtered) {
        revenueByClient[inv.clientId] = (revenueByClient[inv.clientId] || 0) + (Number(inv.amount) || 0);
    }

    const clients = allClientInsights.map(c => {
        const revenue = clientsPeriod === 'all' ? (c.totalRevenue || 0) : (revenueByClient[c.clientId] || 0);
        return {
            name: c.name,
            revenue,
            percent: 0,
            color: 'text-blue-500',
            balance: c.unpaidAmount ?? 0,
        };
    });

    return clients.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((c, i, arr) => {
        c.percent = Math.round((c.revenue / (arr[0]?.revenue || 1)) * 100);
        return c;
    });
  }, [allInvoices, allClientInsights, clientsPeriod]);

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

  // Sync global period to local periods when global changes
  useEffect(() => {
    setRevenuePeriod(selectPeriod)
    setTimePeriod(selectPeriod)
    setClientsPeriod(selectPeriod)
  }, [selectPeriod])

  // Independent fetches
  useEffect(() => {
    if (revenuePeriod === selectPeriod) return;
    getDashboard(undefined, revenuePeriod).then(setRevenueDashboard).catch(console.error)
  }, [revenuePeriod, selectPeriod])

  useEffect(() => {
    if (timePeriod === selectPeriod) return;
    getDashboard(undefined, timePeriod).then(setTimeDashboard).catch(console.error)
  }, [timePeriod, selectPeriod])

  useEffect(() => {
    if (clientsPeriod === selectPeriod) return;
    getDashboard(undefined, clientsPeriod).then(setClientsDashboard).catch(console.error)
  }, [clientsPeriod, selectPeriod])

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

          <div className="flex flex-col space-y-6">
            {/* Today's Focus */}
            <TodaysFocusCard 
              highPriorityTasks={dashboard.upcomingTasks?.filter(t => t.priority === 'High')?.length || 0}
              pendingInvoices={dashboard.pendingInvoices}
              atRiskProjects={dashboard.atRiskProjects?.length || 0}
              unpaidAmount={dashboard.unpaidAmount}
            />

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Analytics Section */}
              <div className="lg:col-span-8 flex flex-col space-y-6">
                <RevenueOverviewCard
                  totalRevenue={(revenuePeriod === selectPeriod ? dashboard : revenueDashboard || dashboard).totalRevenue}
                  weeklyHours={dynamicRevenueChart.length > 0 ? dynamicRevenueChart : weeklyHours}
                  trends={trends.totalRevenue}
                  periodLabel={getPeriodLabel(revenuePeriod)}
                  trendLabel={getTrendLabel(revenuePeriod)}
                  selectPeriod={revenuePeriod}
                  onPeriodChange={setRevenuePeriod}
                />
                <TimeTrackingCard 
                  totalHours={(timePeriod === selectPeriod ? dashboard : timeDashboard || dashboard).totalHours}
                  trendPercent={trends.totalHours}
                  weeklyHours={timePeriod === selectPeriod
                    ? (dashboard.weeklyHours?.length > 0 ? dashboard.weeklyHours : hoursChartData)
                    : (timeDashboard?.weeklyHours?.length > 0 ? timeDashboard.weeklyHours : hoursChartData)
                  }
                  trendLabel={getTrendLabel(timePeriod)}
                  selectPeriod={timePeriod}
                  onPeriodChange={setTimePeriod}
                  periodLabel={getPeriodLabel(timePeriod)}
                />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 flex flex-col space-y-6 h-full">
                <ProjectHealthCard 
                  activeCount={dashboard.activeProject}
                  total={dashboard.activeProject}
                  pieData={pieData}
                />
                <TasksDueCard tasks={dashboard.upcomingTasks} />
              </div>
            </div>

            {/* Performance Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 h-full">
                <TopClientsCard 
                  clients={dynamicTopClients.length > 0 ? dynamicTopClients : topClients} 
                  selectPeriod={clientsPeriod}
                  onPeriodChange={setClientsPeriod}
                  periodLabel={getPeriodLabel(clientsPeriod)}
                />
              </div>
              <div className="lg:col-span-4 h-full">
                <TeamOverviewCard workload={dashboard.teamWorkload} members={teamMembers} />
              </div>
              <div className="lg:col-span-4 h-full">
                <ProductivitySummaryCard 
                  tasksCompleted={dashboard.tasksCompletedThisWeek}
                  totalHours={dashboard.totalHours}
                  trendPercent={trends.tasksCompletedThisWeek}
                  trendLabel={trendLabel}
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 h-full">
                <RecentInvoicesCard invoices={recentInvoices} />
              </div>
              <div className="lg:col-span-4 h-full">
                <RecentActivityCard activity={dashboard.recentActivity} />
              </div>
              <div className="lg:col-span-4 h-full">
                <ProjectPerformanceCard 
                  totalProjects={dashboard.activeProject}
                  atRiskProjects={dashboard.atRiskProjects?.length || 0}
                  completedTasks={dashboard.tasksCompletedThisWeek}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
