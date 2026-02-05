'use client'

// Mobile Page - Email capture for unsupported device sizes
// Shows when viewport is below iPad Mini width (768px)

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitMerge, Mail, CheckCircle, Smartphone, Monitor, ArrowRight } from 'lucide-react'

export default function MobilePage() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/mobile-notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (!response.ok) {
                throw new Error('Failed to submit')
            }

            setIsSubmitted(true)
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }, [email])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
            <Card className="w-full max-w-md bg-card/95 backdrop-blur border-slate-700 shadow-2xl">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                            <GitMerge className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-xl">MDF Simulator</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Best experienced on larger screens
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {!isSubmitted ? (
                        <>
                            {/* Device info */}
                            <div className="flex items-center justify-center gap-4 py-4">
                                <div className="text-center">
                                    <Smartphone className="w-8 h-8 mx-auto text-red-400 mb-1" />
                                    <span className="text-xs text-muted-foreground">Mobile</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                <div className="text-center">
                                    <Monitor className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                                    <span className="text-xs text-muted-foreground">Desktop/Tablet</span>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Our interactive diagram builder works best on tablets (iPad Mini or larger) and desktop computers.
                                </p>
                                <Badge variant="secondary" className="mt-2">
                                    Minimum: 768px width
                                </Badge>
                            </div>

                            {/* Email form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="text-center">
                                    <p className="text-sm font-medium mb-3">
                                        Get the link sent to your email:
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-xs text-destructive text-center">{error}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !email}
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Me the Link'}
                                </Button>
                            </form>
                        </>
                    ) : (
                        /* Success state */
                        <div className="text-center py-6 space-y-4">
                            <div className="flex justify-center">
                                <div className="p-3 bg-emerald-500/20 rounded-full">
                                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Link Sent!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Check your inbox at <span className="font-medium text-foreground">{email}</span> for the link to MDF Simulator.
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                                Thank you for your interest in our tool!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
