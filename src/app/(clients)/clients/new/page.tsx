'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from "@/lib/api/clients";
import { toast } from "sonner";
import {Input} from "@/components/ui/input";
import { PermissionGuard } from '@/app/components/permission-guard';

export default function NewClientPage () {
    const router = useRouter();
    const [ loading, setLoading ] = useState(false);
    const [formData, setFormData ] = useState({
        name: '',
        email: '',
        company: '',
    })
    const [error, setError ] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [event.target.name]: event.target.value});
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('')

        try {
            await createClient(formData)
            toast.success('Client created successfully.')
            router.push('/clients')
        }catch (error: any) {
            setError(error.message || 'Failed to create client.');
        }finally {
            setLoading(false);
        }
    }

    return (
        <PermissionGuard actionName="create new clients">
            <div className={'max-w-md mx-auto mt-10 p-6 bg-white rounded shadow'}>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-200">
                    Create New Client
                </h1>
                    {error &&
                        <p className={'text-red-500 mb-4'}>{error}</p>
                    }
                    <form className={'space-y-4'} onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium">Name *</label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Company</label>
                            <Input
                            type='text'
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            />
                        </div>
                            <button
                                disabled={loading}
                                type="submit"
                                className={'w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'}>
                                {loading ? 'Creating...' : 'Create Client'}
                            </button>
                    </form>
                </div>
        </PermissionGuard>
    )

}
