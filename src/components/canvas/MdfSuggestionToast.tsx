'use client'

// MDF Suggestion Toast — Suggests consolidating pipeline into an MDF Hub
// Appears when detectMdfOpportunity finds enough MDF-eligible categories

import { useState, useCallback, useRef, useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'
import { useCanvasStore } from '@/store/canvas-store'
import { getNodeById } from '@/data/node-catalog'
import { buildMdfHubInternalGraph } from '@/lib/mdf-detection'
import type { MdfSuggestion } from '@/lib/mdf-detection'
import type { MdfNodeData, NodeCategory } from '@/types'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    X, GripHorizontal, Brain, Layers, ArrowRight,
    Sparkles, CheckCircle2
} from 'lucide-react'

// Category display metadata
const CATEGORY_META: Record<string, { label: string; color: string }> = {
    collection: { label: 'Collection', color: '#10b981' },
    ingestion: { label: 'Ingestion', color: '#6366f1' },
    storage_raw: { label: 'Raw Storage', color: '#f59e0b' },
    storage_warehouse: { label: 'Data Warehouse', color: '#3b82f6' },
    transform: { label: 'Transform', color: '#8b5cf6' },
    identity: { label: 'Identity Resolution', color: '#ec4899' },
    analytics: { label: 'Analytics', color: '#14b8a6' },
    activation: { label: 'Activation', color: '#f97316' },
}

interface MdfSuggestionToastProps {
    suggestion: MdfSuggestion
    onAutoLayout?: () => void
    className?: string
}

export default function MdfSuggestionToast({
    suggestion,
    onAutoLayout,
    className
}: MdfSuggestionToastProps) {
    const {
        setShowMdfSuggestionToast,
        setMdfSuggestion,
        setMdfSuggestionDismissed,
    } = useUIStore()

    // Drag state
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null)

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y,
        }
    }, [position])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return
            setPosition({
                x: dragRef.current.initialX + (e.clientX - dragRef.current.startX),
                y: dragRef.current.initialY + (e.clientY - dragRef.current.startY),
            })
        }
        const handleMouseUp = () => {
            setIsDragging(false)
            dragRef.current = null
        }
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    // === ACTION: Create MDF Hub ===
    const handleCreateMdfHub = useCallback(() => {
        const { nodes, edges, setNodes, setEdges } = useCanvasStore.getState()

        // 1. Identify source and destination nodes (stay on main canvas)
        const sourceNodeIds = new Set<string>()
        const destNodeIds = new Set<string>()
        const mdfCandidateIds = new Set(suggestion.candidates.map(c => c.nodeId))

        for (const node of nodes) {
            const data = node.data as MdfNodeData
            if (!data?.catalogId) continue
            const catalogNode = getNodeById(data.catalogId)
            if (!catalogNode) continue

            if (catalogNode.category === 'sources') sourceNodeIds.add(node.id)
            if (catalogNode.category === 'destination') destNodeIds.add(node.id)
        }

        // 2. Calculate MDF Hub position (center of absorbed nodes)
        const candidateNodes = nodes.filter(n => mdfCandidateIds.has(n.id))
        const avgX = candidateNodes.length > 0
            ? candidateNodes.reduce((sum, n) => sum + (n.position?.x ?? 0), 0) / candidateNodes.length
            : 500
        const avgY = candidateNodes.length > 0
            ? candidateNodes.reduce((sum, n) => sum + (n.position?.y ?? 0), 0) / candidateNodes.length
            : 300

        // 3. Create MDF Hub node
        const mdfHubId = `node-${generateId()}`
        const mdfHubCatalog = getNodeById('mdf_hub')
        const mdfHubNode = {
            id: mdfHubId,
            type: 'mdfNode',
            position: { x: avgX, y: avgY },
            data: {
                catalogId: 'mdf_hub',
                label: mdfHubCatalog?.name ?? 'MDF Hub (Unified Profile)',
                category: 'mdf' as NodeCategory,
                status: 'required',
                isRailNode: false,
                railPosition: undefined,
            } as MdfNodeData,
        }

        // 4. Remove absorbed nodes and their edges from main canvas
        const remainingNodes = nodes.filter(n => !mdfCandidateIds.has(n.id))
        remainingNodes.push(mdfHubNode as any)

        // 5. Rewire edges:
        //    - Sources that connected to absorbed nodes → connect to MDF Hub
        //    - Absorbed nodes that connected to destinations → MDF Hub connects to destinations
        const newEdges = []
        const rewiredSources = new Set<string>()
        const rewiredDests = new Set<string>()

        for (const edge of edges) {
            const srcAbsorbed = mdfCandidateIds.has(edge.source)
            const tgtAbsorbed = mdfCandidateIds.has(edge.target)

            if (srcAbsorbed && tgtAbsorbed) {
                // Both absorbed — skip (handled in internal graph)
                continue
            } else if (srcAbsorbed && !tgtAbsorbed) {
                // Absorbed source → external target: rewire MDF Hub → target
                const key = `${mdfHubId}->${edge.target}`
                if (!rewiredDests.has(key)) {
                    rewiredDests.add(key)
                    newEdges.push({
                        ...edge,
                        id: `edge-${generateId()}`,
                        source: mdfHubId,
                    })
                }
            } else if (!srcAbsorbed && tgtAbsorbed) {
                // External source → absorbed target: rewire source → MDF Hub
                const key = `${edge.source}->${mdfHubId}`
                if (!rewiredSources.has(key)) {
                    rewiredSources.add(key)
                    newEdges.push({
                        ...edge,
                        id: `edge-${generateId()}`,
                        target: mdfHubId,
                    })
                }
            } else {
                // Neither absorbed — keep as-is
                newEdges.push(edge)
            }
        }

        // 6. Build MDF Hub internal graph from the user's actual nodes
        const internalGraph = buildMdfHubInternalGraph(suggestion.candidates)

        // Store the internal graph on the MDF Hub node so it can be used when entering hub view
        mdfHubNode.data.internalGraph = internalGraph

        // 7. Update main canvas
        setNodes(remainingNodes)
        setEdges(newEdges)

        // 8. Close the toast
        setShowMdfSuggestionToast(false)
        setMdfSuggestion(null)

        // 9. Auto-trigger Connect/Clean Up to re-layout the updated canvas
        if (onAutoLayout) {
            setTimeout(() => onAutoLayout(), 100)
        }
    }, [suggestion, setShowMdfSuggestionToast, setMdfSuggestion, onAutoLayout])

    // === ACTION: Dismiss ===
    const handleDismiss = useCallback(() => {
        setShowMdfSuggestionToast(false)
        setMdfSuggestion(null)
        setMdfSuggestionDismissed(true)
    }, [setShowMdfSuggestionToast, setMdfSuggestion, setMdfSuggestionDismissed])

    return (
        <div
            className={cn(
                'absolute bottom-4 left-1/2 z-40',
                'bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95',
                'backdrop-blur-xl rounded-2xl shadow-2xl',
                'border border-violet-200/60 dark:border-violet-700/40',
                'w-[520px] max-w-[calc(100%-2rem)] overflow-hidden',
                position.x === 0 && position.y === 0 && 'animate-in slide-in-from-bottom-4 fade-in duration-500',
                isDragging && 'cursor-grabbing',
                className
            )}
            style={{
                transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`
            }}
        >
            {/* Header */}
            <div
                onMouseDown={handleMouseDown}
                className={cn(
                    'px-5 py-3.5 border-b border-violet-100/60 dark:border-violet-800/40',
                    'flex items-center justify-between',
                    'bg-gradient-to-r from-violet-50/80 to-blue-50/80 dark:from-violet-950/40 dark:to-blue-950/40',
                    'cursor-grab select-none',
                    isDragging && 'cursor-grabbing'
                )}
            >
                <div className="flex items-center gap-2.5">
                    <GripHorizontal className="w-4 h-4 text-slate-400" />
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-md">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            MDF Opportunity Detected
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Sparkles className="w-3 h-3 text-violet-500" />
                            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                                {suggestion.categoryCoverage} layers · {suggestion.totalNodes} components
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your pipeline components can be unified into a{' '}
                    <span className="font-semibold text-violet-700 dark:text-violet-400">Marketing Data Foundation</span>{' '}
                    — centralizing data hygiene, identity resolution, and activation into a single hub.
                </p>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                    {suggestion.coveredCategories.map(cat => {
                        const meta = CATEGORY_META[cat] || { label: cat, color: '#94a3b8' }
                        return (
                            <span
                                key={cat}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            >
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: meta.color }}
                                />
                                {meta.label}
                            </span>
                        )
                    })}
                </div>

                {/* Components Preview */}
                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Components to consolidate
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {suggestion.candidates.slice(0, 12).map(c => (
                            <span
                                key={c.nodeId}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                            >
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {c.name}
                            </span>
                        ))}
                        {suggestion.candidates.length > 12 && (
                            <span className="text-xs text-slate-400 px-1.5 py-0.5">
                                +{suggestion.candidates.length - 12} more
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    Consolidate into a unified MDF Hub
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        Dismiss
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleCreateMdfHub}
                        className="gap-1.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-md"
                    >
                        <Brain className="w-3.5 h-3.5" />
                        Create MDF Hub
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
