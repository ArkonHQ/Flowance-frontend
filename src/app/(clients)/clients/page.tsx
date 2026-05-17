
import { getAllClients, getClientInsight, ClientInsight } from '@/lib/api/clients';
import ClientPage from './components/ClientList';
import { cookies } from 'next/headers';

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let clients: any[] = [];
  try {
    clients = await getAllClients(cookieHeader);
  } catch (err: any) {
    console.error("Failed to fetch clients:", err.message);
  }

  let insights: any[] = [];
  try {
    insights = await getClientInsight(undefined, cookieHeader) || [];
  } catch (err: any) {
    console.error("Failed to fetch client insights:", err.message);
  }

  const insightMap = new Map<number, ClientInsight>(
    insights.map((i: any) => [Number(i.clientId), i])
  );

  return <ClientPage className="w-full" initialClients={clients} insightMap={insightMap} statusFilter={status} />;
}
