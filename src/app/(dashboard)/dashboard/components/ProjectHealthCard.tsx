'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'

interface ProjectHealthCardProps {
  total: number
  pieData: { name: string; value: number; color: string }[]
}

const DEFAULT_EMPTY_PIE = [{ name: 'No Data', value: 1, color: '#334155' }]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.name === 'No Data') return null;
    return (
      <div className="bg-card/95 border border-border/50 p-2.5 rounded-xl shadow-xl flex flex-col gap-1 backdrop-blur-xl transition-all">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
          <span className="text-sm font-bold text-foreground">
            {data.name}
          </span>
          <span className="text-sm font-black text-foreground ml-2">
            {data.value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function ProjectHealthCard({ total, pieData }: ProjectHealthCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const data = pieData && pieData.length > 0 ? pieData : DEFAULT_EMPTY_PIE
  const hasData = pieData && pieData.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm group transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2 pt-5 border-b border-border/10">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Layers className="h-4 w-4 text-blue-500" />
            </div>
            Project Health
          </CardTitle>
          <p className="text-xs text-muted-foreground">Delivery status overview</p>
        </CardHeader>

        <CardContent className="flex flex-col items-center pt-4">
          {/* Donut chart */}
          <div className="h-36 w-36 relative">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={42}
                    outerRadius={58}
                    paddingAngle={hasData ? 3 : 0}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  {hasData && (
                    <Tooltip content={<CustomTooltip />} />
                  )}
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-foreground">{total}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Projects</span>
            </div>
          </div>

          {/* Legend */}
          {hasData && (
            <div className="w-full grid grid-cols-3 gap-2 mt-4 border-t border-border/10 pt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{item.name}</span>
                  <span className="text-sm font-extrabold text-foreground">{item.value}</span>
                  <span className="text-[9px] text-muted-foreground/70">
                    {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {!hasData && (
            <p className="text-xs text-muted-foreground text-center mt-4">No project data available</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}