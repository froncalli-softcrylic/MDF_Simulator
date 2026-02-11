'use client'

// MDF Custom Node Component for React Flow
// Updated for Phase 10: Visual Replication (White Card + Left Border + Metrics)

import React, { memo, useMemo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { MdfNodeData, NodeCategory, ValueOverlay, NodeStatus } from '@/types'
import { getNodeById, categoryMeta } from '@/data/node-catalog'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'
import {
    Database, Globe, Zap, Layers, GitMerge, Shield, BarChart2, Send,
    Users, Store, Megaphone, Headphones, RefreshCw, Inbox, GitBranch,
    Link, Home, CheckSquare, Lock, CheckCircle, TrendingUp, Upload, Mail,
    Check, AlertTriangle, Plus, Sparkles, Radio, HardDrive, Server, Code,
    ExternalLink, Eye, Info, Activity, CreditCard, HelpCircle, Key,
    FileText, AlertCircle, PieChart, Target, Bell, MessageSquare, Search, Fingerprint
} from 'lucide-react'

// Icon mapping (expanded for B2B SaaS)
const iconMap: Record<string, React.ElementType> = {
    database: Database, globe: Globe, zap: Zap, layers: Layers,
    'git-merge': GitMerge, shield: Shield, 'bar-chart-2': BarChart2,
    send: Send, users: Users, store: Store, megaphone: Megaphone,
    headphones: Headphones, 'refresh-cw': RefreshCw, inbox: Inbox,
    'git-branch': GitBranch, link: Link, home: Home,
    'check-square': CheckSquare, lock: Lock, 'check-circle': CheckCircle,
    'trending-up': TrendingUp, upload: Upload, mail: Mail,
    'chart-line': BarChart2, facebook: Send, server: Server,
    download: Inbox, cog: Layers, 'chart-bar': BarChart2,
    radio: Radio, 'hard-drive': HardDrive, code: Code,
    'external-link': ExternalLink, eye: Eye, info: Info,
    activity: Activity, 'credit-card': CreditCard, 'help-circle': HelpCircle,
    key: Key, 'file-text': FileText, 'alert-circle': AlertCircle,
    'pie-chart': PieChart, target: Target, bell: Bell,
    'message-square': MessageSquare, search: Search, cloud: Globe,
    'git-fork': GitMerge, 'arrow-right': Send, 'user-plus': Users,
    'alert-triangle': AlertTriangle, 'cloud-lightning': Zap, linkedin: Link
}

// Category Colors (Left Border & Icon)
const categoryColors: Partial<Record<NodeCategory, { border: string; icon: string; bg: string }>> = {
    sources: { border: 'border-l-cyan-500', icon: 'text-cyan-600', bg: 'bg-cyan-50/50' },
    collection: { border: 'border-l-purple-500', icon: 'text-purple-600', bg: 'bg-purple-50/50' },
    ingestion: { border: 'border-l-violet-500', icon: 'text-violet-600', bg: 'bg-violet-50/50' },
    storage_raw: { border: 'border-l-slate-400', icon: 'text-slate-600', bg: 'bg-slate-50/50' },
    storage_warehouse: { border: 'border-l-blue-600', icon: 'text-blue-700', bg: 'bg-blue-50/50' },
    transform: { border: 'border-l-indigo-500', icon: 'text-indigo-600', bg: 'bg-indigo-50/50' },
    analytics: { border: 'border-l-pink-500', icon: 'text-pink-600', bg: 'bg-pink-50/50' },
    activation: { border: 'border-l-orange-500', icon: 'text-orange-600', bg: 'bg-orange-50/50' },
    destination: { border: 'border-l-teal-500', icon: 'text-teal-600', bg: 'bg-teal-50/50' },
    // Hub
    mdf: { border: 'border-l-amber-500', icon: 'text-amber-700', bg: 'bg-amber-50/50' },
    // Rails
    governance: { border: 'border-l-red-500', icon: 'text-red-700', bg: 'bg-red-50/50' },
    identity: { border: 'border-l-emerald-500', icon: 'text-emerald-700', bg: 'bg-emerald-50/50' },
    clean_room: { border: 'border-l-slate-500', icon: 'text-slate-700', bg: 'bg-slate-100/50' },
    realtime_serving: { border: 'border-l-lime-500', icon: 'text-lime-700', bg: 'bg-lime-50/50' }
}

// Default fallback
const defaultColor = { border: 'border-l-slate-400', icon: 'text-slate-600', bg: 'bg-white' }

function isNodeHighlightedForOverlay(catalogId: string, overlay: ValueOverlay): boolean {
    if (!overlay) return true
    const catalogNode = getNodeById(catalogId)
    if (!catalogNode) return false
    return catalogNode.enables?.includes(overlay) || false
}

interface MdfNodeProps {
    data: MdfNodeData
    selected?: boolean
    dragging?: boolean
}

function MdfNodeComponent({ data, selected, dragging }: MdfNodeProps) {
    const activeOverlay = useUIStore(state => state.activeOverlay)

    const catalogNode = useMemo(() => getNodeById(data.catalogId), [data.catalogId])

    const isHighlighted = useMemo(() =>
        isNodeHighlightedForOverlay(data.catalogId, activeOverlay),
        [data.catalogId, activeOverlay]
    )

    const IconComponent: any = useMemo(() =>
        iconMap[catalogNode?.icon || 'database'] || Database,
        [catalogNode?.icon]
    )

    const status = data.status || 'optional'
    const colors = categoryColors[data.category] || defaultColor
    const isGap = status === 'gap'

    // Metrics to display (if any)
    const metrics = catalogNode?.metrics || []

    // Determine if this is a HUB node
    const isHub = catalogNode?.isHub || data.category === 'mdf' || data.category === 'identity' // Treat identity as part of hub visual if needed, but mainly 'mdf' category is the super node

    // Hub specific state
    const [activeTab, setActiveTab] = React.useState<'hygiene' | 'identity' | 'profile' | 'measurement'>('profile')

    if (isHub) {
        return (
            <div
                className={cn(
                    'relative group animate-scale-in',
                    'w-[400px]', // Larger width for Hub
                    isGap && 'opacity-80',
                    activeOverlay && !isHighlighted && 'opacity-30 blur-[1px]'
                )}
            >
                {/* Hub Card */}
                <div
                    className={cn(
                        'relative flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-lg border-2 border-amber-500/50 dark:border-amber-500/30 transition-all duration-300',
                        'overflow-hidden',
                        !dragging && !selected && 'hover:shadow-xl hover:-translate-y-1',
                        selected && 'ring-2 ring-primary ring-offset-2 shadow-2xl',
                        dragging && 'shadow-2xl scale-105 rotate-1 opacity-90'
                    )}
                >
                    {/* Hub Header */}
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-100 dark:border-amber-900/50">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-amber-600">
                            <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                                {data.label}
                            </span>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider truncate">
                                Central Data Foundation
                            </span>
                        </div>
                        {/* Status */}
                        {status !== 'optional' && (
                            <div className={cn(
                                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                                status === 'required' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            )}>
                                {status}
                            </div>
                        )}
                    </div>

                    {/* Internal Capability Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        {(['hygiene', 'identity', 'profile', 'measurement'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                                className={cn(
                                    'flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors relative',
                                    activeTab === tab
                                        ? 'text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800 shadow-sm z-10'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                )}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 bg-white dark:bg-slate-900 min-h-[120px]">
                        {activeTab === 'hygiene' && (
                            <div className="space-y-2 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                                    <Sparkles className="w-3 h-3" /> Hygiene Rules
                                </div>
                                <ul className="space-y-1">
                                    {(catalogNode?.hygieneRules || ['Standardization', 'Deduplication']).map((rule, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                            <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'identity' && (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                                    <Fingerprint className="w-3 h-3" /> Resolution Strategy
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {(catalogNode?.identityStrategyOptions || ['Deterministic']).map((opt, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {opt}
                                        </span>
                                    ))}
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Match Confidence</span>
                                    <span className="text-xs font-bold text-emerald-600">High (Deterministic)</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                                    <Users className="w-3 h-3" /> Unified Profile Data
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {(catalogNode?.profileDataClasses || ['Identity', 'Events']).map((cls, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 p-1 bg-slate-50 dark:bg-slate-800/50 rounded">
                                            <Database className="w-3 h-3 text-amber-500" />
                                            {cls}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'measurement' && (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                                    <BarChart2 className="w-3 h-3" /> Key Metrics
                                </div>
                                <div className="space-y-1">
                                    {(catalogNode?.measurementOutputs || ['Attribution']).map((out, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                            <CheckCircle className="w-3 h-3 text-cyan-500" />
                                            {out}
                                        </li>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metrics Footer */}
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex justify-between items-center">
                        {metrics.slice(0, 2).map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 uppercase">{m.label}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.value}</span>
                            </div>
                        ))}
                    </div>

                </div>

                <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-amber-500 !border-2 !border-white" />
                <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-amber-500 !border-2 !border-white" />
                <Handle type="target" position={Position.Top} id="top" className="!bg-slate-300" />
                <Handle type="target" position={Position.Bottom} id="bottom" className="!bg-slate-300" />
            </div>
        )
    }

    // Standard Node Render
    return (
        <div
            className={cn(
                'relative group animate-scale-in',
                // Size
                'w-[240px]',
                // Gap state
                isGap && 'opacity-80',
                // Dimmed when overlay active
                activeOverlay && !isHighlighted && 'opacity-30 blur-[1px]'
            )}
        >
            {/* Main Card */}
            <div
                className={cn(
                    'relative flex flex-col bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300',
                    'overflow-hidden',
                    // Left Border
                    'border-l-4', colors.border,
                    // Hover
                    !dragging && !selected && 'hover:shadow-md hover:-translate-y-0.5',
                    // Selected
                    selected && 'ring-2 ring-primary ring-offset-2 shadow-lg',
                    // Dragging
                    dragging && 'shadow-xl scale-105 rotate-1 opacity-90'
                )}
            >
                {/* Header Section */}
                <div className="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-800">
                    {/* Icon */}
                    <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-md shrink-0',
                        colors.bg
                    )}>
                        <IconComponent className={cn('w-4 h-4', colors.icon)} />
                    </div>

                    {/* Title & Category */}
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {data.label}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                            {categoryMeta[data.category]?.label || data.category}
                        </span>
                    </div>

                    {/* Status Dot/Icon */}
                    {status !== 'optional' && status !== 'existing' && (
                        <div className={cn(
                            'w-2 h-2 rounded-full',
                            status === 'recommended' && 'bg-cyan-500 animate-pulse',
                            status === 'required' && 'bg-blue-500',
                            status === 'gap' && 'bg-rose-500'
                        )} title={status} />
                    )}
                </div>

                {/* Body / Metrics Section */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 min-h-[40px]">
                    {metrics.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {metrics.map((m, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-medium uppercase">{m.label}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{m.value}</span>
                                        {m.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                                        {m.trend === 'down' && <TrendingUp className="w-3 h-3 text-rose-500 rotate-180" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                            {catalogNode?.description || 'Loading module data...'}
                        </p>
                    )}
                </div>

                {/* Footer / Status Text (Optional) */}
                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                    </span>
                    <span>1m ago</span>
                </div>
            </div>

            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className={cn(
                    'w-3 h-3 !bg-slate-400 !border-2 !border-white rounded-full',
                    'hover:!bg-primary transition-colors',
                    '-ml-1.5'
                )}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={cn(
                    'w-3 h-3 !bg-slate-400 !border-2 !border-white rounded-full',
                    'hover:!bg-primary transition-colors',
                    '-mr-1.5'
                )}
            />
        </div>
    )
}

export default memo(MdfNodeComponent)
