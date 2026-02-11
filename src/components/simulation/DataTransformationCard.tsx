'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, XCircle, Database, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataTransformationCardProps {
    stage: 'extraction' | 'transformation' | 'activation';
    data: {
        input?: Record<string, any>;
        output?: Record<string, any>;
        diff?: Record<string, { original: any; new: any }>;
    };
    nodeName: string;
    placement?: 'top' | 'bottom';
}

export function DataTransformationCard({ stage, data, nodeName, placement = 'top' }: DataTransformationCardProps) {
    // Config based on stage
    const config = {
        extraction: {
            color: 'bg-rose-500',
            icon: Database,
            title: 'Raw Data Extracted',
            borderColor: 'border-rose-200 dark:border-rose-900',
            glow: 'shadow-rose-500/20'
        },
        transformation: {
            color: 'bg-amber-500',
            icon: Sparkles,
            title: 'mdf_hub Processing...',
            borderColor: 'border-amber-200 dark:border-amber-900',
            glow: 'shadow-amber-500/20'
        },
        activation: {
            color: 'bg-emerald-500',
            icon: CheckCircle,
            title: 'Ready for Activation',
            borderColor: 'border-emerald-200 dark:border-emerald-900',
            glow: 'shadow-emerald-500/20'
        }
    }[stage]

    const Icon = config.icon

    // Position styles based on placement
    const positionStyles = placement === 'top'
        ? { bottom: '120%', left: '50%', x: '-50%' }
        : { top: '120%', left: '50%', x: '-50%' }

    const initialY = placement === 'top' ? 20 : -20

    return (
        <motion.div
            initial={{ opacity: 0, y: initialY, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: initialY, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
                "absolute z-50 w-[320px] rounded-xl shadow-2xl border pointer-events-none overflow-hidden backdrop-blur-md",
                "bg-white/90 dark:bg-slate-900/90",
                config.borderColor,
                config.glow
            )}
            style={positionStyles}
        >
            {/* Scanning Laser Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan-down opacity-50" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 relative">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm", config.color)}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{config.title}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{nodeName}</p>
                </div>
                {/* Connector Line visual */}
                <div
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 w-[2px] h-[10px] bg-slate-300 dark:bg-slate-700",
                        placement === 'top' ? "-bottom-[11px]" : "-top-[11px]"
                    )}
                />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 relative">
                {/* Extraction: Show Input Only */}
                {stage === 'extraction' && data.input && (
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                            <span>Input Payload</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">JSON</span>
                        </div>
                        <div className="bg-slate-950 rounded-md p-3 text-xs font-mono text-rose-300 overflow-hidden relative group">
                            {Object.entries(data.input).map(([k, v]) => (
                                <div key={k} className="flex gap-2 relative z-10">
                                    <span className="text-slate-500 opacity-70 w-20 text-right shrink-0">{k}:</span>
                                    <span className="truncate">{String(v)}</span>
                                </div>
                            ))}
                            {/* Inner scan line */}
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-rose-500/5 to-transparent animate-pulse pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Transformation: Show Diff */}
                {stage === 'transformation' && data.diff && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Raw Source</span>
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                            <span>Standardized</span>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(data.diff).map(([key, val]) => (
                                <div key={key} className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-xs font-mono">
                                    <div className="bg-rose-950/30 text-rose-400 p-1.5 rounded border border-rose-900/50 truncate text-right">
                                        {String(val.original)}
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                    <div className="bg-emerald-950/30 text-emerald-400 p-1.5 rounded border border-emerald-900/50 truncate relative overflow-hidden">
                                        {String(val.new)}
                                        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-[10px] font-bold">
                                <Database className="w-3 h-3" /> Identity Resolved
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded text-[10px] font-bold">
                                <Sparkles className="w-3 h-3" /> Enriched
                            </div>
                        </div>
                    </div>
                )}

                {/* Activation: Show Final Output */}
                {stage === 'activation' && data.output && (
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Final Payload</div>
                        <div className="bg-slate-950 rounded-md p-3 text-xs font-mono text-emerald-300 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-1">
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>
                            {Object.entries(data.output).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                    <span className="text-slate-500 opacity-70 w-24 text-right shrink-0">{k}:</span>
                                    <span className="truncate">{String(v)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-2">
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                                Successfully Synced
                            </span>
                        </div>
                    </div>
                )}

            </div>
        </motion.div>
    )
}
