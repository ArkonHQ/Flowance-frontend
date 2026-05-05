'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    DollarSign,
    Users,
    TrendingUp,
} from "lucide-react";

const stats = [
    {
        title: "Active Tasks",
        value: "5",
        subtext: "3 high priority",
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
        title: "Earnings (Month)",
        value: "$2,450",
        subtext: "+12% from last month",
        icon: DollarSign,
        color: "text-emerald-500",
        bg: "bg-emerald-100 dark:bg-emerald-950",
    },
    {
        title: "Clients",
        value: "12",
        subtext: "2 unpaid invoices",
        icon: Users,
        color: "text-purple-500",
        bg: "bg-purple-100 dark:bg-purple-950",
    },
    {
        title: "Overdue Tasks",
        value: "1",
        subtext: "Due 3 days ago",
        icon: AlertTriangle,
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-950",
    },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6 bg-red">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's your current overview.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`rounded-full p-2 ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder for future charts or lists */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Recent Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Task list will appear here once connected.
                        </p>
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Earnings Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Chart will be integrated later.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

