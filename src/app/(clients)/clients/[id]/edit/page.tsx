'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getClient, updateClient } from "@/lib/api/clients";
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export default function EditClientPage ({ params }: { params: Promise<{ id: number }> }) {
    const router = useRouter()
    const [ loading, setLoading ] = useState<boolean>(true)
    const [error, setError ] = useState<string>('')
    const [formData, setFormData ] = useState({
        name: '',
        email: '',
        company: '',
    })
    const [initialLoading, setInitialLoading ] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            const { id } = await params

            try{
                const client = await getClient(id)
                setFormData({
                    name: client.name,
                    email: client.email || '',
                    company: client.company || ''
                })
            }catch (err: any) {
                setError('Client not found')
            }finally {
                setInitialLoading(false)
            }
        }
        fetchData()
    }, [params])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try{
            const { id } = await params
            await updateClient(id, formData)
            toast.success('Client updated successfully.')
            router.push(`/clients/${id}`)
        }catch (err: any) {
            setError(err.message || "Failed to update client")
        }finally {
            setLoading(false)
        }
    }

    if (initialLoading) return <div className={'p-6'}>Loading...</div>
    if (error) return <div className={'p-6 text-red-500'}>{error}</div>

    return (
        <div className={"max-w-md mx-auto mt-10 p-6 bg-white rounded shadow"}>
            <h1 className={'text-2xl font-bold mb-4'}>
                Edit Client
            </h1>
            <form onSubmit={handleSubmit} className={'space-y-4'} >
                <div>
                <label className='block text-sm font-medium'>Name *
                    <Input
                        name={'name'}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        />
                </label>
                    </div>
                    <div>
                        <label className='block text-sm font-medium'> Email
                            <Input
                                name={'email'}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label className='block text-sm font-medium'>Company
                            <Input
                                name={'company'}
                                value={formData.company}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={'w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50'}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )



}