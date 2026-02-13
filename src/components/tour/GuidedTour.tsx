'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, X, Layers, GripVertical, Play, Search, Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TourStep {
    targetId?: string
    title: string
    content: string
    icon?: React.ReactNode
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const steps: TourStep[] = [
    {
        title: 'Welcome to Marketing Data Foundation',
        icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
        content: 'An MDF is the backbone of modern marketing data — it ingests messy data from your CRM, website, and tools, then cleans, unifies, and activates it for campaigns, analytics, and AI. This simulator shows you exactly how it works.',
        position: 'center'
    },
    {
        title: 'How Data Flows Through an MDF',
        icon: <Layers className="w-5 h-5 text-violet-400" />,
        content: 'Data moves left to right through 5 stages:\n\n1️⃣ Sources — raw data from CRM, web, email\n2️⃣ Collection — event capture & ingestion\n3️⃣ Storage — data warehouse (Snowflake, BigQuery)\n4️⃣ MDF Hub — the brain that cleans, matches, and unifies\n5️⃣ Activation — push clean data to marketing tools',
        position: 'center'
    },
    {
        targetId: 'tour-palette',
        title: 'Component Library',
        icon: <GripVertical className="w-5 h-5 text-blue-400" />,
        content: 'Drag and drop components from here to build your data pipeline. Each category maps to a stage in the pipeline — from data Sources on the left to Activation destinations on the right.',
        position: 'right'
    },
    {
        targetId: 'tour-toolbar',
        title: 'Toolbar & Simulation',
        icon: <Play className="w-5 h-5 text-emerald-400" />,
        content: 'Use "Clean Up" to auto-arrange your pipeline. Hit "Run" to simulate data flowing through your architecture — you\'ll see messy data get cleaned, deduplicated, and identity-resolved in real time.',
        position: 'bottom'
    },
    {
        targetId: 'tour-inspector',
        title: 'Node Inspector',
        icon: <Search className="w-5 h-5 text-amber-400" />,
        content: 'Click any node to see its details — what it does, what kind of data flows through it, and how it connects to the rest of your pipeline.',
        position: 'left'
    },
    {
        title: 'Your AI Advisor',
        icon: <Bot className="w-5 h-5 text-purple-400" />,
        content: 'Not sure what to add? Open the AI Advisor from the toolbar — describe your business situation and it will recommend specific components and auto-add them to your canvas.',
        position: 'center'
    },
    {
        title: 'Ready to Explore!',
        icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
        content: 'Start by dragging components, running the simulator, or asking the AI Advisor for help. The goal: build a complete pipeline from Sources → MDF Hub → Activation.',
        position: 'center'
    }
]

export default function GuidedTour() {
    const { isTourOpen, currentStep, nextStep, prevStep, endTour, startTour } = useUIStore()
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({})

    // Auto-trigger tour for first-time visitors
    useEffect(() => {
        const hasCompleted = localStorage.getItem('mdf_tour_completed')
        if (!hasCompleted) {
            // Delay to let the page and cinematic loader finish
            const timer = setTimeout(() => {
                startTour()
            }, 4500)
            return () => clearTimeout(timer)
        }
    }, [startTour])

    const step = steps[currentStep]

    // Calculate position
    useEffect(() => {
        if (!isTourOpen) return

        const updatePosition = () => {
            if (step.position === 'center' || !step.targetId) {
                setTargetRect(null)
                setPopoverStyle({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                })
                return
            }

            const element = document.getElementById(step.targetId)
            if (element) {
                const rect = element.getBoundingClientRect()
                setTargetRect(rect)

                let top = 0
                let left = 0
                let transform = ''
                const gap = 12

                switch (step.position) {
                    case 'right':
                        top = rect.top + rect.height / 2
                        left = rect.right + gap
                        transform = 'translate(0, -50%)'
                        break
                    case 'left':
                        top = rect.top + rect.height / 2
                        left = rect.left - gap
                        transform = 'translate(-100%, -50%)'
                        break
                    case 'bottom':
                        top = rect.bottom + gap
                        left = rect.left + rect.width / 2
                        transform = 'translate(-50%, 0)'
                        break
                    case 'top':
                        top = rect.top - gap
                        left = rect.left + rect.width / 2
                        transform = 'translate(-50%, -100%)'
                        break
                }

                setPopoverStyle({ top, left, transform })
            }
        }

        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition)

        const timer = setTimeout(updatePosition, 100)
        const timer2 = setTimeout(updatePosition, 500)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition)
            clearTimeout(timer)
            clearTimeout(timer2)
        }
    }, [isTourOpen, step, currentStep])

    if (!isTourOpen) return null

    const isLastStep = currentStep === steps.length - 1

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto" />

            {/* Spotlight Hole */}
            {targetRect && (
                <div
                    className="absolute bg-transparent border-2 border-cyan-400 rounded-lg transition-all duration-300 ease-in-out pointer-events-none"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.4)'
                    }}
                />
            )}

            {/* Popover Card */}
            <div
                className="absolute w-[420px] transition-all duration-300 ease-in-out pointer-events-auto"
                style={popoverStyle}
            >
                <Card className="shadow-2xl border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {step.icon}
                                <CardTitle className="text-lg font-bold text-white">
                                    {step.title}
                                </CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={endTour}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {step.content}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                        <div className="flex gap-1.5">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-colors",
                                        idx === currentStep ? "bg-cyan-400" : idx < currentStep ? "bg-cyan-800" : "bg-slate-700"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300" onClick={prevStep}>
                                    Back
                                </Button>
                            )}
                            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white" onClick={isLastStep ? endTour : nextStep}>
                                {isLastStep ? 'Get Started' : 'Next'}
                                {!isLastStep && <ChevronRight className="ml-1 w-4 h-4" />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
