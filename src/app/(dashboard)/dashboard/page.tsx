export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getDashboard, getMonthlyHealthMetric, getLastMonthKPIs, DashboardData, LastMonthKPIs } from "@/lib/api/dashboard";
import { DashboardContent } from "./components/DashboardContent";

import { getActiveTeamSlug } from "@/lib/utils/team";

// Compute real month-over-month percentage change
const computeTrends = (dashboard: DashboardData, lastMonth: LastMonthKPIs) => {
  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    totalRevenue: pct(dashboard.totalRevenue, lastMonth.totalRevenue),
    activeProjects: dashboard.activeProject - lastMonth.activeProjects,
    totalHours: pct(dashboard.totalHours, lastMonth.totalHours),
    unpaidInvoices: pct(dashboard.pendingInvoices, lastMonth.pendingInvoices),
    tasksCompletedThisWeek: pct(dashboard.tasksCompletedThisWeek, lastMonth.tasksCompleted),
    unpaidAmount: pct(dashboard.unpaidAmount, lastMonth.unpaidAmount),
  };
};

const DashboardPage = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const teamSlug = await getActiveTeamSlug(cookieHeader);

  const [dashboard, healthMetrics, lastMonth] = await Promise.all([
    getDashboard(cookieHeader, undefined, teamSlug),
    getMonthlyHealthMetric(cookieHeader, teamSlug),
    getLastMonthKPIs(cookieHeader, teamSlug),
  ]);

  const trends = computeTrends(dashboard, lastMonth);

  const topClients: any[] = [];
  const sourceData: any[] = [];
  const weeklyHours: any[] = [];
  const pieData: any[] = [];

  return (
    <DashboardContent
      initialDashboard={dashboard}
      initialHealthMetrics={healthMetrics}
      initialTrends={trends}
      topClients={topClients}
      sourceData={sourceData}
      weeklyHours={weeklyHours}
      pieData={pieData}
    />
  );
};

export default DashboardPage;