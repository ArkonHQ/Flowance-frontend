'use client'

import Link from 'next/link'
import { Client, ClientInsight } from "@/lib/api/clients"
import {
  Mail,
  Building2,
  MoreHorizontal,
  Calendar,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import DeleteButton from './DeleteButton'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'

interface ClientCardProps {
  client: Client
  insight?: ClientInsight
  onDelete?: (id: number) => void
}

export const ClientCard = ({ client, insight }: ClientCardProps) => {
  const status = insight?.status || 'inactive'
  const totalProjects = insight?.totalProjects || 0
  const totalRevenue = insight?.totalRevenue || 0
  
  const initials = client.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)


    const getStatusColor = (status: string) => {
      const statusColors: Record<string, string> = {
        'active': 'bg-green-100 text-green-700',
        'at-risk': 'bg-yellow-100 text-yellow-700',
        'inactive': 'bg-gray-100 text-gray-700',
        'vip': 'bg-purple-100 text-purple-700',
      }
      return statusColors[status as keyof typeof statusColors] || statusColors.inactive
    }


  return (
      <div className='grid grid-cols-12 gap-4 items-center px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200'>
        {/* Client name, email and  */}
        <div className='col-span-4 flex items-center gap-3 min-w-0'>
          <div className='h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0'>
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-gray-900 truncate'>{client.name}</p>
            <p className='text-xs text-gray-500 truncate'>{client.email}</p>
          </div>
        </div>

        {/* Status */}
        <div className='col-span-2'>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        {/* Total projects */}
        <div className='col-span-2 flex items-center justify-center'>
          <span className={`text-sm font-medium text-outline-dotted-cool-gray-700 `}>
            {totalProjects}
          </span>
        </div>
        
        {/* Total value */}
        <div className='col-span-2'></div>
        
        {/* Total revenue */}
        <div className='col-span-2'></div>
        <div className='col-span-1'></div>
        <div className='col-span-1'></div>
      </div>
  )
}