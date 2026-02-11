'use client'

import { useEffect, useState, useRef } from 'react'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TourStep {
    targetId?: string
    title: string
    content: string
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const steps: TourStep[] = [
    {
        title: 'Welcome to Marketing Data Foundation',
        content: 'This tool helps you design, validate, and simulate your Marketing Data Foundation. Let\'s take a quick tour.',
        position: 'center'
    },
    {
        targetId: 'tour-palette',
        title: 'Component Library',
        content: 'Drag and drop components from here to build your architecture. Nodes are organized by pipeline stage (Sources -> Ingestion -> Warehouse -> Activation).',
        position: 'right'
    },
    {
        targetId: 'tour-toolbar',
        title: 'Control Center',
        content: 'Use the toolbar to change profiles, run auto-layout, check your Architecture Health Score, and access the AI Assistant.',
        position: 'bottom'
    },
    {
        targetId: 'tour-inspector',
        title: 'Inspector Panel',
        content: 'Click on any node to view details, configure properties, and see specific recommendations like ROI and Latency support.',
        position: 'left'
    },
    {
        title: 'Ready to Build',
        content: 'You can start by dragging nodes or use the AI Assistant to generate a starting point. Have fun!',
        position: 'center'
    }
]

export default function GuidedTour() {
    const { isTourOpen, currentStep, nextStep, prevStep, endTour } = useUIStore()
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({})

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

                // Calculate popover position
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

        // Small delay to ensure elements are rendered/animated
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
            {/* Backdrop / Overlay */}
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto" />

            {/* Spotlight Hole (using clip-path or simple replacement) */}
            {/* Note: True spotlight with backdrop-filter is complex. We'll use a simple highlighter box + dimming */}

            {targetRect && (
                <div
                    className="absolute bg-transparent border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-lg transition-all duration-300 ease-in-out pointer-events-none"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.5)' // dimming + glow
                    }}
                />
            )}

            {/* Popover Card */}
            <div
                className="absolute w-[350px] transition-all duration-300 ease-in-out pointer-events-auto"
                style={popoverStyle}
            >
                <Card className="shadow-2xl border-primary/20 animate-in fade-in zoom-in-95 duration-200">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-primary">
                                {step.title}
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={endTour}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                        {step.content}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-colors",
                                        idx === currentStep ? "bg-primary" : "bg-slate-200"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button variant="outline" size="sm" onClick={prevStep}>
                                    Back
                                </Button>
                            )}
                            <Button size="sm" onClick={isLastStep ? endTour : nextStep}>
                                {isLastStep ? 'Finish' : 'Next'}
                                {!isLastStep && <ChevronRight className="ml-1 w-4 h-4" />}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
