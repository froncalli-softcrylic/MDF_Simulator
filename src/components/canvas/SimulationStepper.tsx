'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import { CheckCircle, Loader2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
    { id: 'extraction', label: 'Ingesting Data (Source)', status: 'extraction' },
    { id: 'transformation', label: 'Unifying & Transforming (Hub)', status: 'transformation' },
    { id: 'activation', label: 'Activating Segments (Dest)', status: 'activation' },
    { id: 'complete', label: 'Simulation Complete', status: 'complete' }
] as const

export default function SimulationStepper() {
    const { isSimulationRunning, simulationState, setSimulationRunning } = useUIStore()

    // Map the string status to a numeric index for the progress bar
    const currentStepIndex = React.useMemo(() => {
        if (!isSimulationRunning) return -1
        switch (simulationState.status) {
            case 'extraction': return 0
            case 'start_flow': return 0 // Still first step visually
            case 'transformation': return 1
            case 'activation': return 2
            case 'complete': return 3
            default: return 0
        }
    }, [simulationState.status, isSimulationRunning])

    if (!isSimulationRunning) return null

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 pointer-events-auto"
            >
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                    <div className="p-1.5 bg-blue-500/20 rounded-full animate-pulse">
                        <Play className="w-3.5 h-3.5 text-blue-400 fill-current" />
                    </div>
                    <span className="font-semibold text-xs text-white tracking-wide uppercase">Simulation Active</span>
                </div>

                <div className="flex items-center gap-1">
                    {STEPS.map((step, index) => {
                        const isActive = index === currentStepIndex
                        const isCompleted = index < currentStepIndex
                        // Special handling for 'complete' step
                        const isFinished = simulationState.status === 'complete' && step.id === 'complete'

                        return (
                            <div key={step.id} className="flex items-center">
                                {/* Indicator */}
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500",
                                    isActive ? "bg-white text-slate-900 scale-110 shadow-lg" :
                                        isCompleted || isFinished ? "bg-emerald-500/20 text-emerald-400" :
                                            "bg-white/5 text-slate-500"
                                )}>
                                    {isCompleted || isFinished ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : isActive ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <span className="text-[10px] font-mono">{index + 1}</span>
                                    )}
                                </div>

                                {/* Label (Only visible if active or large screen) */}
                                {isActive && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        className="ml-2 text-xs font-medium text-white whitespace-nowrap"
                                    >
                                        {step.label}
                                    </motion.span>
                                )}

                                {/* Dot Connector */}
                                {index < STEPS.length - 1 && (
                                    <div className={cn(
                                        "w-8 h-[1px] mx-1 transition-colors duration-500",
                                        isCompleted ? "bg-emerald-500/50" : "bg-white/10"
                                    )} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
