"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  bg: string
  gradient: string
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  gradient,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border border-border/30 bg-card/50 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
      {/* Gradient accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${gradient}`}
      />

      <CardContent className="flex flex-col justify-between p-5 space-y-4">
        <div className="flex flex-row items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div className={`rounded-full p-2 ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>

        <div className="text-2xl font-bold tracking-tight">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
