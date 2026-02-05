'use client'

// Smart Connect Panel - Shows edge suggestions after auto layout

import { useState, useCallback } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import type { SuggestedEdge, SuggestedFixes } from '@/types'
import { getNodeById } from '@/data/node-catalog'
import { generateId } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, X, Link2, AlertCircle, Sparkles } from 'lucide-react'

interface SmartConnectPanelProps {
    suggestedFixes: SuggestedFixes
    onApply: (edges: SuggestedEdge[]) => void
    onDismiss: () => void
    className?: string
}

export default function SmartConnectPanel({
    suggestedFixes,
    onApply,
    onDismiss,
    className
}: SmartConnectPanelProps) {
    const [selectedEdges, setSelectedEdges] = useState<Set<string>>(
        () => new Set(suggestedFixes.suggestedEdges.filter(e => e.confidence === 'high').map(e => e.id))
    )

    const toggleEdge = useCallback((id: string) => {
        setSelectedEdges(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    const handleApply = useCallback(() => {
        const edgesToApply = suggestedFixes.suggestedEdges.filter(e => selectedEdges.has(e.id))
        onApply(edgesToApply)
    }, [suggestedFixes.suggestedEdges, selectedEdges, onApply])

    const selectAll = useCallback(() => {
        setSelectedEdges(new Set(suggestedFixes.suggestedEdges.map(e => e.id)))
    }, [suggestedFixes.suggestedEdges])

    const selectNone = useCallback(() => {
        setSelectedEdges(new Set())
    }, [])

    const { suggestedEdges, missingNodes, orphanedNodes } = suggestedFixes
    const hasSuggestions = suggestedEdges.length > 0 || missingNodes.length > 0

    if (!hasSuggestions) {
        return null
    }

    return (
        <div
            className={cn(
                'absolute bottom-4 left-1/2 -translate-x-1/2 z-30',
                'bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200',
                'w-[480px] max-h-[400px] overflow-hidden',
                'animate-in slide-in-from-bottom-4 fade-in duration-300',
                className
            )}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-slate-800">
                        Smart Connect Suggestions
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {suggestedEdges.length} connections
                    </span>
                </div>
                <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Edge Suggestions */}
            {suggestedEdges.length > 0 && (
                <div className="max-h-[250px] overflow-y-auto">
                    <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
                        <span>Suggested Connections</span>
                        <div className="flex gap-2">
                            <button onClick={selectAll} className="hover:text-blue-600">Select all</button>
                            <span>·</span>
                            <button onClick={selectNone} className="hover:text-blue-600">Clear</button>
                        </div>
                    </div>
                    {suggestedEdges.map(edge => (
                        <div
                            key={edge.id}
                            onClick={() => toggleEdge(edge.id)}
                            className={cn(
                                'px-4 py-3 border-b border-slate-50 last:border-0',
                                'flex items-center gap-3 cursor-pointer transition-colors',
                                selectedEdges.has(edge.id)
                                    ? 'bg-blue-50/50'
                                    : 'hover:bg-slate-50'
                            )}
                        >
                            <div className={cn(
                                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                                selectedEdges.has(edge.id)
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-slate-300'
                            )}>
                                {selectedEdges.has(edge.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-slate-700 truncate">
                                        {edge.reason}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    Port: {edge.portTypes.source} → {edge.portTypes.target}
                                </div>
                            </div>

                            <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                edge.confidence === 'high' && 'bg-green-100 text-green-700',
                                edge.confidence === 'medium' && 'bg-yellow-100 text-yellow-700',
                                edge.confidence === 'low' && 'bg-slate-100 text-slate-600'
                            )}>
                                {edge.confidence}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Missing Nodes Warning */}
            {missingNodes.length > 0 && (
                <div className="px-4 py-3 bg-amber-50/50 border-t border-amber-100">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div className="text-sm">
                            <span className="font-medium text-amber-700">Missing stages: </span>
                            <span className="text-amber-600">
                                {missingNodes.map(n => n.stage).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                    {selectedEdges.size} of {suggestedEdges.length} selected
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                    >
                        Dismiss
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApply}
                        disabled={selectedEdges.size === 0}
                        className="gap-2"
                    >
                        <Link2 className="w-4 h-4" />
                        Apply ({selectedEdges.size})
                    </Button>
                </div>
            </div>
        </div>
    )
}
