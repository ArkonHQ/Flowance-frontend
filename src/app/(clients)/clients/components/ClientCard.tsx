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

  // Subtle colour for the accent stripe – based on name (consistent across renders)
  const accentColors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-rose-500',
    'bg-violet-500',
  ]
  const accentColor = accentColors[client.name.charCodeAt(0) % accentColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-200 pl-4">
        {/* Left accent stripe – clean and minimal */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} rounded-l-lg`} />

        <CardHeader className="pb-2 pt-5 pr-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-10 w-10 ring-1 ring-border/40 shadow-sm">
                <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  href={`/clients/${client.id}`}
                  className="inline-block hover:text-primary transition-colors"
                >
                  <CardTitle className="text-base font-semibold truncate leading-snug">
                    {client.name}
                  </CardTitle>
                </Link>
                {client.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.company}</span>
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted/50 transition-colors"
                  aria-label="Open client menu"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 bg-popover/90 backdrop-blur-md border-border/50 shadow-xl"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/clients/${client.id}/edit`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit client
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  asChild
                  onSelect={(e) => e.preventDefault()}
                >
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
        </CardHeader>

        <CardContent className="space-y-2.5 pt-1 pr-5 pb-5">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              Created{' '}
              {new Date(client.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <Separator className="my-2! bg-border/30" />

          <div className="flex items-center justify-between">
            <Link
              href={`/clients/${client.id}/edit`}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Edit
            </Link>
            <Link
              href={`/clients/${client.id}`}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Details
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}