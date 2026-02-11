'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import { CheckCircle, Circle, Loader2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
    { id: 'sources', label: 'Ingesting Data', duration: 1500 },
    { id: 'unify', label: 'Unifying Profiles (MDF)', duration: 2500 },
    { id: 'enrich', label: 'Enriching Identity', duration: 1500 },
    { id: 'activate', label: 'Activating Segments', duration: 1500 },
    { id: 'complete', label: 'Simulation Complete', duration: 1000 }
] as const

export default function SimulationStepper() {
    const { isSimulationRunning, setSimulationRunning } = useUIStore()
    const [currentStepIndex, setCurrentStepIndex] = useState(0)

    useEffect(() => {
        if (isSimulationRunning) {
            setCurrentStepIndex(0)
            let step = 0

            const nextStep = () => {
                if (step < STEPS.length - 1) {
                    setTimeout(() => {
                        step++
                        setCurrentStepIndex(step)
                        nextStep()
                    }, STEPS[step].duration)
                } else {
                    // Finished
                    setTimeout(() => {
                        setSimulationRunning(false)
                    }, STEPS[step].duration)
                }
            }

            nextStep()
        }
    }, [isSimulationRunning, setSimulationRunning])

    if (!isSimulationRunning) return null

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 min-w-[320px]"
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Play className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" />
                    </div>
                    <span className="font-semibold text-sm">Simulation in Progress</span>
                </div>

                <div className="space-y-3">
                    {STEPS.map((step, index) => {
                        const isActive = index === currentStepIndex
                        const isCompleted = index < currentStepIndex
                        const isPending = index > currentStepIndex

                        return (
                            <div key={step.id} className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-5 h-5">
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        </motion.div>
                                    ) : isActive ? (
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium transition-colors duration-300",
                                    isActive ? "text-slate-900 dark:text-slate-100" :
                                        isCompleted ? "text-slate-500 line-through decoration-slate-300" :
                                            "text-slate-400"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mr-3">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                        {Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%
                    </span>
                </div>
            </motion.div>
        </div>
    )
}
