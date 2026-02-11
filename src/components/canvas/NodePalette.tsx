'use client'

// Node Palette - Left sidebar with draggable nodes
// Updated for B2B SaaS categories with governance and identity rules

import { useCallback, useMemo, useRef, useState } from 'react'
import { nodeCatalog, categoryMeta } from '@/data/node-catalog'
import { isNodeVisibleInProfile, isNodeEmphasizedInProfile } from '@/data/demo-profiles'
import { useProfileStore } from '@/store/profile-store'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { NodeCategory } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    ChevronLeft, ChevronRight, GripVertical,
    Database, Zap, Layers, GitMerge, Shield, BarChart2, Send,
    Radio, HardDrive, Server, Code, ExternalLink, Eye, Info,
    Lock as LockIcon, Search, XCircle
} from 'lucide-react'

// Category icons (updated for B2B SaaS)
const categoryIcons: Record<NodeCategory, React.ElementType> = {
    sources: Database,
    collection: Radio,
    ingestion: Zap,
    storage_raw: HardDrive,
    storage_warehouse: Server,
    transform: Code,
    mdf: Layers,             // Hub icon
    identity: GitMerge,
    governance: Shield,
    analytics: BarChart2,
    activation: Send,
    clean_room: LockIcon,
    realtime_serving: Zap,
    destination: ExternalLink
}

// Category order (B2B SaaS flow)
const categoryOrder: NodeCategory[] = [
    // Pipeline (main flow)
    'sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse',
    'transform', 'mdf', 'identity', 'governance', 'analytics', 'activation', 'clean_room', 'realtime_serving', 'destination'
]

// Category colors for drag preview
const categoryColors: Record<NodeCategory, string> = {
    sources: '#06b6d4',      // Cyan
    collection: '#8b5cf6',   // Purple
    ingestion: '#a855f7',    // Violet
    storage_raw: '#64748b',  // Slate
    storage_warehouse: '#3b82f6', // Blue
    transform: '#6366f1',    // Indigo
    mdf: '#f59e0b',          // Amber
    identity: '#10b981',     // Emerald
    governance: '#f59e0b',   // Amber
    analytics: '#ec4899',    // Pink
    activation: '#22c55e',   // Green
    clean_room: '#94a3b8',   // Slate-400
    realtime_serving: '#f97316', // Orange-500
    destination: '#14b8a6'   // Teal
}

interface DraggableNodeProps {
    catalogId: string
    name: string
    category: NodeCategory
    isEmphasized: boolean
    onAdd: () => void
}

function DraggableNode({ catalogId, name, category, isEmphasized, onAdd }: DraggableNodeProps) {
    const nodeRef = useRef<HTMLDivElement>(null)
    const categoryColor = categoryColors[category] || '#64748b'

    // Handle drag start
    const handleDragStart = useCallback((event: React.DragEvent) => {
        event.dataTransfer.setData('application/mdf-node', JSON.stringify({ catalogId, name, category }))
        event.dataTransfer.effectAllowed = 'copy'

        // Create custom drag image
        const dragPreview = document.createElement('div')
        dragPreview.className = 'fixed -left-[9999px] p-2 bg-white rounded shadow-lg text-sm font-medium'
        dragPreview.textContent = name
        dragPreview.style.borderLeft = `3px solid ${categoryColor}`
        document.body.appendChild(dragPreview)
        event.dataTransfer.setDragImage(dragPreview, 0, 0)

        // Clean up after drag
        setTimeout(() => document.body.removeChild(dragPreview), 0)
    }, [catalogId, name, categoryColor])

    // Get category meta for rail indication
    const meta = categoryMeta[category]
    const isRail = meta?.isRail

    return (
        <div
            ref={nodeRef}
            draggable
            onDragStart={handleDragStart}
            onDoubleClick={onAdd}
            className={cn(
                'group flex items-center gap-3 p-3.5 rounded-xl cursor-grab active:cursor-grabbing',
                'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm',
                'hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200',
                isEmphasized && 'ring-2 ring-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/10',
                isRail && 'border-l-4',
                isRail && category === 'governance' && 'border-l-amber-400',
                isRail && category === 'identity' && 'border-l-emerald-400'
            )}
            title={`Drag to canvas or double-click to add`}
        >
            <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                "bg-slate-50 dark:bg-slate-900 group-hover:bg-primary/10"
            )} style={{ color: categoryColor }}>
                <GripVertical className="w-5 h-5 opacity-50 group-hover:opacity-100" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-base font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {name}
                </span>
                {isEmphasized && (
                    <span className="text-xs text-cyan-600 font-medium">Recommended</span>
                )}
            </div>
        </div>
    )
}

export default function NodePalette() {
    const { activeProfile } = useProfileStore()
    const { addNode } = useCanvasStore()
    const { isPaletteOpen, setIsPaletteOpen } = useUIStore()
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Group and filter nodes by category (profile-aware)
    const nodesByCategory = useMemo(() => {
        const groups: Record<NodeCategory, typeof nodeCatalog> = {
            sources: [],
            collection: [],
            ingestion: [],
            storage_raw: [],
            storage_warehouse: [],
            transform: [],
            mdf: [],
            identity: [],
            governance: [],
            analytics: [],
            activation: [],
            clean_room: [],
            realtime_serving: [],
            destination: []
        }

        nodeCatalog
            .filter(node => isNodeVisibleInProfile(node.id, activeProfile))
            .forEach(node => {
                if (groups[node.category]) {
                    groups[node.category].push(node)
                }
            })

        return groups
    }, [activeProfile])

    const handleAddNode = useCallback((catalogId: string) => {
        // Add node to center of viewport
        const node = nodeCatalog.find(n => n.id === catalogId)
        if (node) {
            addNode(catalogId, node.name, node.category, { x: 400, y: 300 })
        }
    }, [addNode])

    // Separate main pipeline categories from rails
    const pipelineCategories: NodeCategory[] = [
        'sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse',
        'transform', 'mdf', 'identity', 'analytics', 'activation', 'destination', 'clean_room', 'realtime_serving'
    ]
    const railCategories: NodeCategory[] = ['governance']

    return (
        <>
            {/* Collapsed toggle */}
            <div
                className={cn(
                    'absolute left-0 top-20 z-30 transition-all duration-300 ease-out',
                    isPaletteOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
                )}
            >
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsPaletteOpen(true)}
                    className="rounded-l-none shadow-lg h-12 w-8 bg-primary/90 hover:bg-primary backdrop-blur-sm animate-pulse-glow"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </Button>
            </div>

            {/* Main palette with slide animation */}
            <div
                id="tour-palette"
                className={cn(
                    'absolute left-0 top-16 bottom-4 ml-4 z-20 rounded-2xl overflow-hidden',
                    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl border border-white/20',
                    'transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
                    isPaletteOpen ? 'w-72 lg:w-80 translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0'
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2">
                            <Layers className="w-6 h-6 text-primary" />
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                                Component Library
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPaletteOpen(false)}
                            className="h-9 w-9 p-0 rounded-full hover:bg-slate-200/50"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-3 pt-3 pb-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search components..."
                                className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); searchInputRef.current?.focus() }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Node list */}
                    <ScrollArea className="flex-1 px-3">
                        <div className="py-5 space-y-7">
                            {/* Pipeline Categories */}
                            {pipelineCategories.map(category => {
                                const query = searchQuery.toLowerCase().trim()
                                const nodes = query
                                    ? nodesByCategory[category].filter(n => n.name.toLowerCase().includes(query) || n.id.toLowerCase().includes(query))
                                    : nodesByCategory[category]
                                if (nodes.length === 0) return null

                                const meta = categoryMeta[category]
                                const Icon = categoryIcons[category]
                                const categoryColor = categoryColors[category]
                                return (
                                    <div key={category} className="space-y-3">
                                        <div className="flex items-center gap-2 px-2">
                                            <div
                                                className="w-1.5 h-5 rounded-full"
                                                style={{ backgroundColor: categoryColor }}
                                            />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {meta?.label || category}
                                            </h3>
                                        </div>

                                        <div className="grid gap-2.5">
                                            {nodes.map(node => (
                                                <DraggableNode
                                                    key={node.id}
                                                    catalogId={node.id}
                                                    name={node.name}
                                                    category={node.category}
                                                    isEmphasized={isNodeEmphasizedInProfile(node.id, activeProfile)}
                                                    onAdd={() => handleAddNode(node.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Rail Categories */}
                            <div className="relative py-3">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white dark:bg-slate-900 px-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        Governance Rails
                                    </span>
                                </div>
                            </div>

                            {railCategories.map(category => {
                                const query = searchQuery.toLowerCase().trim()
                                const nodes = query
                                    ? nodesByCategory[category].filter(n => n.name.toLowerCase().includes(query) || n.id.toLowerCase().includes(query))
                                    : nodesByCategory[category]
                                if (nodes.length === 0) return null

                                return (
                                    <div key={category} className="space-y-3">
                                        <div className="grid gap-2.5">
                                            {nodes.map(node => (
                                                <DraggableNode
                                                    key={node.id}
                                                    catalogId={node.id}
                                                    name={node.name}
                                                    category={node.category}
                                                    isEmphasized={isNodeEmphasizedInProfile(node.id, activeProfile)}
                                                    onAdd={() => handleAddNode(node.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>

                    {/* Footer hint */}
                    <div className="p-4 border-t border-white/20 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur text-center">
                        <p className="text-xs font-medium text-slate-400">
                            Drag to canvas or double-click to add
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
