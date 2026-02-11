'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import { AlertTriangle, X, ArrowRight, MousePointer2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SimulationError() {
    const { simulationState, setSimulationState, setSimulationRunning } = useUIStore()

    const isVisible = simulationState.status === 'error' && simulationState.message
    const missingItems = simulationState.message?.split(', ') || []

    const handleClose = () => {
        setSimulationRunning(false)
        setSimulationState({
            status: 'idle',
            activeNodeId: null,
            message: null,
            dataPayload: null
        })
    }

    if (!isVisible) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-[440px] bg-slate-950 border border-rose-500/30 shadow-2xl rounded-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-rose-500/10 border-b border-rose-500/20 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20">
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pipeline Blocked</h3>
                                    <p className="text-[10px] text-rose-300/80 font-medium">Incomplete Architecture</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-slate-300 leading-relaxed text-center">
                                To run a simulation, your pipeline requires nodes from the following groups to be connected:
                            </p>

                            <div className="space-y-3">
                                {missingItems.map((item) => (
                                    <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                            <span className="text-sm font-semibold text-white">{item}</span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-slate-500 font-medium italic">Drag from palette</span>
                                            <ArrowRight className="w-3 h-3 text-slate-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-start gap-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                                    <MousePointer2 className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">How to fix this?</h4>
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Add the missing nodes from the left sidebar and connect them using edges to create a complete flow.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0">
                            <button
                                onClick={handleClose}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-950 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all hover:gap-3 group"
                            >
                                <span>I'll Fix It Now</span>
                                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
