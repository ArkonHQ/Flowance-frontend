'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth';

import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/dashboard';


    // useState handler
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Authentication the user data with the backend and wait a response
            const result = await signIn.email({email, password})

            if (result.error) throw new Error(result.error.message || 'Login failed');

            toast.success(`Welcome back!`);
            router.push(from)

        }catch (err:any) {
        setError(err.message || 'Oops! Something went wrong');
        }finally {
            setLoading(false)
        }
    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-background/95 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
                    <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
                </div>

                <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-semibold">Sign In</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
                                >
                                    {error}
                                </motion.div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="text-xs font-medium text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background/50"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full gap-2 shadow-lg shadow-primary/20" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/register" className="font-semibold text-primary hover:underline transition-colors">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
