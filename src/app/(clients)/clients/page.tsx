'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClientCard } from './component';
import { PlusIcon } from 'lucide-react';
import { getAllClients } from '@/lib/api/clients';
import type { Client } from '@/lib/api/clients';

const ClientPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAllClients()
            .then(setClients)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <ClientsLoadingSkeleton />;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Clients</h1>
                <Link href="/clients/new" className="btn-primary flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" />
                    New Client
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">You haven't added any clients yet.</p>
                    <Link href="/clients/new" className="mt-4 inline-block text-indigo-500">
                        Add your first client
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Loading skeleton UI
const ClientsLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-300 rounded"></div>
            </div>
        ))}
    </div>
);

export default ClientPage;