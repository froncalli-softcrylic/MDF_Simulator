'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Database, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'
import { categoryMeta } from '@/data/node-catalog'

interface DataTransformationCardProps {
    stage: 'extraction' | 'transformation' | 'activation';
    data: {
        input?: Record<string, any>;
        output?: Record<string, any>;
        diff?: Record<string, { original: any; new: any }>;
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
