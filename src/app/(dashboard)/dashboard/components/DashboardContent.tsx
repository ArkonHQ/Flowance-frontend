"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Briefcase,
  Clock,
  FileText,
  CheckCircle,
  Users,
  Award,
  BarChart2,
  ListTodo
} from 'lucide-react';
import StatCard from './StatCard';
import ProjectProgress from './ProjectProgress';
import UpcomingTasks from './UpcomingTasks';
import RecentActivity from './RecentActivity';
import { DashboardData } from '@/lib/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type DashboardContentProps = {
  data: DashboardData;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function DashboardContent({ data }: DashboardContentProps) {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto py-8 px-4 md:px-6 space-y-8 pb-20"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">
              Command Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back. Here is your freelance performance and workload telemetry for today.
            </p>
          </div>
          <Badge variant="outline" className="border-indigo-500/25 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1 text-xs self-start md:self-center gap-1.5 flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Live Sync
          </Badge>
        </motion.div>

        {/* Row of KPI cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Revenue"
              value={`$${data.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="text-emerald-500"
              bg="bg-emerald-100 dark:bg-emerald-950/45"
              gradient="from-emerald-500 to-teal-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Active Projects"
              value={data.activeProject}
              icon={Briefcase}
              color="text-indigo-500"
              bg="bg-indigo-100 dark:bg-indigo-950/45"
              gradient="from-indigo-500 to-blue-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Hours"
              value={`${data.totalHours.toFixed(1)} hrs`}
              icon={Clock}
              color="text-orange-500"
              bg="bg-orange-100 dark:bg-orange-950/45"
              gradient="from-orange-500 to-amber-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Pending Invoices"
              value={data.pendingInvoices}
              icon={FileText}
              color="text-purple-500"
              bg="bg-purple-100 dark:bg-purple-950/45"
              gradient="from-purple-500 to-pink-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Tasks Completed"
              value={data.tasksCompletedThisWeek}
              icon={CheckCircle}
              color="text-green-500"
              bg="bg-green-100 dark:bg-green-950/45"
              gradient="from-green-500 to-emerald-500"
            />
          </motion.div>
        </motion.div>

        {/* Project Progress Tracker */}
        <motion.div variants={itemVariants}>
          <ProjectProgress progress={data.projectProgress} atRiskProjects={data.atRiskProjects} />
        </motion.div>

        {/* Dynamic Multi-column for Tasks, Deadlines, Workload, and Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Middle components (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants}>
              <UpcomingTasks upcomingTasks={data.upcomingTasks} deadlines={data.deadlines} />
            </motion.div>
          </div>

          {/* Right Column (1/3 width) - Workload & Active Team Members */}
          <div className="space-y-6">
            {/* Workload Widget */}
            {(data.teamWorkload && data.teamWorkload.length > 0) || data.mostActiveMember ? (
              <motion.div variants={itemVariants}>
                <Card className="border border-border/30 bg-card/40 backdrop-blur-md shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-indigo-500" />
                      Team Workload & Pace
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Allocation metrics and task volume across active seats</p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Team Workload list */}
                    {data.teamWorkload && data.teamWorkload.length > 0 && (
                      <div className="space-y-3.5">
                        {data.teamWorkload.map((member, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-foreground flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                {member.name}
                              </span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border/40 font-medium">
                                {member.openTask} tasks
                              </Badge>
                            </div>
                            <Progress value={Math.min(member.openTask * 10, 100)} className="h-1.5 rounded-full" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Most Active Member highlight */}
                    {data.mostActiveMember && (
                      <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-amber-500" /> MVP of the Week
                          </span>
                          <p className="text-sm font-bold text-foreground">{data.mostActiveMember.name}</p>
                        </div>
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px]">
                          {data.mostActiveMember.taskCount} Completed
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}

            {/* Recent Activity stream */}
            <motion.div variants={itemVariants}>
              <RecentActivity recentActivity={data.recentActivity} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
