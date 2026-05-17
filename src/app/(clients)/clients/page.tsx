
import { getAllClients, getClientInsight, ClientInsight } from '@/lib/api/clients';
import ClientPage from './components/ClientList';
import { cookies, headers } from 'next/headers';

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const headerStore = await headers();

  console.log("[FRONTEND DEBUG] All headers received by Next.js:", headerStore.toString());
  console.log("[FRONTEND DEBUG] Incoming cookieHeader:", cookieHeader);

  let clients: any[] = [];
  try {
    clients = await getAllClients(cookieHeader);
  } catch (err: any) {
    console.error("[FRONTEND DEBUG] Failed to fetch clients:", err.message);
  }

  let insights: any[] = [];
  try {
    insights = await getClientInsight(undefined, cookieHeader) || [];
  } catch (err: any) {
    console.error("[FRONTEND DEBUG] Failed to fetch client insights:", err.message);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  const insightMap = new Map<number, ClientInsight>(
    insights.map((i: any) => [Number(i.id), i])
  );

  return <ClientPage initialClients={clients} insightMap={insightMap} statusFilter={status} />;
}
