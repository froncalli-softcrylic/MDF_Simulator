'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Database, Sparkles, CheckCircle, ArrowRight, Download, Fingerprint, Users, BarChart2 } from 'lucide-react'
import { categoryMeta } from '@/data/node-catalog'

interface DataTransformationCardProps {
    stage: 'extraction' | 'transformation' | 'activation';
    data: {
        input?: Record<string, any>;
        output?: Record<string, any>;
        diff?: Record<string, { original: any; new: any }>;
        mdf_pipeline?: Record<string, any>;
    };
    nodeName: string;
    stepInfo?: {
        current: number;
        total: number;
        category: string;
    };
}

export function DataTransformationCard({ stage, data, nodeName, stepInfo }: DataTransformationCardProps) {
    const config = {
        extraction: {
            color: 'bg-rose-500',
            accentColor: 'from-rose-500/20 to-rose-600/5',
            icon: Database,
            title: 'Extracting Data',
            borderColor: 'border-rose-500/30',
            textColor: 'text-rose-300',
            badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        },
        transformation: {
            color: 'bg-amber-500',
            accentColor: 'from-amber-500/20 to-amber-600/5',
            icon: Sparkles,
            title: 'Transforming & Unifying',
            borderColor: 'border-amber-500/30',
            textColor: 'text-amber-300',
            badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        },
        activation: {
            color: 'bg-emerald-500',
            accentColor: 'from-emerald-500/20 to-emerald-600/5',
            icon: CheckCircle,
            title: 'Activating',
            borderColor: 'border-emerald-500/30',
            textColor: 'text-emerald-300',
            badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }
    }[stage]

    const Icon = config.icon
    const categoryLabel = stepInfo?.category
        ? categoryMeta[stepInfo.category as keyof typeof categoryMeta]?.label || stepInfo.category
        : ''

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className={cn(
                "w-[480px] rounded-2xl shadow-2xl border pointer-events-none overflow-hidden",
                "bg-slate-950 border-white/10"
            )}
        >
            {/* Top accent gradient */}
            <div className={cn("h-1 w-full bg-gradient-to-r", config.accentColor)} />

            {/* Scanning Laser Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan-down opacity-40" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3">
                <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", config.color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">{config.title}</h3>
                        <p className="text-xs text-slate-400 font-medium">{nodeName}</p>
                    </div>
                </div>

                {stepInfo && (
                    <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border", config.badgeColor)}>
                            {categoryLabel}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                            {stepInfo.current}/{stepInfo.total}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-5 pb-5 space-y-4">
                {/* Extraction: Show Input */}
                {stage === 'extraction' && data.input && (
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Input Payload</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">JSON</span>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-4 text-sm font-mono border border-slate-800 relative overflow-hidden">
                            {Object.entries(data.input).map(([k, v]) => (
                                <div key={k} className="flex gap-3 py-0.5">
                                    <span className="text-slate-600 w-28 text-right shrink-0">{k}:</span>
                                    <span className={cn("truncate", config.textColor)}>{String(v)}</span>
                                </div>
                            ))}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-rose-500/3 to-transparent animate-pulse pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Transformation: Show Diff */}
                {stage === 'transformation' && data.diff && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Before</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span>After</span>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(data.diff).map(([key, val]) => (
                                <div key={key} className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                                    <div className="bg-rose-950/40 text-rose-400 p-2.5 rounded-lg border border-rose-900/40 text-sm font-mono truncate text-right">
                                        {String(val.original)}
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <div className="bg-emerald-950/40 text-emerald-400 p-2.5 rounded-lg border border-emerald-900/40 text-sm font-mono truncate relative overflow-hidden">
                                        {String(val.new)}
                                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                            <div className="flex items-center gap-1.5 bg-indigo-950/30 text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-indigo-900/30">
                                <Database className="w-3 h-3" /> Identity Resolved
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-950/30 text-amber-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-900/30">
                                <Sparkles className="w-3 h-3" /> Enriched
                            </div>
                        </div>
                    </div>
                )}

                {/* MDF Pipeline: Show 5-Stage Process */}
                {data.mdf_pipeline && (
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MDF Pipeline</div>

                        {/* Pipeline Steps with Before/After Details */}
                        <div className="space-y-1.5">
                            {Object.entries(data.mdf_pipeline).map(([stepKey, stepData]: [string, any], idx: number) => {
                                const stepIcons = [Download, Sparkles, Fingerprint, Users, BarChart2]
                                const stepColors = [
                                    'text-blue-400 bg-blue-500/10 border-blue-500/20',
                                    'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                    'text-purple-400 bg-purple-500/10 border-purple-500/20',
                                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                                ]
                                const StepIcon = stepIcons[idx] || Database
                                const colorClasses = stepColors[idx] || stepColors[0]

                                // Extract key metric for each step
                                let metric = ''
                                if (stepData.records_received) metric = `${stepData.records_received} records`
                                else if (stepData.pass_rate) metric = `${stepData.duplicates_removed} dupes removed · ${stepData.pass_rate} pass`
                                else if (stepData.identity_clusters) metric = `${stepData.identity_clusters} clusters · ${stepData.records_linked} linked`
                                else if (stepData.golden_records) metric = `${stepData.golden_records} golden records · ${stepData.completeness} complete`
                                else if (stepData.attribution_model) metric = `${stepData.attribution_model} · ${stepData.active_segments} segments`

                                // Check for comparison data (Before -> After)
                                const comparisons = Object.entries(stepData)
                                    .filter(([_, v]: [string, any]) => v && typeof v === 'object' && 'before' in v && 'after' in v)
                                    .slice(0, 3) // Limit to 3 rows

                                return (
                                    <motion.div
                                        key={stepKey}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.12 }}
                                        className={cn(
                                            "flex flex-col gap-2 p-2.5 rounded-lg border",
                                            colorClasses
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <StepIcon className="w-4 h-4 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold">{stepData.label}</div>
                                                <div className="text-[10px] opacity-70 truncate">{metric}</div>
                                            </div>
                                            <div className="text-[9px] font-mono opacity-50 shrink-0">✓</div>
                                        </div>

                                        {/* Comparison Detail View */}
                                        {comparisons.length > 0 && (
                                            <div className="bg-black/20 rounded p-2 text-[10px] space-y-1 mt-1">
                                                {comparisons.map(([key, val]: [string, any]) => (
                                                    <div key={key} className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center opacity-90">
                                                        <span className="text-right truncate opacity-60 decoration-current/50 line-through decoration-1">{val.before}</span>
                                                        <ArrowRight className="w-2.5 h-2.5 opacity-400" />
                                                        <span className="font-bold truncate opacity-100">{val.after}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Summary badge */}
                        <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
                            <div className="flex items-center gap-1.5 bg-emerald-950/30 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-900/30">
                                <CheckCircle className="w-3 h-3" /> Activation-Ready
                            </div>
                            <div className="flex items-center gap-1.5 bg-purple-950/30 text-purple-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-purple-900/30">
                                <Fingerprint className="w-3 h-3" /> Identity Resolved
                            </div>
                        </div>
                    </div>
                )}

                {/* Activation: Show Output */}
                {stage === 'activation' && data.output && (
                    <div className="space-y-2.5">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Final Payload</div>
                        <div className="bg-slate-900 rounded-xl p-4 text-sm font-mono border border-slate-800 relative overflow-hidden">
                            <div className="absolute top-2.5 right-2.5">
                                <span className="flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                </span>
                            </div>
                            {Object.entries(data.output).map(([k, v]) => (
                                <div key={k} className="flex gap-3 py-0.5">
                                    <span className="text-slate-600 w-28 text-right shrink-0">{k}:</span>
                                    <span className="text-emerald-300 truncate">{String(v)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-3">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-full border border-emerald-500/20">
                                ✓ Successfully Synced
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
