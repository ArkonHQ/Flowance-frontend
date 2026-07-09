'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, ChevronDown, BarChart2 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CardPeriodSelector } from './CardPeriodSelector'

interface RevenueOverviewCardProps {
  totalRevenue: number
  weeklyHours: { name: string; revenue: number }[]
  trends?: number
  periodLabel?: string
  trendLabel?: string
  selectPeriod?: string
  onPeriodChange?: (period: string) => void
}

// Builds a filled placeholder wave if no real data
const EMPTY_WAVE = [
  { name: 'Jan', revenue: 0 }, { name: 'Feb', revenue: 0 }, { name: 'Mar', revenue: 0 },
  { name: 'Apr', revenue: 0 }, { name: 'May', revenue: 0 }, { name: 'Jun', revenue: 0 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 border border-border/50 p-3 rounded-xl shadow-xl flex flex-col gap-1 backdrop-blur-xl transition-all">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: payload[0].color || '#8b5cf6' }} />
          <span className="text-base font-black text-foreground">
            ${Number(payload[0].value).toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueOverviewCard({
  totalRevenue,
  weeklyHours,
  trends,
  periodLabel = 'All Time',
  trendLabel = 'vs last month',
  selectPeriod,
  onPeriodChange,
}: RevenueOverviewCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isPositive = (trends ?? 0) >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const trendColorClass = isPositive
    ? 'text-emerald-500 bg-emerald-500/10'
    : 'text-rose-500 bg-rose-500/10'

  const chartData = weeklyHours && weeklyHours.length > 0 ? weeklyHours : EMPTY_WAVE
  const hasRealData = weeklyHours && weeklyHours.length > 0 && weeklyHours.some(w => w.revenue > 0)

  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm group transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2 pt-5 border-b border-border/10 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              <BarChart2 className="h-4 w-4 text-violet-500" />
            </div>
            <CardTitle className="text-base font-bold">Revenue Overview</CardTitle>
          </div>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-3xl font-black tracking-tight">${totalRevenue.toLocaleString()}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${trendColorClass}`}
            >
              <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
              {Math.abs(trends ?? 0)}%
            </span>
            <span className="text-[11px] text-muted-foreground">{trendLabel}</span>
          </div>
        </div>
        <CardPeriodSelector
          selectPeriod={selectPeriod}
          onPeriodChange={onPeriodChange}
          periodLabel={periodLabel || 'All Dates'}
        />
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-52 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#8b5cf6" stopOpacity={hasRealData ? 0.35 : 0.1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? '' : `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        {!hasRealData && (
          <p className="text-center text-xs text-muted-foreground/60 mt-2">
            Revenue trend will appear as invoices are marked paid
          </p>
        )}
      </CardContent>
    </Card>
  )
}