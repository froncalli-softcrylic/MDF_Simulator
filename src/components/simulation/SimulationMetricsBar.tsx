'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui-store'
import { Database, Users, Fingerprint, Zap, Target, Activity, Layers } from 'lucide-react'

export function SimulationMetricsBar() {
    const { isSimulationRunning, simulationState } = useUIStore()

    const show = isSimulationRunning && simulationState.status !== 'idle'
    const metrics = simulationState.simulationMetrics
    const currentStep = simulationState.pathSteps[simulationState.currentStepIndex]
    const stepLabel = currentStep?.label || 'Initializing'
    const stepProgress = simulationState.pathSteps.length > 0
        ? `${simulationState.currentStepIndex + 1}/${simulationState.pathSteps.length}`
        : '—'

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    drag
                    dragMomentum={false}
                    whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
                    className="fixed top-[52px] left-1/2 -translate-x-1/2 z-50 cursor-grab active:cursor-grabbing"
                >
                    <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-6 py-2 flex items-center gap-5 pointer-events-auto">
                        <MetricPill
                            icon={<Activity className="w-3.5 h-3.5" />}
                            label="Step"
                            value={stepProgress}
                            color="text-indigo-400"
                            active={true}
                        />
                        <Divider />
                        <MetricPill
                            icon={<Layers className="w-3.5 h-3.5" />}
                            label="Processing"
                            value={stepLabel}
                            color="text-pink-400"
                            active={true}
                        />
                        <Divider />
                        <MetricPill
                            icon={<Database className="w-3.5 h-3.5" />}
                            label="Records"
                            value={metrics.recordsProcessed.toLocaleString()}
                            color="text-blue-400"
                            active={metrics.recordsProcessed > 0}
                        />
                        <Divider />
                        <MetricPill
                            icon={<Users className="w-3.5 h-3.5" />}
                            label="Profiles"
                            value={metrics.profilesUnified.toLocaleString()}
                            color="text-violet-400"
                            active={metrics.profilesUnified > 0}
                        />
                        <Divider />
                        <MetricPill
                            icon={<Fingerprint className="w-3.5 h-3.5" />}
                            label="Match Rate"
                            value={metrics.matchRate}
                            color="text-emerald-400"
                            active={metrics.matchRate !== '0%'}
                        />
                        <Divider />
                        <MetricPill
                            icon={<Zap className="w-3.5 h-3.5" />}
                            label="Dupes Removed"
                            value={String(metrics.dupesRemoved)}
                            color="text-amber-400"
                            active={metrics.dupesRemoved > 0}
                        />
                        <Divider />
                        <MetricPill
                            icon={<Target className="w-3.5 h-3.5" />}
                            label="Segments"
                            value={String(metrics.segmentsActive)}
                            color="text-cyan-400"
                            active={metrics.segmentsActive > 0}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function MetricPill({
    icon,
    label,
    value,
    color,
    active
}: {
    icon: React.ReactNode
    label: string
    value: string
    color: string
    active: boolean
}) {
    return (
        <div className="flex items-center gap-2">
            <div className={`${color} ${active ? 'opacity-100' : 'opacity-30'} transition-opacity duration-500`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider leading-none">{label}</span>
                <motion.span
                    key={value}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-600'} leading-tight transition-colors duration-500`}
                >
                    {value}
                </motion.span>
            </div>
        </div>
    )
}

function Divider() {
    return <div className="w-px h-6 bg-white/10" />
}
