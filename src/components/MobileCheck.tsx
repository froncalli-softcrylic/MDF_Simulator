'use client'

// Mobile Check Wrapper - Redirects mobile users to email capture page
// Minimum supported width: 768px (iPad Mini portrait)

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const MIN_SUPPORTED_WIDTH = 768 // iPad Mini portrait width

interface MobileCheckProps {
    children: React.ReactNode
}

export default function MobileCheck({ children }: MobileCheckProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isSupported, setIsSupported] = useState<boolean | null>(null)

    useEffect(() => {
        // Skip check for mobile page itself
        if (pathname === '/mobile') {
            setIsSupported(true)
            return
        }

        const checkDevice = () => {
            const width = window.innerWidth
            const supported = width >= MIN_SUPPORTED_WIDTH

            if (!supported) {
                router.replace('/mobile')
            } else {
                setIsSupported(true)
            }
        }

        // Initial check
        checkDevice()

        // Listen for resize (e.g., orientation change on tablets)
        const handleResize = () => {
            const width = window.innerWidth
            if (width < MIN_SUPPORTED_WIDTH && pathname !== '/mobile') {
                router.replace('/mobile')
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [router, pathname])

    // Show nothing while checking (prevents flash)
    if (isSupported === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        )
    }

    return <>{children}</>
}
