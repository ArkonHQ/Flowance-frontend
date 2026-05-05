'use client'

import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={false}>
            <TooltipProvider delayDuration={0}>
                {children}
            </TooltipProvider>
        </ThemeProvider>
    )
}
