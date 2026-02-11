'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import { categoryMeta } from '@/data/node-catalog'
import {
    CheckCircle, TrendingUp, Users, Zap, Database, ArrowRight,
    BarChart2, Shield, X, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SimulationResults() {
    const { simulationState, setSimulationState, setSimulationRunning } = useUIStore()

    const isVisible = simulationState.status === 'results' && simulationState.resultsData
    const results = simulationState.resultsData

    const handleClose = () => {
        setSimulationRunning(false)
        setSimulationState({
            status: 'idle',
            activeNodeId: null,
            dataPayload: null,
            pathSteps: [],
            currentStepIndex: -1,
            resultsData: null
        })
    }

    if (!isVisible || !results) return null

    const businessBenefits = [
        {
            icon: Users,
            title: 'Unified Customer View',
            description: `${results.totalNodes} components work together to create a single golden record for every customer.`,
            color: 'text-blue-400'
        },
        {
            icon: Zap,
            title: 'Real-Time Activation',
            description: `Audiences are synced in real-time to ${results.destinationNames.length} destination${results.destinationNames.length > 1 ? 's' : ''}: ${results.destinationNames.join(', ')}.`,
            color: 'text-amber-400'
        },
        {
            icon: TrendingUp,
            title: 'Revenue Impact',
            description: 'Personalized experiences drive 2-3x higher conversion rates and 40% increase in customer LTV.',
            color: 'text-emerald-400'
        },
        {
            icon: Shield,
            title: 'Privacy-First',
            description: 'Consent management and PII handling built into the pipeline ensures GDPR/CCPA compliance.',
            color: 'text-purple-400'
        }
    ]

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>

                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Simulation Complete</h2>
                                    <p className="text-sm text-slate-400">Your MDF architecture is ready for production</p>
                                </div>
                            </div>

                            {/* Pipeline path summary */}
                            <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                                {results.categories.map((cat, i) => {
                                    const meta = categoryMeta[cat as keyof typeof categoryMeta]
                                    return (
                                        <div key={cat} className="flex items-center gap-1.5">
                                            <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-medium text-slate-300 whitespace-nowrap">
                                                {meta?.label || cat}
                                            </span>
                                            {i < results.categories.length - 1 && (
                                                <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/5">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{results.totalNodes}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pipeline Nodes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{results.sourceNames.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Data Sources</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{results.destinationNames.length}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Destinations</div>
                            </div>
                        </div>

                        {/* Final Data Preview */}
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-2 mb-3">
                                <Database className="w-4 h-4 text-slate-400" />
                                <h3 className="text-sm font-bold text-white">Sample Unified Profile Output</h3>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 text-xs font-mono text-emerald-300 border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-2 right-2">
                                    <span className="flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                    </span>
                                </div>
                                {results.finalPayload && Object.entries(results.finalPayload).map(([k, v]) => (
                                    <div key={k} className="flex gap-3 py-0.5">
                                        <span className="text-slate-500 w-36 text-right shrink-0">{k}:</span>
                                        <span className="text-emerald-300">
                                            {Array.isArray(v) ? (v as string[]).join(', ') : String(v)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Business Benefits */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white">Business Impact</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {businessBenefits.map((benefit, i) => (
                                    <motion.div
                                        key={benefit.title}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <benefit.icon className={cn("w-4 h-4", benefit.color)} />
                                            <span className="text-xs font-bold text-white">{benefit.title}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">{benefit.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={handleClose}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                            >
                                Close & Continue Editing
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
