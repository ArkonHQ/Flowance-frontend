'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteClient } from '@/lib/api/clients';
import { toast } from 'sonner';

interface Props {
    clientId: number;
    clientName: string;
    redirectAfterDelete?: boolean;
}

export default function DeleteButton({ clientId, clientName, redirectAfterDelete = true }: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteClient(clientId);
            toast.success(`${clientName} deleted successfully`);
            if (redirectAfterDelete) {
                router.push('/clients');
            } else {
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || 'Delete failed');
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
                Delete
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-6">
                            Are you sure you want to delete <strong>{clientName}</strong>? This action is permanent.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}