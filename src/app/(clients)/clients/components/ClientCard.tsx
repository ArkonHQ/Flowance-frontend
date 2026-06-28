'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Client, ClientInsight } from "@/lib/api/clients"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Star,
  Mail,
  Trash2,
} from "lucide-react"
import DeleteButton from './DeleteButton'
import { cn } from '@/lib/utils'


interface ClientCardProps {
  client: Client
  insight?: ClientInsight
  onDelete?: (id: number) => void
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    'at-risk': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    vip: 'bg-purple-100 text-purple-700 border-purple-200',
    internal: 'bg-blue-100 text-blue-700 border-blue-200',
  }
  return statusColors[status] || statusColors.inactive
}

export const ClientCard = ({ client, insight }: ClientCardProps) => {
  const rawStatus = client.status || 'active'
  const status = rawStatus.replace('_', '-').toLowerCase()
  const totalProjects = insight?.totalProjects ?? 0
  const totalRevenue = insight?.totalEarned 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(insight.totalEarned)
    : '$0.00'
  const lastActivity = insight?.lastActivity || 'No activity yet'

  const [isOpen, setIsOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow px-5 py-4 grid grid-cols-12 gap-4 items-center w-full">
      {/* Client (col-span-4) */}
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
            {client.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <Link href={`/clients/${client.id}`}>
            <p className="text-sm font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors">
              {client.name}
            </p>
          </Link>
          <p className="text-xs text-gray-500 truncate">{client.email}</p>
        </div>
      </div>

      {/* Status (col-span-2) */}
      <div className="col-span-2">
        <Badge variant="outline" className={cn('getStatusColor(status)', status === 'internal' ? 'text-blue-500' : 'text-muted-foreground/80')}>
          {status}
        </Badge>
      </div>

      {/* Total Projects (col-span-2) */}
      <div className="col-span-2 text-sm font-medium text-gray-900">
        {totalProjects}
      </div>

      {/* Total Revenue (col-span-2) */}
      <div className="col-span-2 text-sm font-medium text-gray-900">
        {totalRevenue}
      </div>

      {/* Last Activity (col-span-1) */}
      <div className="col-span-1 text-sm text-gray-500">
        {lastActivity}
      </div>

      {/* Actions (col-span-1) */}
      <div className="col-span-1 flex justify-end">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                'h-8 w-8 rounded-full',
                isOpen ? 'bg-gray-200 text-indigo-600' : 'text-gray-400'
              )}
              variant="ghost"
              size="icon"
            >
              <MoreHorizontal
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen ? 'rotate-0 text-indigo-600' : 'rotate-90 text-gray-400'
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/clients/${client.id}`} className="flex items-center gap-2 cursor-pointer">
                <ExternalLink className="h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/clients/${client.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" />
                Edit client
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Mail className="h-4 w-4" />
                Send email
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
              <DeleteButton
                clientId={client.id}
                clientName={client.name}
                redirectAfterDelete={false}
              >
                <span className="flex items-center gap-2 text-destructive cursor-pointer w-full">
                  <Trash2 className="h-4 w-4" />
                  Delete client
                </span>
              </DeleteButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}