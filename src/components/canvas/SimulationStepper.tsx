'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import { CheckCircle, Loader2, Play, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { categoryMeta } from '@/data/node-catalog'

export default function SimulationStepper() {
    const { isSimulationRunning, simulationState } = useUIStore()

    if (!isSimulationRunning || simulationState.pathSteps.length === 0) return null

    const { pathSteps, currentStepIndex, status } = simulationState

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[90vw]">
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-4 pointer-events-auto overflow-x-auto"
            >
                <div className="flex items-center gap-2 pr-3 border-r border-white/10 shrink-0">
                    <div className="p-1.5 bg-blue-500/20 rounded-full animate-pulse">
                        <Play className="w-3 h-3 text-blue-400 fill-current" />
                    </div>
                    <span className="font-semibold text-[10px] text-white tracking-wide uppercase whitespace-nowrap">Simulation</span>
                </div>

                <div className="flex items-center gap-0.5">
                    {pathSteps.map((step, index) => {
                        const isActive = index === currentStepIndex && status === 'stepping'
                        const isCompleted = index < currentStepIndex
                        const isFinished = status === 'results' || status === 'complete'

                        return (
                            <React.Fragment key={step.nodeId}>
                                {/* Step indicator */}
                                <div className="flex items-center gap-1 shrink-0">
                                    <div className={cn(
                                        "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-500",
                                        isActive ? "bg-white text-slate-900 scale-110 shadow-lg shadow-white/20" :
                                            isCompleted || isFinished ? "bg-emerald-500/20 text-emerald-400" :
                                                "bg-white/5 text-slate-600"
                                    )}>
                                        {isCompleted || isFinished ? (
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        ) : isActive ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <span className="text-[9px] font-mono">{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Label (show for active step) */}
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            className="text-[10px] font-medium text-white whitespace-nowrap ml-1"
                                        >
                                            {step.label}
                                        </motion.span>
                                    )}
                                </div>

                                {/* Connector */}
                                {index < pathSteps.length - 1 && (
                                    <div className={cn(
                                        "w-4 h-[1px] mx-0.5 transition-colors duration-500 shrink-0",
                                        isCompleted ? "bg-emerald-500/50" : "bg-white/10"
                                    )} />
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
