'use client'

// Landing Page - Start screen with CTAs

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ArrowRight, Sparkles, LayoutTemplate, GitMerge,
    Zap, Shield, BarChart2, Users
} from 'lucide-react'

const features = [
    {
        icon: GitMerge,
        title: 'Solve Missing Data',
        description: 'Capture and validate data correctly from multiple sources',
        color: 'text-emerald-500'
    },
    {
        icon: Zap,
        title: 'Activate Unused Data',
        description: 'Integrate your marketing technology stack to put data to work',
        color: 'text-green-500'
    },
    {
        icon: BarChart2,
        title: 'Get the Right Insights',
        description: 'Generate actionable reports and measure what matters',
        color: 'text-pink-500'
    },
    {
        icon: Shield,
        title: 'Govern with Confidence',
        description: 'Consent management and data governance built-in',
        color: 'text-amber-500'
    }
]

const templates = [
    {
        id: 'retail_mdf',
        name: 'Retail MDF',
        description: 'Online + offline customer unification',
        badge: 'Popular'
    },
    {
        id: 'b2b_saas_mdf',
        name: 'B2B SaaS MDF',
        description: 'Product-led growth data foundation',
        badge: null
    },
    {
        id: 'preferred_mdf',
        name: 'Preferred Stack',
        description: 'Snowflake + AWS best practices',
        badge: 'Recommended'
    }
]

import dynamic from 'next/dynamic'

const LandingHero3D = dynamic(() => import('@/components/3d/LandingHero3D'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50/50 dark:bg-slate-900/50 animate-pulse" />
})

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LandingLoader from '@/components/ui/LandingLoader'
import HyperscalerLogos from '@/components/ui/HyperscalerLogos'

// ... imports

export default function LandingPage() {
    const [showLoader, setShowLoader] = useState(true)

    return (
        <div className="min-h-screen bg-background relative overflow-hidden text-slate-800 dark:text-slate-100">
            <AnimatePresence mode="wait">
                {showLoader && (
                    <LandingLoader onComplete={() => setShowLoader(false)} key="loader" />
                )}
            </AnimatePresence>

            {/* 3D Background Experience */}
            <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                <LandingHero3D startAnimation={!showLoader} />
            </div>

            {/* Main Content Content Wrapper */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showLoader ? 0 : 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10"
            >


                {/* Header */}
                <header className="fixed top-4 left-4 right-4 z-50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 rounded-full shadow-lg px-6 h-16 flex items-center justify-between transition-all duration-300 hover:bg-white/90 dark:hover:bg-slate-900/90 hover:shadow-xl hover:scale-[1.005]">
                            <div className="flex items-center gap-3">
                                {/* Logo */}
                                <div className="relative h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2" />
                                <span className="font-bold text-lg tracking-tight">
                                    Marketing Data Foundation <span className="font-normal text-slate-500 dark:text-slate-400 text-sm ml-1">by Softcrylic</span>
                                </span>
                            </div>
                            <nav className="flex items-center gap-4">
                                <Badge variant="secondary" className="hidden sm:inline-flex bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border-none px-3 py-1">
                                    v3.0 • Hub-Centric Architecture
                                </Badge>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="container mx-auto px-4 pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
                    <div className="max-w-5xl mx-auto text-center space-y-8">
                        <div className="inline-flex animate-scale-in">
                            <Badge className="px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors backdrop-blur-sm">
                                We Make Data Work®
                            </Badge>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] drop-shadow-sm animate-scale-in [animation-delay:100ms]">
                            Build Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x bg-[length:200%_auto]">
                                Data Foundation
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-light animate-scale-in [animation-delay:200ms]">
                            Escape the Bermuda Triangle of data. <br className="hidden md:block" />
                            Visualize, simulate, and activate your marketing stack in real-time.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-scale-in [animation-delay:300ms]">
                            <Link href="/simulator/new">
                                <Button size="lg" className="h-16 px-8 text-lg gap-3 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                                    <Sparkles className="w-6 h-6 animate-pulse" />
                                    Start Simulator
                                    <ArrowRight className="w-5 h-5 opacity-50" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Hyperscaler Logos */}
                <HyperscalerLogos />

                {/* Features Staggered Grid */ // Using a slightly different comment to ensure I match unique block if possible, but actually I'll just match the next section header
                }
                {/* Features Staggered Grid */}
                <section className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <Card
                                key={feature.title}
                                className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/40 dark:from-white/0 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <CardHeader>
                                    <div className={`w-14 h-14 rounded-2xl ${feature.color.replace('text-', 'bg-')}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                        <feature.icon className={`w-8 h-8 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>



                {/* CTA */}
                <section className="container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/30 rounded-full blur-[80px] animate-pulse-glow" />

                        <div className="relative z-10 space-y-8">
                            <Users className="w-16 h-16 mx-auto text-primary animate-bounce" />
                            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Ready to make your data work?
                            </h3>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                                Our team of data engineers and strategists can help you implement a production-ready Marketing Data Foundation.
                            </p>
                            <Link href="https://softcrylic.com" target="_blank" rel="noopener noreferrer" className="block mt-10">
                                <Button variant="secondary" size="lg" className="h-14 px-8 text-lg rounded-xl font-bold hover:scale-105 transition-transform">
                                    Book a Consultation
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-slate-50 dark:bg-slate-950">
                    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                        <p className="font-medium">Marketing Data Foundation — A Softcrylic Solution</p>
                        <p className="mt-2 opacity-60">We Make Data Work®</p>
                    </div>
                </footer>
            </motion.div>
        </div >
    )
}
