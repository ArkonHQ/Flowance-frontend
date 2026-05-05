// src/app/layout.tsx
import { Providers } from '@/app/providers'
import './globals.css'
import React from "react";
import {Toaster} from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <Providers>{children}</Providers>
        <Toaster richColors />
        </body>
        </html>
    )
}