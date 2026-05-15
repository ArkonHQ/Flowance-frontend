import { getClient } from '@/lib/api/clients'
import { getClientInsight } from "@/lib/api/clients";
import InsightsWidget from "@/app/(clients)/clients/components/InsightsWidget";
import DeleteButton from "@/app/(clients)/clients/components/DeleteButton";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: number }>
}

export default async function ClientDetailPage ( { params }: PageProps ) {
    const { id } = await params;
    const clientId = Number(id)
    const client = await getClient(clientId);
    let insights = null

    try{
        insights = await getClientInsight(clientId);
    }catch (err: any) {

    }

    return (
        <div className={'max-w-3xl mx-auto p-6 '}>
            <div className={'flex justify-between items-center mb-6'}>
                <h1 className={' text-3xl font-bold'}>
                    { client.name }
                </h1>
                <div className={'space-x-3'}>
                    <Link
                        href={`/clients/${clientId}/edit`}
                        className={'bg-gray-200 px-4 py-2 rounded hover:bg-gray-300'}>
                        Edit
                    </Link>
                    <DeleteButton clientId={clientId} clientName={ client.name } />
                </div>
            </div>
            <div className={'space-y-2 mb-6'} >
                <p> <strong>Email:</strong> {client.email || '—'}</p>
                <p> <strong>Company:</strong> {client.company || '—'}</p>
                <p> <strong>Created:</strong> {new Date(client.createdAt).toLocaleString()}</p>
            </div>
            {insights && <InsightsWidget insights={insights} />}
        </div>
    )
}