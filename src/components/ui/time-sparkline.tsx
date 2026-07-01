'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface SparklineDataPoint {
  day: string
  minutes: number
}

interface TimeSparklineProps {
  data: SparklineDataPoint[]
  width?: number
  height?: number
  color?: string
  className?: string
}

const FALLBACK_DATA: SparklineDataPoint[] = [
  { day: 'Mo', minutes: 0 },
  { day: 'Tu', minutes: 0 },
  { day: 'We', minutes: 0 },
  { day: 'Th', minutes: 0 },
  { day: 'Fr', minutes: 0 },
  { day: 'Sa', minutes: 0 },
  { day: 'Su', minutes: 0 },
]

export function TimeSparkline({
  data,
  width = 120,
  height = 48,
  color = '#6366f1',
  className,
}: TimeSparklineProps) {
  const chartData = data.length > 0 ? data : FALLBACK_DATA
  const totalMinutes = chartData.reduce((s, d) => s + d.minutes, 0)

  return (
    <div style={{ width, height }} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const entry = payload[0].payload as SparklineDataPoint
              const pct = totalMinutes > 0
                ? Math.round((entry.minutes / totalMinutes) * 100)
                : 0
              const hrs = Math.floor(entry.minutes / 60)
              const mins = Math.round(entry.minutes % 60)
              return (
                <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-2.5 py-1.5 shadow-xl text-xs">
                  <p className="font-semibold text-foreground">{entry.day}</p>
                  <p className="text-muted-foreground">
                    {hrs}h {mins.toString().padStart(2, '0')}m
                  </p>
                  <p className="font-medium" style={{ color }}>{pct}% of week</p>
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey="minutes"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
