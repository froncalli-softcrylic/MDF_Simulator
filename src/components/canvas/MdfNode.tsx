'use client'

// MDF Custom Node Component for React Flow
// Updated for B2B SaaS categories with governance rail and account graph
// Features distinct styling for rail nodes and gap states

import { memo, useMemo, useCallback } from 'react'
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
    source: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600', text: 'text-cyan-900' },
    collection: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', text: 'text-purple-900' },
    ingestion: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', text: 'text-violet-900' },
    storage_raw: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-600', text: 'text-slate-900' },
    storage_warehouse: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-900' },
    transform: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', text: 'text-indigo-900' },
    analytics: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600', text: 'text-pink-900' },
    activation: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', text: 'text-green-900' },
    destination: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600', text: 'text-teal-900' },
    // Rail categories (distinct styling)
    governance_rail: { bg: 'bg-amber-50', border: 'border-amber-300', icon: 'text-amber-600', text: 'text-amber-900' },
    account_graph: { bg: 'bg-emerald-50', border: 'border-emerald-300', icon: 'text-emerald-600', text: 'text-emerald-900' }
}

// Check if node should be highlighted for overlay
function isNodeHighlightedForOverlay(catalogId: string, overlay: ValueOverlay): boolean {
    if (!overlay) return true
    const catalogNode = getNodeById(catalogId)
    if (!catalogNode) return false
    return catalogNode.enables.includes(overlay)
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

    const IconComponent = useMemo(() =>
        iconMap[catalogNode?.icon || 'database'] || Database,
        [catalogNode?.icon]
    )

    const status = data.status || 'optional'
    const theme = categoryThemes[data.category] || categoryThemes.source
    const isGap = status === 'gap'
    const isRailNode = data.isRailNode || data.category === 'governance_rail' || data.category === 'account_graph'
    const isAccountGraph = data.category === 'account_graph'

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
                'relative flex flex-col items-center',
                // Minimum touch target
                'min-w-[120px] min-h-[40px]',
                // Gap state - dashed, faded
                isGap && 'opacity-70',
                // Rail node special styling
                isRailNode && 'shadow-md',
                // Dimmed when overlay active and not highlighted
                activeOverlay && !isHighlighted && 'opacity-30'
            )}
        >
            {/* Main Node Card */}
            <div
                className={cn(
                    'relative flex items-center gap-2 px-3 py-2 rounded-lg',
                    'border transition-all duration-150',
                    theme.bg, theme.border,
                    // Gap styling
                    isGap && 'border-dashed border-2',
                    // Selection
                    selected && 'ring-2 ring-offset-1 ring-cyan-400',
                    // Dragging
                    dragging && 'shadow-lg scale-105',
                    // Hover
                    !dragging && 'hover:shadow-md hover:scale-[1.02]',
                    // Rail nodes get thicker left border
                    isRailNode && 'border-l-4',
                    isRailNode && data.category === 'governance_rail' && 'border-l-amber-400',
                    isRailNode && isAccountGraph && 'border-l-emerald-400'
                )}
            >
                {/* Icon */}
                <div className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-md',
                    theme.bg,
                    isGap && 'opacity-60'
                )}>
                    <IconComponent className={cn('w-4 h-4', theme.icon)} />
                </div>

                {/* Label */}
                <span className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    theme.text,
                    isGap && 'opacity-70'
                )}>
                    {data.label}
                </span>

                {/* Status indicator (small dot) */}
                {status !== 'optional' && (
                    <div className={cn(
                        'absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                        statusInfo.className
                    )}>
                        <StatusIcon className="w-2.5 h-2.5" />
                    </div>
                )}

                {/* Rail indicator badge */}
                {isRailNode && (
                    <div className={cn(
                        'absolute -bottom-1 left-1/2 -translate-x-1/2',
                        'text-[8px] font-bold uppercase tracking-wider px-1 rounded',
                        data.category === 'governance_rail' && 'bg-amber-200 text-amber-700',
                        isAccountGraph && 'bg-emerald-200 text-emerald-700'
                    )}>
                        {isAccountGraph ? 'Graph' : 'Gov'}
                    </div>
                )}
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className={cn(
                    'w-2.5 h-2.5 !bg-slate-300 !border-2 !border-white rounded-full',
                    'hover:!bg-cyan-400 transition-colors'
                )}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={cn(
                    'w-2.5 h-2.5 !bg-slate-300 !border-2 !border-white rounded-full',
                    'hover:!bg-cyan-400 transition-colors'
                )}
            />
        </div>
    )
}

// Memoize to prevent unnecessary re-renders
export default memo(MdfNodeComponent)
