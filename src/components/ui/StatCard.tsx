'use client'

import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"
import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"


interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  gradient: string
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
}

export const StatCard = ({ title, value, icon: Icon, bg, gradient, trend, color }: StatCardProps) => {

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} >
      <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-200 hover:translate-y-0.5" >

        {/* Gradient top bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${gradient}`} />

        {/* Card Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`rounded-2xl p-2.5 ${bg} shadow-sm border border-white/5`}>
            <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.5} />
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="space-y-2"> 
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {trend && (
            <div className="flex items-center gap-1.5">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" strokeWidth={2.5} />
              ) : trend.value === 0 ? (
                <Minus className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" strokeWidth={2.5} />
              )}
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : trend.value === 0 ? 'text-gray-400' : 'text-red-600'}`}>
                {trend.value > 0 ? '+' : '-'}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}