'use client'


import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import React from "react";
import AuthGuard from "@/app/components/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <SidebarInset>
                <AuthGuard>
                    <main className="p-4">{children}</main>
                </AuthGuard>
            </SidebarInset>
        </SidebarProvider>
    );
}