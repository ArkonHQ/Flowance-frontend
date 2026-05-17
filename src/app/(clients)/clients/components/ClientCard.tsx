'use client'

import { Client, ClientInsight } from "@/lib/api/clients"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

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
  }
  return statusColors[status] || statusColors.inactive
}

export const ClientCard = ({ client, insight }: ClientCardProps) => {
  const status = insight?.status || 'active'
  const totalProjects = insight?.totalProjects ?? 0
  const totalRevenue = insight?.totalRevenue ?? '$0'
  const lastActivity = insight?.lastActivity || 'No activity yet'

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
          <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
          <p className="text-xs text-gray-500 truncate">{client.email}</p>
        </div>
      </div>

      {/* Status (col-span-2) */}
      <div className="col-span-2">
        <Badge variant="outline" className={getStatusColor(status)}>
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
      <div className="col-span-1 text-sm text-gray-500 truncate">
        {lastActivity}
      </div>

      {/* Actions (col-span-1) */}
      <div className="col-span-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>Edit client</DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete client</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}