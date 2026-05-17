'use client'

import Link from 'next/link'
import { Client } from "@/lib/api/clients"
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
  onDelete?: (id: number) => void
}

export const ClientCard = ({ client, onDelete }: ClientCardProps) => {
  const initials = client.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)


  return (
      <div className='flex items-end justify-between mb-6'>
        {/* Left side */}
        <div className='flex items-end gap-6'>
          <h2 className='text-2xl font-bold'>All clients</h2>
          <nav className='flex gap-4 text-sm font-medium text-gray-500'>
            <Link href={"/clients"} className='text-indigo-600 border-b-2 border-indigo-600 pb-1'>All</Link>
            <Link href={"/clients?status=active"} className='hover:text-indigo-600'>Active</Link>
            <Link href={"/clients?status=at-risk"} className='hover:text-indigo-600'>At Risk</Link>
            <Link href={"/clients?status=inactive"} className='hover:text-indigo-600'>Inactive</Link>
          </nav>
        </div>
        {/* Right side */}
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <i data-lucide='search' className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400'></i>
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 text-sm text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200"
            />
          </div>
          <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200'>
            <i data-lucide='filter' className='h-4 w-4 text-gray-400'></i>
            Filters
          </button>
          <button className='flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200'>
            <i data-lucide='download' className='h-4 w-4 text-gray-400'></i>
            Export
          </button>
        </div>

      </div>
  )
}