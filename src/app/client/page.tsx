import { Suspense } from "react";
import { getClients } from "@/lib/api/clients";
import Link from "next/link";
import { ClientCard } from "./component";
import React from 'react'
import { PlusIcon } from "lucide-react";

// Server component that fetches data directly
const ClientList = async () => {

    const clients = await getClients()

    if (clients.length === 0) {
        return (<div className="text-center py-12">
            <p className="text-gray-500">
                You haven't added any clients yet.
            </p>
            <Link href="/clients/new" className="mt-4 inline-block text-indigo-500 hover:text-indigo-400">
                Add your first client
            </Link>
        </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
                <ClientCard key={client.id} client={client} />
            ))
            }
        </div>
    )
}

// Main page component
export default function ClientPage() {
    return (
        <div className="container mx-auto">
            <div className="flex justify-center items-center mb-6">
                <h1 className="text-2xl font-bold">Clients</h1>
                <Link href="/clients/new" className="btn-primary flex item-center gap-2" >
                    <PlusIcon className="w-4 h-4">
                        New Client
                    </PlusIcon>
                </Link>
            </div>

            {/* Add fallback UI */}
            <Suspense fallback={<ClientsLoadingSkeleton />}>
                <ClientList />
            </Suspense>
        </div>
    )
}

// loading skeleton UI
const ClientsLoadingSkeleton = () => (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-300 rounded">
                </div>
            </div>
        ))}
    </div>
);