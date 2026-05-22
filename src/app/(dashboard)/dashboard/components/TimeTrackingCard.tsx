'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, ChevronDown, Minus, TrendingDown } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface TimeTrackingCardProps {
  totalHours: number
  trendPercent?: number   
  trendLabel?: string
  weeklyHours: { name: string, hours: number }[]
}

export function TimeTrackingCard({
  totalHours,
  trendPercent = 0,
  trendLabel = 'vs last month',
  weeklyHours,
}: TimeTrackingCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-200">

      <CardHeader className="pb-3 flex flex-row items-center justify-between pt-5">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold text-foreground">
            Time Tracking Summary
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground">
              {totalHours.toFixed(1)} hrs
            </span>
            {trendPercent > 0 ? (
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              +{trendPercent}%
            </span>

            ) :  trendPercent === 0 ? (
            <span className="text-xs font-semibold text-muted-foreground bg-muted/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
              0%
            </span>
            ) : (
            <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              -{trendPercent}%
            </span>
            
            )}
            <span className="text-[10px] text-muted-foreground font-medium">
              {trendLabel}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-2 rounded-lg border-border/40 bg-card/30 flex items-center gap-1"
        >
          <span>This Week</span>
          <ChevronDown className="h-2.5 w-2.5" />
        </Button>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-44 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyHours}
                margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 9 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888888', fontSize: 9 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(23, 23, 23, 0.85)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: 11,
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}