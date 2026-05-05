'use client'

import { usePathname, useRouter} from 'next/navigation'
import React, { useState, useEffect } from 'react'


const AuthGuard = ({ children }: {children: React.ReactNode}) => {

    const router = useRouter()
    const pathname= usePathname()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.replace(`/login?from=${encodeURIComponent(pathname)}`)
        }else {
            setReady(true)
        }
    }, [router, pathname])


    if (!ready) return null
    return <> {children} </>;

}
export default AuthGuard
