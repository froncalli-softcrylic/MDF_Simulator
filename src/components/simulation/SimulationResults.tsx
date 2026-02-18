'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import { categoryMeta } from '@/data/node-catalog'
import {
    CheckCircle, TrendingUp, Users, Zap, Database, ArrowRight,
    BarChart2, Shield, X, Sparkles, Loader2, AlertTriangle,
    Lightbulb, ThumbsUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getGradeColor(grade: string) {
    switch (grade.toUpperCase()) {
        case 'A+': case 'A': return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' }
        case 'A-': case 'B+': return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' }
        case 'B': case 'B-': return { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' }
        case 'C+': case 'C': return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' }
        case 'C-': case 'D+': case 'D': return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' }
        default: return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
    }
}

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

    const aiFeedback = results.aiFeedback
    const gradeColors = aiFeedback ? getGradeColor(aiFeedback.grade) : null

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
                                    <p className="text-sm text-slate-400">Your MDF architecture has been analyzed</p>
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

                        {/* AI-Powered Pipeline Assessment */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white">AI Pipeline Assessment</h3>
                            </div>

                            {!aiFeedback ? (
                                /* Loading state while AI is generating feedback */
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-8 gap-3"
                                >
                                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                                    <p className="text-sm text-slate-400">Analyzing your pipeline architecture...</p>
                                    <p className="text-[10px] text-slate-500">AI is reviewing your data pipeline configuration</p>
                                </motion.div>
                            ) : (
                                /* AI Feedback Rendered */
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-4"
                                >
                                    {/* Score + Grade header */}
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div className={cn(
                                            "flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-black",
                                            gradeColors?.bg, gradeColors?.border, gradeColors?.text,
                                            "border"
                                        )}>
                                            {aiFeedback.grade}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn("text-lg font-bold", gradeColors?.text)}>
                                                    {aiFeedback.score}/100
                                                </span>
                                                <span className="text-xs text-slate-500">Pipeline Score</span>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {aiFeedback.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Strengths + Gaps side by side */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Strengths */}
                                        <div className="p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Strengths</span>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {aiFeedback.strengths.map((s, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -5 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 + i * 0.05 }}
                                                        className="text-[11px] text-slate-300 flex items-start gap-1.5"
                                                    >
                                                        <span className="text-emerald-500 mt-0.5">•</span>
                                                        {s}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Gaps */}
                                        <div className="p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/10">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Gaps</span>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {aiFeedback.gaps.map((g, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -5 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.2 + i * 0.05 }}
                                                        className="text-[11px] text-slate-300 flex items-start gap-1.5"
                                                    >
                                                        <span className="text-amber-500 mt-0.5">•</span>
                                                        {g}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="p-3 rounded-xl bg-blue-500/[0.05] border border-blue-500/10">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Recommendations</span>
                                        </div>
                                        <ul className="space-y-1.5">
                                            {aiFeedback.recommendations.map((r, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + i * 0.05 }}
                                                    className="text-[11px] text-slate-300 flex items-start gap-1.5"
                                                >
                                                    <span className="text-blue-500 mt-0.5">{i + 1}.</span>
                                                    {r}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
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
