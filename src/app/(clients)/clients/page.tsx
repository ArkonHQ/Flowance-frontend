
import { getAllClients, getClientInsight, ClientInsight } from '@/lib/api/clients';
import ClientPage from './components/ClientList';
import { cookies } from 'next/headers';
import type { Client } from '@/lib/api/clients';
import { getActiveTeamSlug } from '@/lib/utils/team';



export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const teamSlug = await getActiveTeamSlug(cookieHeader);

  let clients: Client[] = [];
  try {
    clients = await getAllClients(cookieHeader, teamSlug);
  } catch (err: any) {
    console.error("Failed to fetch clients:", err.message);
  }

  let insights: ClientInsight[] = [];
  try {
    insights = await getClientInsight(undefined, cookieHeader, teamSlug) || [];
  } catch (err: any) {
    console.error("Failed to fetch client insights:", err.message);
  }

  const insightMap = new Map<number, ClientInsight>(
    insights.map((i: ClientInsight) => [Number(i.clientId), i])
  );

  return <ClientPage initialClients={clients} insightMap={insightMap} statusFilter={status} />;
}
