import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@xyflow/react/dist/style.css'
import MobileCheck from '@/components/MobileCheck'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'MDF Simulator | Marketing Data Foundation',
    description: 'Interactive simulator to visualize and design your Marketing Data Foundation architecture. Drag, drop, and explore data flows.',
    keywords: ['Marketing Data Foundation', 'MDF', 'Data Architecture', 'Identity Graph', 'CDP'],
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans antialiased`}>
                <ErrorBoundary>
                    <MobileCheck>
                        {children}
                    </MobileCheck>
                </ErrorBoundary>
            </body>
        </html>
    )
}
