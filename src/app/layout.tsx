'use client';

import { useState, useEffect } from 'react';
import { Providers } from '@/app/providers';
import './globals.css';
import React from 'react';
import { Toaster } from 'sonner';
import {
  SidebarInset,
  SidebarTrigger,
  SidebarProvider,
} from '@/components/ui/sidebar';
import AuthGuard from './components/auth-guard';
import AppSidebar from './components/app-sidebar';
import { GlobalSearch } from './components/GlobalSearch';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useSession } from '@/lib/auth';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  // ⌘K / Ctrl+K to toggle the search dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthGuard>
            {session && !isAuthPage ? (
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <header className="flex h-14 items-center justify-between gap-4 border-b px-6">
                    <div className="flex items-center gap-4">
                      <SidebarTrigger />
                      <h1 className="text-sm font-semibold tracking-tight">
                        Freelance Command Center
                      </h1>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Global search trigger button */}
                      <Button
                        variant="outline"
                        className="relative h-9 w-9 p-0 xl:h-10 xl:w-64 xl:justify-start xl:px-3 xl:py-2"
                        onClick={() => setSearchOpen(true)}
                      >
                        <Search className="h-4 w-4 xl:mr-2" />
                        <span className="hidden xl:inline-flex">Search anything...</span>
                        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                          <span className="text-xs">⌘</span>K
                        </kbd>
                      </Button>
                    </div>
                  </header>
                  <main className="p-4">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            ) : (
              <main className="min-h-screen flex items-center justify-center bg-background">
                {children}
              </main>
            )}
            <Toaster richColors />
            {/* Global Search */}
            <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}