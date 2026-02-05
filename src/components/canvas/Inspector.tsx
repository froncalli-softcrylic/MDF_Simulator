'use client'

// Inspector Panel - Right sidebar showing clicked node details
// Slide animation for open/close

import { useMemo } from 'react'
import { getNodeById, getRecommendedNodes } from '@/data/node-catalog'
import { useUIStore } from '@/store/ui-store'
import { useCanvasStore } from '@/store/canvas-store'
import { checkNodePrerequisites } from '@/lib/validation-engine'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    X, Plus, CheckCircle, XCircle,
    Zap, BarChart2, Users, Shield, Sparkles
} from 'lucide-react'

const enablesConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    activation: { icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10' },
    measurement: { icon: BarChart2, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    identity: { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    governance: { icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    hygiene: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' }
}

export default function Inspector() {
    const { selectedNodeId, isInspectorOpen, setIsInspectorOpen, setSelectedNodeId } = useUIStore()
    const { nodes, edges, addNode } = useCanvasStore()

    const catalogNode = useMemo(() =>
        selectedNodeId ? getNodeById(selectedNodeId) : null,
        [selectedNodeId]
    )

    const prerequisites = useMemo(() => {
        if (!selectedNodeId) return { met: [], missing: [] }
        return checkNodePrerequisites(selectedNodeId, nodes, edges)
    }, [selectedNodeId, nodes, edges])

    const recommendedNodes = useMemo(() =>
        selectedNodeId ? getRecommendedNodes(selectedNodeId) : [],
        [selectedNodeId]
    )

    const handleAddRecommended = (catalogId: string, name: string, category: string) => {
        addNode(catalogId, name, category, { x: 600 + Math.random() * 100, y: 200 + nodes.length * 20 })
    }

    const handleClose = () => {
        setIsInspectorOpen(false)
        setSelectedNodeId(null)
    }

    const shouldShow = isInspectorOpen && catalogNode

    return (
        <div
            className={cn(
                'absolute top-12 bottom-0 z-10 w-64 md:w-72 lg:w-80',
                'bg-background/95 backdrop-blur border-l shadow-xl flex flex-col',
                'transition-all duration-300 ease-out',
                shouldShow ? 'right-0 opacity-100' : '-right-80 opacity-0 pointer-events-none'
            )}
        >
            {catalogNode && (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between p-2 md:p-3 border-b">
                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold text-sm truncate">{catalogNode.name}</h2>
                            <Badge variant="secondary" className="mt-1 text-[10px]">
                                {catalogNode.category}
                            </Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-7 w-7 flex-shrink-0 ml-2">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-2 md:p-3 space-y-4">
                            {/* Description */}
                            <div>
                                <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">What it is</h3>
                                <p className="text-xs">{catalogNode.description}</p>
                            </div>

                            <Separator />

                            {/* Why it matters */}
                            <div>
                                <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">Why it matters</h3>
                                <ul className="space-y-1.5">
                                    {catalogNode.whyItMatters.map((point, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-xs">
                                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Separator />

                            {/* Enables */}
                            <div>
                                <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">Enables</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {catalogNode.enables.map(tag => {
                                        const config = enablesConfig[tag]
                                        const IconComponent = config?.icon || Zap
                                        return (
                                            <div
                                                key={tag}
                                                className={cn(
                                                    'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                                                    config?.bg || 'bg-secondary',
                                                    config?.color || 'text-foreground'
                                                )}
                                            >
                                                <IconComponent className="w-2.5 h-2.5" />
                                                {tag}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Prerequisites */}
                            {catalogNode.prerequisites.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">Prerequisites</h3>
                                        <div className="space-y-1.5">
                                            {prerequisites.met.map(prereqId => {
                                                const prereqNode = getNodeById(prereqId)
                                                return (
                                                    <div key={prereqId} className="flex items-center gap-1.5 text-xs">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span className="truncate flex-1">{prereqNode?.name || prereqId}</span>
                                                        <Badge variant="outline" className="text-[9px] flex-shrink-0">Met</Badge>
                                                    </div>
                                                )
                                            })}
                                            {prerequisites.missing.map(prereqId => {
                                                const prereqNode = getNodeById(prereqId)
                                                return (
                                                    <div key={prereqId} className="flex items-center gap-1.5 text-xs">
                                                        <XCircle className="w-3 h-3 text-destructive" />
                                                        <span className="text-muted-foreground truncate flex-1">{prereqNode?.name || prereqId}</span>
                                                        <Badge variant="destructive" className="text-[9px] flex-shrink-0">Missing</Badge>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Recommended */}
                            {recommendedNodes.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">Recommended Next</h3>
                                        <div className="space-y-1">
                                            {recommendedNodes.slice(0, 3).map(node => (
                                                <Button
                                                    key={node.id}
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full justify-start gap-1.5 text-xs h-7"
                                                    onClick={() => handleAddRecommended(node.id, node.name, node.category)}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span className="truncate">{node.name}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Proof points */}
                            {catalogNode.proofPoints && catalogNode.proofPoints.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">Case Studies</h3>
                                        <div className="space-y-2">
                                            {catalogNode.proofPoints.slice(0, 2).map(proof => (
                                                <Card key={proof.id} className="bg-muted/50">
                                                    <CardHeader className="pb-1 pt-2 px-2">
                                                        <CardTitle className="text-xs">{proof.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="px-2 pb-2">
                                                        <p className="text-[10px] text-muted-foreground line-clamp-2">{proof.description}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    )
}
