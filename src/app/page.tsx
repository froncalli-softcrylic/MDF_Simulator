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

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
            {/* Header */}
            <header className="border-b border-indigo-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Softcrylic Logo */}
                        <div className="relative h-8 w-32 mr-2">
                            <Image
                                src="/softcrylic-logo.png"
                                alt="Softcrylic Logo"
                                fill
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                        <div className="w-px h-6 bg-slate-300 mx-2" />
                        <span className="font-semibold text-slate-700">MDF Simulator</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Badge variant="secondary" className="hidden sm:inline-flex">
                            Sales Demo Tool
                        </Badge>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge className="mb-4" variant="outline">
                        We Make Data Work®
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-slate-900 drop-shadow-sm">
                        Build Your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                            Marketing Data Foundation
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Escape the Data Bermuda Triangle. Visualize how to capture, normalize,
                        and activate your data — from strategy to implementation.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/wizard">
                            <Button size="lg" className="gap-2 w-full sm:w-auto">
                                <Sparkles className="w-5 h-5" />
                                Start with Wizard
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/simulator/new">
                            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                                <LayoutTemplate className="w-5 h-5" />
                                Start from Template
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <Card key={feature.title} className="bg-white/60 backdrop-blur-lg border-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <CardHeader>
                                <feature.icon className={`w-10 h-10 ${feature.color} mb-2`} />
                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Templates */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold mb-2">Start with a Proven Architecture</h2>
                    <p className="text-muted-foreground">
                        Select a template built from Softcrylic's engineering expertise
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {templates.map((template) => (
                        <Link
                            key={template.id}
                            href={`/simulator/new?template=${template.id}`}
                        >
                            <Card className="h-full bg-white/80 backdrop-blur border-indigo-50 hover:border-blue-300 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        {template.badge && (
                                            <Badge variant="secondary" className="text-xs">
                                                {template.badge}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{template.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="container mx-auto px-4 py-16">
                <Card className="max-w-2xl mx-auto bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                    <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Ready to Make Your Data Work?</h3>
                        <p className="text-muted-foreground mb-6">
                            Our team of data engineers and strategists can help you implement a production-ready Marketing Data Foundation.
                        </p>
                        <Button variant="default" size="lg">
                            Book a Consultation
                        </Button>
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>MDF Simulator — A Softcrylic Solution | We Make Data Work®</p>
                </div>
            </footer>
        </div>
    )
}
