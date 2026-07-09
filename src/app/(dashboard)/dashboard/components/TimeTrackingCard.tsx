'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, ChevronDown, Timer } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts'
import { CardPeriodSelector } from './CardPeriodSelector'

interface TimeTrackingCardProps {
  totalHours: number
  trendPercent?: number
  trendLabel?: string
  weeklyHours: { name: string; hours: number }[]
  selectPeriod?: string
  onPeriodChange?: (period: string) => void
  periodLabel?: string
}

const formatHours = (totalHours: number) => {
  const h = Math.floor(totalHours)
  const m = Math.round((totalHours - h) * 60)
  if (h === 0 && m === 0 && totalHours > 0) return '< 1m'
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 border border-border/50 p-3 rounded-xl shadow-xl flex flex-col gap-1 backdrop-blur-xl transition-all">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: payload[0].color || payload[0].payload?.fill || '#f97316' }} />
          <span className="text-base font-black text-foreground">
            {formatHours(Number(payload[0].value))}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function TimeTrackingCard({
  totalHours,
  trendPercent = 0,
  trendLabel = 'vs last month',
  weeklyHours,
  selectPeriod,
  onPeriodChange,
  periodLabel = 'This Week',
}: TimeTrackingCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const hasData = weeklyHours && weeklyHours.length > 0 && weeklyHours.some(w => w.hours > 0)
  const chartData = weeklyHours && weeklyHours.length > 0 ? weeklyHours : [
    { name: 'Mon', hours: 0 }, { name: 'Tue', hours: 0 }, { name: 'Wed', hours: 0 },
    { name: 'Thu', hours: 0 }, { name: 'Fri', hours: 0 }, { name: 'Sat', hours: 0 }, { name: 'Sun', hours: 0 },
  ]

  const maxHours = Math.max(...chartData.map(d => d.hours), 1)

  const TrendIcon = trendPercent > 0 ? TrendingUp : trendPercent < 0 ? TrendingDown : Minus
  const trendClass = trendPercent > 0
    ? 'text-emerald-500 bg-emerald-500/10'
    : trendPercent < 0
    ? 'text-rose-500 bg-rose-500/10'
    : 'text-muted-foreground bg-muted/30'

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2 pt-5 border-b border-border/10 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Timer className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-base font-bold">Time Tracking</CardTitle>
          </div>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-3xl font-black tracking-tight">{formatHours(totalHours)}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${trendClass}`}>
              <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
              {trendPercent === 0 ? '0%' : `${Math.abs(trendPercent)}%`}
            </span>
            <span className="text-[11px] text-muted-foreground">{trendLabel}</span>
          </div>
        </div>
        <CardPeriodSelector
          selectPeriod={selectPeriod}
          onPeriodChange={onPeriodChange}
          periodLabel={periodLabel || 'This Week'}
        />
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-44 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888', fontSize: 9 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#888', fontSize: 9 }}
                  tickFormatter={(v) => v === 0 ? '' : `${v}h`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(120,120,120,0.08)' }}
                />
                <Bar dataKey="hours" radius={[5, 5, 0, 0]} barSize={20}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.hours === maxHours && hasData ? '#f97316' : 'url(#barGrad)'}
                      opacity={entry.hours === 0 ? 0.15 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {!hasData && (
          <p className="text-center text-xs text-muted-foreground/60 mt-2">
            Time will appear once tasks are logged
          </p>
        )}
      </CardContent>
    </Card>
  )
}