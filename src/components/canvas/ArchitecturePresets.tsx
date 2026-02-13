'use client'

import { useCallback, useMemo, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import {
    edgeCaseTemplates,
    generateDiagramFromEdgeCaseTemplate,
    type EdgeCaseTemplate
} from '@/lib/diagram-generator'
import { cn } from '@/lib/utils'
import {
    Layers, ChevronRight, ChevronLeft, Server, Zap,
    BarChart2, Target, Sparkles, Layout, FileText, Loader2
} from 'lucide-react'

const groupLabels: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
    starter: {
        label: 'Getting Started',
        icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
        description: 'Pre-built MDF architectures — pick one to begin'
    },
    architecture: {
        label: 'Data Architectures',
        icon: <Server className="w-4 h-4 text-violet-400" />,
        description: 'Infrastructure patterns for specific technical needs'
    },
    use_case: {
        label: 'Use Cases',
        icon: <Target className="w-4 h-4 text-amber-400" />,
        description: 'Business-outcome-driven pipeline patterns'
    }
}

const groupOrder = ['starter', 'architecture', 'use_case'] as const

export default function ArchitecturePresets() {
    const { isPaletteOpen, setIsPaletteOpen } = useUIStore()
    const { loadGraph, setNodes } = useCanvasStore()
    const { fitView } = useReactFlow()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [activePresetId, setActivePresetId] = useState<string | null>(null)

    const groupedTemplates = useMemo(() => {
        const groups: Record<string, EdgeCaseTemplate[]> = {}
        edgeCaseTemplates.forEach(t => {
            if (!groups[t.category]) groups[t.category] = []
            groups[t.category].push(t)
        })
        return groups
    }, [])

    const handleLoadPreset = useCallback(async (template: EdgeCaseTemplate) => {
        setLoadingId(template.id)

        // Small delay for visual feedback
        await new Promise(r => setTimeout(r, 200))

        const graph = generateDiagramFromEdgeCaseTemplate(template.id)
        if (!graph) {
            setLoadingId(null)
            return
        }

        loadGraph(graph)
        setActivePresetId(template.id)

        // Apply semantic auto-layout
        try {
            const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
            const layoutedNodes = await semanticAutoLayout(graph.nodes, graph.edges)
            setNodes(layoutedNodes)
        } catch (e) {
            // Layout failed, positions from generator are still fine
        }

        setTimeout(() => fitView({ padding: 0.35, duration: 600 }), 100)
        setLoadingId(null)
    }, [loadGraph, setNodes, fitView])

    const handleEmptyCanvas = useCallback(() => {
        loadGraph({ nodes: [], edges: [] })
        setActivePresetId(null)
    }, [loadGraph])

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
                    className="rounded-l-none rounded-r-lg h-10 px-2 shadow-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-700"
                    onClick={() => setIsPaletteOpen(true)}
                >
                    <Layout className="w-4 h-4" />
                </Button>
            </div>

            {/* Sidebar Panel */}
            <div
                id="tour-palette"
                className={cn(
                    'absolute top-0 left-0 h-full z-20 transition-all duration-300 ease-out',
                    'w-72',
                    isPaletteOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="h-full bg-slate-950/95 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Layout className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-sm font-bold text-white tracking-wide">Architecture Presets</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-white"
                            onClick={() => setIsPaletteOpen(false)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Presets List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
                        {groupOrder.map(groupKey => {
                            const templates = groupedTemplates[groupKey]
                            if (!templates || templates.length === 0) return null
                            const group = groupLabels[groupKey]

                            return (
                                <div key={groupKey}>
                                    {/* Group Header */}
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        {group.icon}
                                        <div>
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{group.label}</h3>
                                            <p className="text-[10px] text-slate-500 leading-tight">{group.description}</p>
                                        </div>
                                    </div>

                                    {/* Template Cards */}
                                    <div className="space-y-2">
                                        {templates.map(template => {
                                            const isActive = activePresetId === template.id
                                            const isLoading = loadingId === template.id

                                            return (
                                                <button
                                                    key={template.id}
                                                    onClick={() => handleLoadPreset(template)}
                                                    disabled={isLoading}
                                                    className={cn(
                                                        'w-full text-left p-3 rounded-lg border transition-all duration-200 group',
                                                        isActive
                                                            ? 'bg-cyan-950/40 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                                                            : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10',
                                                        isLoading && 'opacity-60 cursor-wait'
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={cn(
                                                                    'text-sm font-semibold truncate',
                                                                    isActive ? 'text-cyan-300' : 'text-slate-200'
                                                                )}>
                                                                    {template.name}
                                                                </span>
                                                                {isActive && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-cyan-500/20 text-cyan-400">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                                                                {template.description}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-[10px] text-slate-500">
                                                                    <Layers className="w-3 h-3 inline mr-0.5 -mt-0.5" />{template.nodes.length} nodes
                                                                </span>
                                                                <span className="text-[10px] text-slate-500">
                                                                    <Zap className="w-3 h-3 inline mr-0.5 -mt-0.5" />{template.edges.length} connections
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0 mt-1">
                                                            {isLoading ? (
                                                                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                                                            ) : (
                                                                <ChevronRight className={cn(
                                                                    'w-4 h-4 transition-transform',
                                                                    isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'
                                                                )} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Empty Canvas Option */}
                        <div className="pt-2 border-t border-white/5">
                            <button
                                onClick={handleEmptyCanvas}
                                className="w-full text-left p-3 rounded-lg border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <div>
                                        <span className="text-sm font-medium text-slate-400">Custom (Empty Canvas)</span>
                                        <p className="text-[10px] text-slate-600 mt-0.5">Start from scratch — use AI Advisor to build</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
