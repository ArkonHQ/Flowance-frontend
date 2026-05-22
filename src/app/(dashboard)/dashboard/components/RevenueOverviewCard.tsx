// components/dashboard/RevenueOverviewCard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

interface RevenueOverviewCardProps {
  totalRevenue: number
  sourceData: { name: string, value: number, percentage: string, color: string } []
  weeklyHours: { name:string, revenue: number }[]
  trends?: number  
}

export function RevenueOverviewCard({ totalRevenue, sourceData, weeklyHours, trends }: RevenueOverviewCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  const isPositive = (trends ?? 0) >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const trendColorClass = isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between pt-5">
        <div>
          <CardTitle className="text-base font-bold">Revenue Overview</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">${totalRevenue.toLocaleString()}</span>
            <span className={`text-xs font-semibold ${trendColorClass} px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
              <TrendIcon className="h-3 w-3" /> {Math.abs(trends ?? 0).toFixed(2)}%
            </span>
            <span className="text-[10px] text-muted-foreground">vs last month</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 rounded-lg">
          This Week <ChevronDown className="h-2.5 w-2.5 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 h-48 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyHours}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#888888' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(23, 23, 23, 0.85)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: 11,
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              By Source
            </span>
            {sourceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <div className="text-right">
                  <span className="font-bold block">${item.value.toLocaleString()}</span>
                  <span className="text-[9px] text-muted-foreground">{item.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}