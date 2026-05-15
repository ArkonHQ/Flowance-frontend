'use client'

import AppSidebar  from '../components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import React from "react";
import AuthGuard from "@/app/components/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AuthGuard>
                <header className="flex h-14 items-center justify-between gap-4 border-b px-6">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger />
                        <h1 className="text-sm font-semibold tracking-tight">
                            Freelance Command Center
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                </header>
                </AuthGuard>
                <main className="p-4">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}