'use client'

// MDF Custom Node Component for React Flow
// Updated for B2B SaaS categories with governance rail and account graph
// Features distinct styling for rail nodes and gap states

import React, { memo, useMemo, useCallback } from 'react'
import { Handle, Position, type Node } from '@xyflow/react'
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
    FileText, AlertCircle, PieChart, Target, Bell, MessageSquare, Search
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

// Category themes - B2B SaaS with rails
const categoryThemes: Record<NodeCategory, { bg: string; border: string; icon: string; text: string }> = {
    // Pipeline categories
    sources: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600', text: 'text-cyan-900' },
    collection: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', text: 'text-purple-900' },
    ingestion: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', text: 'text-violet-900' },
    storage_raw: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-600', text: 'text-slate-900' },
    storage_warehouse: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-900' },
    transform: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', text: 'text-indigo-900' },
    analytics: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600', text: 'text-pink-900' },
    activation: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', text: 'text-green-900' },
    destination: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600', text: 'text-teal-900' },
    // Rail categories (distinct styling)
    governance: { bg: 'bg-amber-50', border: 'border-amber-300', icon: 'text-amber-600', text: 'text-amber-900' },
    identity: { bg: 'bg-emerald-50', border: 'border-emerald-300', icon: 'text-emerald-600', text: 'text-emerald-900' },
    clean_room: { bg: 'bg-slate-100', border: 'border-slate-300', icon: 'text-slate-600', text: 'text-slate-900' },
    realtime_serving: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', text: 'text-orange-900' }
}

// Check if node should be highlighted for overlay
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
    const selectedNodeId = useUIStore(state => state.selectedNodeId)
    const setSelectedNodeId = useUIStore(state => state.setSelectedNodeId)

    const catalogNode = useMemo(() => getNodeById(data.catalogId), [data.catalogId])

    const isHighlighted = useMemo(() =>
        isNodeHighlightedForOverlay(data.catalogId, activeOverlay),
        [data.catalogId, activeOverlay]
    )

    const IconComponent: React.ElementType = useMemo(() =>
        iconMap[catalogNode?.icon || 'database'] || Database,
        [catalogNode?.icon]
    )

    const status = data.status || 'optional'
    const theme = categoryThemes[data.category] || categoryThemes.sources
    const isGap = status === 'gap'
    const isRailNode = data.isRailNode || data.category === 'governance' || data.category === 'identity'
    const isAccountGraph = data.category === 'identity'

    // Status badge styling
    const statusConfig: Record<NodeStatus, { label: string; className: string; icon: React.ElementType }> = {
        existing: { label: 'Existing', className: 'bg-green-100 text-green-700', icon: Check },
        recommended: { label: 'Recommended', className: 'bg-cyan-100 text-cyan-700', icon: Sparkles },
        required: { label: 'Required', className: 'bg-blue-100 text-blue-700', icon: Plus },
        gap: { label: 'Missing', className: 'bg-rose-100 text-rose-700', icon: AlertTriangle },
        optional: { label: 'Optional', className: 'bg-slate-100 text-slate-600', icon: Plus }
    }

    const statusInfo = statusConfig[status]
    const StatusIcon = statusInfo.icon

    return (
        <div
            className={cn(
                'relative flex flex-col items-center group animate-scale-in',
                // Larger minimum touch target
                'min-w-[180px] min-h-[60px]',
                // Gap state - dashed, faded
                isGap && 'opacity-80',
                // Rail node special styling
                isRailNode && 'shadow-lg',
                // Dimmed when overlay active and not highlighted
                activeOverlay && !isHighlighted && 'opacity-30 blur-[1px]'
            )}
        >
            {/* Main Node Card */}
            <div
                className={cn(
                    'relative flex items-center gap-3 px-4 py-3 rounded-xl w-full',
                    'border-2 transition-all duration-300 ease-out backdrop-blur-md shadow-sm',
                    theme.bg, theme.border,
                    // Gap styling
                    isGap && 'border-dashed border-2 animate-pulse',
                    // Selection
                    selected && 'ring-4 ring-offset-2 ring-primary border-primary shadow-xl scale-105 z-10',
                    // Dragging
                    dragging && 'shadow-2xl scale-110 rotate-2 cursor-grabbing opacity-90',
                    // Hover
                    !dragging && !selected && 'hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 cursor-pointer',
                    // Recommended glow
                    status === 'recommended' && 'animate-pulse-glow border-cyan-400',
                    // Rail nodes get thick left border
                    isRailNode && 'border-l-[6px]',
                    isRailNode && data.category === 'governance' && 'border-l-amber-400 bg-amber-50/90',
                    isRailNode && isAccountGraph && 'border-l-emerald-400 bg-emerald-50/90'
                )}
            >
                {/* Icon Container */}
                <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg shadow-inner shrink-0',
                    'bg-white/80 dark:bg-black/20',
                    isGap && 'opacity-60'
                )}>
                    {React.createElement(IconComponent, { className: cn('w-6 h-6', theme.icon) })}
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0 flex-1">
                    {/* Label */}
                    <span className={cn(
                        'text-sm font-bold truncate leading-tight',
                        theme.text,
                        isGap && 'opacity-70'
                    )}>
                        {data.label}
                    </span>

                    {/* Category Label (New) */}
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60 truncate">
                        {categoryMeta[data.category]?.label || data.category}
                    </span>
                </div>

                {/* Status indicator (Badge style) */}
                {status !== 'optional' && status !== 'existing' && (
                    <div className={cn(
                        'absolute -top-3 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-1',
                        statusInfo.className,
                        (status === 'recommended' || status === 'required') && 'animate-bounce'
                    )}>
                        {status === 'gap' && <AlertTriangle className="w-3 h-3" />}
                        {status === 'recommended' && <Sparkles className="w-3 h-3" />}
                        {statusInfo.label}
                    </div>
                )}

                {/* Existing checkmark */}
                {status === 'existing' && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                )}

                {/* Rail indicator badge */}
                {isRailNode && (
                    <div className={cn(
                        'absolute -bottom-2.5 left-1/2 -translate-x-1/2',
                        'text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm border',
                        data.category === 'governance' && 'bg-amber-100 text-amber-700 border-amber-200',
                        isAccountGraph && 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    )}>
                        {isAccountGraph ? 'Identity Hub' : 'Governance'}
                    </div>
                )}
            </div>

            {/* Handles - Larger touch targets */}
            <Handle
                type="target"
                position={Position.Left}
                className={cn(
                    'w-4 h-4 !bg-slate-400 !border-4 !border-white dark:!border-slate-800 rounded-full',
                    'hover:!bg-primary hover:scale-125 transition-all duration-200',
                    '-ml-2'
                )}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={cn(
                    'w-4 h-4 !bg-slate-400 !border-4 !border-white dark:!border-slate-800 rounded-full',
                    'hover:!bg-primary hover:scale-125 transition-all duration-200',
                    '-mr-2'
                )}
            />
        </div>
    )
}

// Memoize to prevent unnecessary re-renders
export default memo(MdfNodeComponent)
