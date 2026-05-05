// src/app/layout.tsx
import { Providers } from '@/app/providers'
import './globals.css'
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    )
}