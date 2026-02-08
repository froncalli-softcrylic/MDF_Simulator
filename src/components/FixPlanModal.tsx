'use client'

// Fix Plan Modal Component
// Shows Smart Connect suggestions for user review before applying

import { useState, useMemo } from 'react'
import { X, Check, AlertTriangle, Zap, Plus, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import type { FixPlan, SuggestedEdge, SuggestedNodeInsertion } from '@/lib/smart-connect-engine'
import { getFixPlanSummary } from '@/lib/smart-connect-engine'
import { getNodeById } from '@/data/node-catalog'

interface FixPlanModalProps {
    fixPlan: FixPlan
    onApply: (updatedPlan: FixPlan) => void
    onCancel: () => void
    isOpen: boolean
}

export function FixPlanModal({ fixPlan, onApply, onCancel, isOpen }: FixPlanModalProps) {
    const [plan, setPlan] = useState(fixPlan)
    const [showOptional, setShowOptional] = useState(false)

    const selectedCount = useMemo(() => {
        return plan.suggestedEdges.filter(e => e.selected).length +
            plan.suggestedInsertions.filter(i => i.selected).length
    }, [plan])

    const { requiredItems, highConfidenceItems, optionalItems } = useMemo(() => {
        const required = [
            ...plan.suggestedInsertions.filter(i => i.required),
            ...plan.suggestedEdges.filter(e => e.required)
        ]
        const highConf = plan.suggestedEdges.filter(e => !e.required && e.confidence === 'high')
        const optional = plan.suggestedEdges.filter(e => !e.required && e.confidence !== 'high')

        return { requiredItems: required, highConfidenceItems: highConf, optionalItems: optional }
    }, [plan])

    const toggleEdge = (id: string) => {
        setPlan(p => ({
            ...p,
            suggestedEdges: p.suggestedEdges.map(e =>
                e.id === id ? { ...e, selected: !e.selected } : e
            )
        }))
    }

    const toggleInsertion = (id: string) => {
        setPlan(p => ({
            ...p,
            suggestedInsertions: p.suggestedInsertions.map(i =>
                i.id === id ? { ...i, selected: !i.selected } : i
            )
        }))
    }

    const selectAll = () => {
        setPlan(p => ({
            ...p,
            suggestedEdges: p.suggestedEdges.map(e => ({ ...e, selected: true })),
            suggestedInsertions: p.suggestedInsertions.map(i => ({ ...i, selected: true }))
        }))
    }

    const selectRequired = () => {
        setPlan(p => ({
            ...p,
            suggestedEdges: p.suggestedEdges.map(e => ({ ...e, selected: e.required || e.confidence === 'high' })),
            suggestedInsertions: p.suggestedInsertions.map(i => ({ ...i, selected: i.required }))
        }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Smart Connect</h2>
                            <p className="text-sm text-muted-foreground">{getFixPlanSummary(fixPlan)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Required Fixes */}
                    {requiredItems.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                                <AlertTriangle className="w-4 h-4" />
                                Required Fixes ({requiredItems.length})
                            </div>
                            <div className="space-y-2">
                                {plan.suggestedInsertions.filter(i => i.required).map(insertion => (
                                    <InsertionRow
                                        key={insertion.id}
                                        insertion={insertion}
                                        onToggle={() => toggleInsertion(insertion.id)}
                                    />
                                ))}
                                {plan.suggestedEdges.filter(e => e.required).map(edge => (
                                    <EdgeRow
                                        key={edge.id}
                                        edge={edge}
                                        onToggle={() => toggleEdge(edge.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* High Confidence */}
                    {highConfidenceItems.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                <Check className="w-4 h-4" />
                                High Confidence ({highConfidenceItems.length})
                            </div>
                            <div className="space-y-2">
                                {highConfidenceItems.map(edge => (
                                    <EdgeRow
                                        key={edge.id}
                                        edge={edge}
                                        onToggle={() => toggleEdge(edge.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Optional */}
                    {optionalItems.length > 0 && (
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowOptional(!showOptional)}
                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Optional Suggestions ({optionalItems.length})
                            </button>
                            {showOptional && (
                                <div className="space-y-2">
                                    {optionalItems.map(edge => (
                                        <EdgeRow
                                            key={edge.id}
                                            edge={edge}
                                            onToggle={() => toggleEdge(edge.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {plan.totalSuggestions === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
                            <p>Your MDF architecture looks complete!</p>
                            <p className="text-sm">No connectivity issues detected.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className="text-sm text-primary hover:underline"
                        >
                            Select All
                        </button>
                        <span className="text-muted-foreground">•</span>
                        <button
                            onClick={selectRequired}
                            className="text-sm text-primary hover:underline"
                        >
                            Select Required Only
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onApply(plan)}
                            disabled={selectedCount === 0}
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply Selected ({selectedCount})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Sub-components
// ============================================

interface EdgeRowProps {
    edge: SuggestedEdge
    onToggle: () => void
}

function EdgeRow({ edge, onToggle }: EdgeRowProps) {
    const confidenceColors = {
        high: 'bg-green-500/10 text-green-600 border-green-500/20',
        medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        low: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }

    return (
        <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
            <input
                type="checkbox"
                checked={edge.selected}
                onChange={onToggle}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{edge.reason}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Port: {edge.portType}
                </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceColors[edge.confidence]}`}>
                {edge.confidence}
            </span>
        </label>
    )
}

interface InsertionRowProps {
    insertion: SuggestedNodeInsertion
    onToggle: () => void
}

function InsertionRow({ insertion, onToggle }: InsertionRowProps) {
    const catalogNode = getNodeById(insertion.catalogId)

    return (
        <label className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors">
            <input
                type="checkbox"
                checked={insertion.selected}
                onChange={onToggle}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Plus className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span>Add {catalogNode?.name || insertion.catalogId}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {insertion.reason}
                </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
                required
            </span>
        </label>
    )
}

export default FixPlanModal
