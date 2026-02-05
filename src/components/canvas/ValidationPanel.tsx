'use client'

// Validation Panel - Collapsible panel showing validation results

import { useMemo } from 'react'
import { useUIStore } from '@/store/ui-store'
import { useCanvasStore } from '@/store/canvas-store'
import { getNodeById } from '@/data/node-catalog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    ChevronDown, ChevronUp, AlertCircle, AlertTriangle,
    Lightbulb, Plus, CheckCircle
} from 'lucide-react'

export default function ValidationPanel() {
    const { validationResults, isValidationPanelOpen, setValidationPanelOpen } = useUIStore()
    const { addNode, nodes } = useCanvasStore()

    const totalIssues = useMemo(() => {
        if (!validationResults) return 0
        return validationResults.errors.length +
            validationResults.warnings.length +
            validationResults.recommendations.length
    }, [validationResults])

    const handleAddRecommended = (catalogId: string) => {
        const catalogNode = getNodeById(catalogId)
        if (!catalogNode) return

        const baseX = 500 + Math.random() * 100
        const baseY = 200 + nodes.length * 20
        addNode(catalogId, catalogNode.name, catalogNode.category, { x: baseX, y: baseY })
    }

    if (!validationResults || totalIssues === 0) {
        return (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">All validations passed</span>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2 z-10',
            'w-[500px] max-w-[calc(100%-2rem)]',
            'bg-background/95 backdrop-blur border rounded-lg shadow-xl',
            'transition-all duration-200'
        )}>
            {/* Header */}
            <button
                onClick={() => setValidationPanelOpen(!isValidationPanelOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-t-lg"
            >
                <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">Validation</span>
                    <div className="flex items-center gap-2">
                        {validationResults.errors.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {validationResults.errors.length} Error{validationResults.errors.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {validationResults.warnings.length > 0 && (
                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                                {validationResults.warnings.length} Warning{validationResults.warnings.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                        {validationResults.recommendations.length > 0 && (
                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                                {validationResults.recommendations.length} Tip{validationResults.recommendations.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                </div>
                {isValidationPanelOpen ? (
                    <ChevronDown className="w-4 h-4" />
                ) : (
                    <ChevronUp className="w-4 h-4" />
                )}
            </button>

            {/* Content */}
            {isValidationPanelOpen && (
                <ScrollArea className="max-h-48 border-t">
                    <div className="p-3 space-y-2">
                        {/* Errors */}
                        {validationResults.errors.map(result => (
                            <div key={result.id} className="flex items-start gap-3 p-2 rounded bg-destructive/10">
                                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">{result.message}</p>
                                </div>
                                {result.recommendation?.nodeToAdd && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="shrink-0 h-7 text-xs"
                                        onClick={() => handleAddRecommended(result.recommendation!.nodeToAdd!)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Fix
                                    </Button>
                                )}
                            </div>
                        ))}

                        {/* Warnings */}
                        {validationResults.warnings.map(result => (
                            <div key={result.id} className="flex items-start gap-3 p-2 rounded bg-amber-500/10">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">{result.message}</p>
                                </div>
                                {result.recommendation?.nodeToAdd && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="shrink-0 h-7 text-xs"
                                        onClick={() => handleAddRecommended(result.recommendation!.nodeToAdd!)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add
                                    </Button>
                                )}
                            </div>
                        ))}

                        {/* Recommendations */}
                        {validationResults.recommendations.map(result => (
                            <div key={result.id} className="flex items-start gap-3 p-2 rounded bg-blue-500/10">
                                <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">{result.message}</p>
                                </div>
                                {result.recommendation?.nodeToAdd && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="shrink-0 h-7 text-xs"
                                        onClick={() => handleAddRecommended(result.recommendation!.nodeToAdd!)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    )
}
