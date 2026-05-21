"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Award, CheckCircle, TrendingUp } from 'lucide-react'

type Project = {
  id: number
  name: string
  progress: number
}

type ProjectProgressProps = {
  progress: Project[]
  atRiskProjects?: Project[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function ProjectProgress({ progress, atRiskProjects = [] }: ProjectProgressProps) {
  // Sort projects: lowest progress first or completed first? Let's sort to show active first
  const sortedProjects = [...progress].sort((a, b) => b.progress - a.progress)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Active Projects Progress (2/3 width) */}
      <Card className="lg:col-span-2 border border-border/30 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Active Projects Track
            </CardTitle>
            <p className="text-xs text-muted-foreground">Real-time status of your ongoing development streams</p>
          </div>
          <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium">
            {progress.length} Active
          </Badge>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {sortedProjects.map((p) => {
              const isCompleted = p.progress === 100
              const isLowProgress = p.progress < 30

              return (
                <motion.div
                  key={p.id}
                  variants={itemVariants}
                  className="group relative p-3.5 rounded-xl border border-border/20 bg-background/50 hover:bg-background/80 transition-all duration-200"
                >
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${isCompleted ? 'bg-green-500 animate-pulse' : isLowProgress ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                      <span className="font-semibold text-sm tracking-tight text-foreground group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 py-0 px-1.5 h-5 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Ready
                        </Badge>
                      )}
                      <span className="text-xs font-bold text-muted-foreground">{p.progress}%</span>
                    </div>
                  </div>
                  <div className="relative w-full">
                    <Progress
                      value={p.progress}
                      className="h-2 rounded-full bg-muted overflow-hidden"
                      // Pass accent colors if shadcn's progress supports it, or use custom styling
                    />
                  </div>
                </motion.div>
              )
            })}

            {sortedProjects.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No active projects found.
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* At Risk Projects Panel (1/3 width) */}
      <Card className="border border-border/30 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
            <p className="text-xs text-muted-foreground">Projects with approaching deadlines or low pace</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {atRiskProjects && atRiskProjects.length > 0 ? (
            atRiskProjects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-tight text-foreground">{p.name}</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Struggling at {p.progress}% progress</p>
                </div>
                <Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px]">
                  At Risk
                </Badge>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 p-3">
                <Award className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">All Projects Healthy</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">None of your projects are currently flagged as at-risk.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
