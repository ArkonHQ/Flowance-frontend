'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronDown, Users, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { CardPeriodSelector } from './CardPeriodSelector'

interface TopClient {
  name: string
  revenue: number
  percent: number
  color: string
  balance?: number
  logo?: string
}

interface TopClientsCardProps {
  clients: TopClient[]
  selectPeriod?: string
  onPeriodChange?: (period: string) => void
  periodLabel?: string
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

// Deterministic color based on name for avatars
const AVATAR_COLORS = [
  'bg-violet-500/15 text-violet-500',
  'bg-blue-500/15 text-blue-500',
  'bg-emerald-500/15 text-emerald-500',
  'bg-orange-500/15 text-orange-500',
  'bg-pink-500/15 text-pink-500',
]

export function TopClientsCard({ 
  clients,
  selectPeriod,
  onPeriodChange,
  periodLabel = 'This Year'
}: TopClientsCardProps) {
  const hasData = clients && clients.length > 0

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3 pt-5 border-b border-border/10 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Users className="h-4 w-4 text-amber-500" />
            </div>
            Top Clients
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Revenue by account</p>
        </div>
        <CardPeriodSelector
          selectPeriod={selectPeriod}
          onPeriodChange={onPeriodChange}
          periodLabel={periodLabel || 'This Year'}
        />
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="p-3 rounded-full bg-muted/30 mb-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No client data yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Revenue by client will appear here</p>
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {clients.slice(0, 5).map((client, i) => {
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex items-center gap-3 group/item cursor-pointer p-1 rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <Avatar className="h-9 w-9 rounded-xl border border-border/30 shrink-0">
                    <AvatarImage src={client.logo} />
                    <AvatarFallback className={`text-[11px] rounded-xl font-bold ${avatarColor}`}>
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold truncate max-w-[110px]">{client.name}</span>
                      <span className="font-bold tabular-nums">${client.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={client.percent} className="h-1.5 flex-1" />
                      {client.balance !== undefined && client.balance > 0 ? (
                        <span className="text-[9px] text-amber-500 font-bold shrink-0 tabular-nums">
                          ${client.balance.toLocaleString()} due
                        </span>
                      ) : (
                        <span className="text-[9px] text-emerald-500 font-semibold shrink-0">Paid</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}