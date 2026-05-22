'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'


interface ProjectHealthCardProps {
  total: number
  pieData: { name: string; value: number; color:string }[]
}

export function ProjectHealthCard({ total, pieData }: ProjectHealthCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      >
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm">
    
      <CardHeader className="pb-2 pt-5">
        <CardTitle className="text-base font-bold">Project Health</CardTitle>
        <p className="text-xs text-muted-foreground">Overall delivery status</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-32 w-32 relative mt-2">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={36} outerRadius={46} paddingAngle={4} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-black">{total}</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Total</span>
          </div>
        </div>
        <div className="w-full grid grid-cols-3 gap-2 mt-4 text-[10px] text-center border-t border-border/10 pt-3">
          {pieData.map((item) => (
            <div key={item.name}>
              <span className="flex items-center justify-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-extrabold block mt-0.5">
                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}