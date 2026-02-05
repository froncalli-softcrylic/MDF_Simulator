'use client'

// Node Palette - Left sidebar with draggable nodes
// Updated for B2B SaaS categories with governance rail and account graph

import { useCallback, useMemo, useRef } from 'react'
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
    Radio, HardDrive, Server, Code, ExternalLink, Eye, Info
} from 'lucide-react'

// Category icons (updated for B2B SaaS)
const categoryIcons: Record<NodeCategory, React.ElementType> = {
    // Pipeline categories
    source: Database,
    collection: Radio,
    ingestion: Zap,
    storage_raw: HardDrive,
    storage_warehouse: Server,
    transform: Code,
    analytics: BarChart2,
    activation: Send,
    destination: ExternalLink,
    // Rail categories
    governance_rail: Shield,
    account_graph: GitMerge
}

// Category order (B2B SaaS flow)
const categoryOrder: NodeCategory[] = [
    // Pipeline (main flow)
    'source', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse',
    'transform', 'analytics', 'activation', 'destination',
    // Rails (separate section)
    'governance_rail', 'account_graph'
]

// Category colors for drag preview
const categoryColors: Record<NodeCategory, string> = {
    source: '#06b6d4',      // Cyan
    collection: '#8b5cf6',   // Purple
    ingestion: '#a855f7',    // Violet
    storage_raw: '#64748b',  // Slate
    storage_warehouse: '#3b82f6', // Blue
    transform: '#6366f1',    // Indigo
    analytics: '#ec4899',    // Pink
    activation: '#22c55e',   // Green
    destination: '#14b8a6',  // Teal
    governance_rail: '#f59e0b', // Amber
    account_graph: '#10b981'    // Emerald
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
        event.dataTransfer.setData('application/mdf-node', catalogId)
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
                'group flex items-center gap-1 p-1.5 rounded cursor-grab active:cursor-grabbing',
                'hover:bg-slate-100/80 transition-colors duration-150',
                isEmphasized && 'bg-cyan-50/50 border border-cyan-200/50',
                isRail && 'border-l-2',
                isRail && category === 'governance_rail' && 'border-l-amber-400',
                isRail && category === 'account_graph' && 'border-l-emerald-400'
            )}
            title={`Drag to canvas or double-click to add`}
        >
            <GripVertical className="w-3 h-3 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs text-slate-700 truncate flex-1">{name}</span>
            {isEmphasized && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-cyan-100 text-cyan-700 flex-shrink-0">
                    ★
                </Badge>
            )}
        </div>
    )
}

export default function NodePalette() {
    const { activeProfile } = useProfileStore()
    const { addNode } = useCanvasStore()
    const { isPaletteOpen, setIsPaletteOpen } = useUIStore()

    // Group and filter nodes by category (profile-aware)
    const nodesByCategory = useMemo(() => {
        const groups: Record<NodeCategory, typeof nodeCatalog> = {
            source: [],
            collection: [],
            ingestion: [],
            storage_raw: [],
            storage_warehouse: [],
            transform: [],
            analytics: [],
            activation: [],
            destination: [],
            governance_rail: [],
            account_graph: []
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
        addNode(catalogId, { x: 400, y: 300 })
    }, [addNode])

    // Separate main pipeline categories from rails
    const pipelineCategories: NodeCategory[] = [
        'source', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse',
        'transform', 'analytics', 'activation', 'destination'
    ]
    const railCategories: NodeCategory[] = ['governance_rail', 'account_graph']

    return (
        <>
            {/* Collapsed toggle */}
            <div
                className={cn(
                    'absolute left-0 top-16 z-30 transition-all duration-300 ease-out',
                    isPaletteOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
                )}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPaletteOpen(true)}
                    className="rounded-l-none shadow-md h-12"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Main palette with slide animation */}
            <div
                className={cn(
                    'absolute left-0 top-12 bottom-0 z-20',
                    'bg-white/95 backdrop-blur shadow-lg border-r border-slate-200',
                    'transition-all duration-300 ease-out',
                    isPaletteOpen ? 'w-52 translate-x-0' : 'w-52 -translate-x-full'
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-2 border-b border-slate-200">
                        <span className="text-xs font-semibold text-slate-600">Components</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPaletteOpen(false)}
                            className="h-6 w-6 p-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Node list */}
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-3">
                            {/* Pipeline Categories */}
                            {pipelineCategories.map(category => {
                                const nodes = nodesByCategory[category]
                                if (nodes.length === 0) return null

                                const meta = categoryMeta[category]
                                const Icon = categoryIcons[category]

                                return (
                                    <div key={category}>
                                        <div className="flex items-center gap-1.5 px-1 mb-1">
                                            <Icon className="w-3.5 h-3.5 text-slate-500" />
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                                                {meta?.label || category}
                                            </span>
                                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 ml-auto">
                                                {nodes.length}
                                            </Badge>
                                        </div>
                                        <div className="space-y-0.5">
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

                            {/* Separator for Rails */}
                            <Separator className="my-2" />
                            <div className="px-1 mb-1">
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                                    Cross-Cutting Rails
                                </span>
                            </div>

                            {/* Rail Categories */}
                            {railCategories.map(category => {
                                const nodes = nodesByCategory[category]
                                if (nodes.length === 0) return null

                                const meta = categoryMeta[category]
                                const Icon = categoryIcons[category]

                                return (
                                    <div key={category}>
                                        <div className="flex items-center gap-1.5 px-1 mb-1">
                                            <Icon
                                                className="w-3.5 h-3.5"
                                                style={{ color: meta?.color }}
                                            />
                                            <span
                                                className="text-[10px] font-semibold uppercase tracking-wide"
                                                style={{ color: meta?.color }}
                                            >
                                                {meta?.label || category}
                                            </span>
                                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 ml-auto">
                                                {nodes.length}
                                            </Badge>
                                        </div>
                                        <div className="space-y-0.5">
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
                    <div className="p-2 border-t border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400">
                            Drag or double-click to add
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}
