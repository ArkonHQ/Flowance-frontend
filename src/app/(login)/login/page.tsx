'use client';

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner'
import { z } from "zod"

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginShcema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})


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
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ email, password }),
                }
            )

                const data = await res.json()
                if (!res.ok){
                    throw new Error ( data.message ||'Failed Login')
                }

            // If the Login Successed give ( notification, save the token, and navigate the user to the dashboard URL )
            localStorage.setItem('token', data.token)
            toast.success('Welcome Back!')
            router.push(from)

    }catch(err: any) {
            setError(err.message || 'Something went wrong')
        }finally {
            setLoading(false)
        }
    }


    return (
        <div className={'flex min-screen items-center justify-center bg-background'}>
            <Card className={'w-fill max-w-sm space-y-4 p-6'}>
                <CardHeader>
                    <CardTitle className={'text-2xl font-bold'}>Sign in</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className={'space-y-4'}>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <div className={'space-y-2'}>
                            <Label htmlFor={'email'}>Email</Label>
                            <Input
                                id='email'
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                            <div className={'space-y-2'}>
                                <Label htmlFor={'password'}>Password</Label>
                                <Input
                                    id='password'
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    />
                        </div>
                            <Button type='submit' className={'w-full'} disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                                </Button>
                    </form>
                    <p className={'mt-4 text-center text-sm text-muted-foreground'}>
                        Don't have an account?{" "}
                        <Link href='/register' className={'underline'}>
                            Sing up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
export default Login
