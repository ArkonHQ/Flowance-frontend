export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getDashboard, getMonthlyHealthMetric, DashboardData, MonthlyHealthMetric } from "@/lib/api/dashboard";
import { DashboardContent } from "./components/DashboardContent";

// Helper to compute trends from monthly health metrics
const computeTrends = (dashboard: DashboardData, healthMetrics: MonthlyHealthMetric[]) => {
  const zero = {
    totalRevenue: 0,
    activeProjects: 0,
    totalHours: 0,
    pendingInvoices: 0,
    tasksCompletedThisWeek: 0,
    unpaidAmount: 0,
  };

  if (healthMetrics.length < 2) return zero;

  const current = healthMetrics[healthMetrics.length - 1];
  const previous = healthMetrics[healthMetrics.length - 2];

  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    totalRevenue: pct(dashboard.totalRevenue, previous.active_count),
    activeProjects: pct(dashboard.activeProject, previous.active_count),
    totalHours: pct(dashboard.totalHours, previous.active_count),
    pendingInvoices: pct(dashboard.pendingInvoices, previous.active_count),
    tasksCompletedThisWeek: pct(dashboard.tasksCompletedThisWeek, previous.active_count),
    unpaidAmount: pct(dashboard.unpaidAmount, previous.active_count),
  };
};

const DashboardPage = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [dashboard, healthMetrics] = await Promise.all([
    getDashboard(cookieHeader),
    getMonthlyHealthMetric(cookieHeader),
  ]);

  const trends = computeTrends(dashboard, healthMetrics);

  const topClients: any[] = [];
  const sourceData: any[] = [];
  const weeklyHours: any[] = [];
  const pieData: any[] = [];

  return (
    <DashboardContent
      initialDashboard={dashboard}
      initialHealthMetrics={healthMetrics}
      trends={trends}
      topClients={topClients}
      sourceData={sourceData}
      weeklyHours={weeklyHours}
      pieData={pieData}
    />
  );
};

export default DashboardPage;