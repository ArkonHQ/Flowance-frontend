export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { getDashboard, getMonthlyHealthMetric, getLastMonthKPIs, DashboardData, LastMonthKPIs } from "@/lib/api/dashboard";
import { DashboardContent } from "./components/DashboardContent";
import { getActiveTeamSlug } from "@/lib/utils/team";
import { getAllInvoices } from "@/lib/api/invoices";
import { getClientInsight } from "@/lib/api/clients";
import { getTeam } from "@/lib/api/teams";

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

// Build pieData from actual project progress
const buildPieData = (projectProgress: Array<{ id: number; name: string; progress: number }>) => {
  const completed = projectProgress.filter(p => p.progress >= 100).length;
  const inProgress = projectProgress.filter(p => p.progress > 0 && p.progress < 100).length;
  const notStarted = projectProgress.filter(p => p.progress === 0).length;
  return [
    { name: 'Done', value: completed, color: '#22c55e' },
    { name: 'Active', value: inProgress, color: '#3b82f6' },
    { name: 'Queued', value: notStarted, color: '#64748b' },
  ].filter(d => d.value > 0);
};

// Build real revenue chart data from paid invoices per month
const buildRevenueChartData = (invoices: Array<any>) => {
  const months: Record<string, number> = {};
  for (const inv of invoices) {
    if (inv.status !== 'paid') continue;
    const d = new Date(inv.createdAt);
    const key = d.toLocaleDateString('en-US', { month: 'short' });
    months[key] = (months[key] || 0) + (Number(inv.amount) || 0);
  }
  return Object.entries(months).slice(-8).map(([name, revenue]) => ({ name, revenue }));
};

const DashboardPage = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const teamSlug = await getActiveTeamSlug(cookieHeader);

  const [dashboard, healthMetrics, lastMonth, recentInvoices, clientInsights, teamDetails] = await Promise.all([
    getDashboard(cookieHeader, undefined, teamSlug),
    getMonthlyHealthMetric(cookieHeader, teamSlug),
    getLastMonthKPIs(cookieHeader, teamSlug),
    getAllInvoices(cookieHeader, teamSlug).catch(() => []),
    getClientInsight(undefined, cookieHeader, teamSlug).catch(() => []),
    getTeam(teamSlug, cookieHeader).catch(() => null),
  ]);

  const trends = computeTrends(dashboard, lastMonth);

  // Build top clients from clientInsights (sorted by totalRevenue)
  const clientInsightList = Array.isArray(clientInsights) ? clientInsights : (clientInsights ? [clientInsights] : []);
  const sortedClients = [...clientInsightList].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);
  const maxRevenue = sortedClients[0]?.totalRevenue || 1;
  const topClients = sortedClients.map((c: any) => ({
    name: c.name,
    revenue: c.totalRevenue ?? 0,
    percent: Math.round((c.totalRevenue / maxRevenue) * 100),
    color: 'text-blue-500',
    balance: c.unpaidAmount ?? 0,
  }));

  // Hours chart: real weekly time entries from the backend
  const hoursChartData = dashboard.weeklyHours || [];

  // Revenue chart: build from actual paid invoices
  const revenueChartData = buildRevenueChartData(recentInvoices || [])

  const pieData = buildPieData(dashboard.projectProgress || []);

  // Sort invoices newest first and take top 5
  const sortedInvoices = [...recentInvoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const teamMembers = teamDetails?.members?.map((m: any) => ({
    id: m.userId,
    name: m.userName,
    image: m.userAvatar,
    status: m.status,
    lastActiveAt: m.lastActiveAt,
  })) || [];

  return (
    <DashboardContent
      initialDashboard={dashboard}
      initialHealthMetrics={healthMetrics}
      initialTrends={trends}
      topClients={topClients}
      allClientInsights={clientInsightList}
      allInvoices={recentInvoices}
      sourceData={[]}
      weeklyHours={revenueChartData}
      hoursChartData={hoursChartData}
      pieData={pieData}
      recentInvoices={sortedInvoices}
      teamMembers={teamMembers}
    /> 
  );
};

export default DashboardPage;