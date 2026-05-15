'use clients'

import Link from 'next/link'
import { Client } from "@/lib/api/clients"
import { Mail, Building2, MoreVertical } from 'lucide-react'


interface ClientCard {
    client: Client
    onDelete?: (id: number) => void
}

export const ClientCard = ({ client, onDelete }: ClientCard) => {
    return (
        <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow'>
            <div className='p-6'>
                {/* Header with name and menu */}
                <div className='flex justify-between item-start mb-3'>
                    <Link href={`/freelance-command-center/src/app/(clients)/clients/${client.id}`} className='flex-1'>
                        <h3 className='text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors'>
                            {client.name}
                        </h3>
                    </Link>


                    {/* Dropdown menu */}
                    <div className='relative group'>
                        <button className='p-1 hover:bg-gray-100 rounded'>
                            <MoreVertical className='w-4 h-4 text-gray-500 group-hover:text-gray-700 ' />
                        </button> 
                        <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10'>
                            <Link
                                href={`/clients/${client.id}/edit`}
                                className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => onDelete?.(client.id)}
                                className='block w-full text-left px-4 py-2 text-sm text-red-600 hover-bg-gray-100'
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
                {/* Company info */}
                {client.company && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <Building2 className="w-4 h-4" />
                        <span>{client.company}</span>
                    </div>
                )}

                {/* Email */}
                {client.email && (
                    <div className='flex item-center gap-2 text-sm text-gray-500'>
                        <Mail className='h-4 w-4'/>
                        <span className='truncate'>
                            {client.email} 
                        </span>
                    </div>
                )}

                {/* Craeted date */}
                <div className='text-xs text-gray-500 mt-4'>
                    Created: {new Date(client.createdAt).toLocaleDateString()}
                </div>

                {/* Edit and details links */}
                <div className='flex justify-between item-center mt-4'>
                    <Link
                        href={`/clients/${client.id}/edit`}
                        className='text-sm text-blue-600 hover:text-blue-700'
                    >
                        Edit
                    </Link>
                    <Link
                        href={`/freelance-command-center/src/app/(clients)/clients/${client.id}`}
                        className='text-sm text-blue-600 hover:text-blue-700'
                    >
                        Details
                    </Link>
                </div>
            </div>
        </div>
    )
}