'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useSession } from '@/lib/auth';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, isPending } = useSession();

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    useEffect(() => {
        if (!isPending && !session && !isAuthPage) {
            router.replace(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [session, isPending, isAuthPage, router, pathname]);

    if (isPending) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-xs text-muted-foreground animate-pulse">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!session && !isAuthPage) {
        return null;
    }

    return <>{children}</>;
};

export default AuthGuard;
