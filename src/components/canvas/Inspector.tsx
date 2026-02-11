'use client'

import React from 'react'

// Inspector Panel - Right sidebar showing clicked node details
// Slide animation for open/close

import { useMemo, useState } from 'react'
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
    Zap, BarChart2, Users, Shield, Sparkles,
    TrendingUp, Activity, Target, ChevronDown, ChevronRight, HardDrive, Fingerprint,
    ArrowLeft, ArrowRight, Key, Layers
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
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        strategic: true,
        technical: true,
        why: true
    })

    const toggleSection = (id: string) => {
        setExpandedSections((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }))
    }
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
            id="tour-inspector"
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
                            <Badge variant="secondary" className="mt-1 text-[10px] mr-1">
                                {catalogNode.category}
                            </Badge>
                            {catalogNode.nodeRole && (
                                <Badge variant="outline" className="mt-1 text-[10px] border-slate-300 text-slate-500">
                                    {catalogNode.nodeRole.replace('_', ' ')}
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-7 w-7 flex-shrink-0 ml-2">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-2 md:p-3 space-y-4">

                            {/* NEW: Business Value Section (Collapsible) */}
                            {catalogNode.businessValue && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => toggleSection('strategic')}
                                        className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            Strategic Value
                                        </div>
                                        {expandedSections.strategic ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                    </button>

                                    {expandedSections.strategic && (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                                            <p className="text-[11px] font-medium leading-relaxed mb-2.5 text-slate-700 dark:text-slate-300">
                                                {catalogNode.businessValue.proposition}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] h-5 border shadow-none",
                                                    catalogNode.businessValue.roi === 'high' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600"
                                                )} title="Estimated return on investment for this component">
                                                    ROI: {catalogNode.businessValue.roi.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline" className="text-[9px] h-5 bg-purple-50 text-purple-700 border-purple-200 shadow-none" title="Overall business impact level">
                                                    Impact: {catalogNode.businessValue.impact}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    <Separator className="mt-2" />
                                </div>
                            )}

                            {/* NEW: Technical Specs Section (Collapsible) */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => toggleSection('technical')}
                                    className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5" />
                                        Technical Specs
                                    </div>
                                    {expandedSections.technical ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                </button>

                                {expandedSections.technical && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {/* Latency */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <Zap className="w-3 h-3" /> Latency Support
                                            </div>
                                            <div className="flex gap-1">
                                                {(catalogNode.supportedLatency || ['batch']).map(l => (
                                                    <Badge key={l} variant="secondary" className="text-[9px] h-4 px-1.5 capitalize">
                                                        {l}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Identifiers */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <Fingerprint className="w-3 h-3" /> Identifiers
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {(() => {
                                                    const ids = Array.from(new Set([
                                                        ...(catalogNode.supportedIdentifiers || []),
                                                        ...(catalogNode.availableIdentities || [])
                                                    ]));

                                                    return ids.length > 0 ? (
                                                        ids.map(id => (
                                                            <Badge key={id} variant="outline" className="text-[9px] h-4 px-1.5 bg-white">
                                                                {id.replace('_', ' ')}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">None specified</span>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* NEW: Identity Keys */}
                                        {catalogNode.joinKeys && catalogNode.joinKeys.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Key className="w-3 h-3" /> Identity Keys
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {catalogNode.joinKeys.map(key => (
                                                        <Badge key={key} variant="outline" className="text-[9px] h-4 px-1.5 bg-slate-100 text-slate-700 border-slate-200">
                                                            {key}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* NEW: Data Concepts */}
                                        {catalogNode.dataConcepts && catalogNode.dataConcepts.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Layers className="w-3 h-3" /> Data Concepts
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {catalogNode.dataConcepts.map(c => (
                                                        <Badge key={c} variant="outline" className="text-[9px] h-4 px-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 capitalize">
                                                            {c.replace(/_/g, ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* NEW: Hygiene Rules */}
                                        {catalogNode.hygieneRules && catalogNode.hygieneRules.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Sparkles className="w-3 h-3" /> Hygiene Rules
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {catalogNode.hygieneRules.map(r => (
                                                        <Badge key={r} variant="outline" className="text-[9px] h-4 px-1.5 bg-purple-50 text-purple-700 border-purple-200">
                                                            {r}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <Separator className="mt-2" />
                            </div>

                            {/* NEW: Hub Architecture Section for MDF Nodes */}
                            {(catalogNode.isHub || catalogNode.category === 'mdf') && (
                                <div className="space-y-2">
                                    <div className="w-full flex items-center justify-between text-xs font-semibold text-primary">
                                        <div className="flex items-center gap-1.5">
                                            <Target className="w-3.5 h-3.5" />
                                            Hub Architecture
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                                        {/* Identity Strategy */}
                                        {catalogNode.identityStrategyOptions && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <Users className="w-3 h-3" /> Identity Strategy
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {catalogNode.identityStrategyOptions.map(opt => (
                                                        <Badge key={opt} variant="outline" className="text-[9px] h-4 px-1.5 bg-blue-50 text-blue-700 border-blue-200 capitalize">
                                                            {opt}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Profile Data Classes */}
                                        {catalogNode.profileDataClasses && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <HardDrive className="w-3 h-3" /> Profile Data
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {catalogNode.profileDataClasses.map(cls => (
                                                        <Badge key={cls} variant="outline" className="text-[9px] h-4 px-1.5 bg-amber-50 text-amber-700 border-amber-200 capitalize">
                                                            {cls}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Measurement Outputs */}
                                        {catalogNode.measurementOutputs && (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    <BarChart2 className="w-3 h-3" /> Measurement
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {catalogNode.measurementOutputs.map(out => (
                                                        <Badge key={out} variant="outline" className="text-[9px] h-4 px-1.5 bg-pink-50 text-pink-700 border-pink-200 capitalize">
                                                            {out}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Separator className="mt-2" />
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">What it is</h3>
                                <p className="text-xs">{catalogNode.description}</p>
                            </div>

                            {/* When to use */}
                            {catalogNode.whenToUse && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">When to use</h3>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1.5 rounded-md border border-emerald-100 dark:border-emerald-800">
                                            {catalogNode.whenToUse}
                                        </p>
                                    </div>
                                </>
                            )}

                            <Separator />
                            <div>
                                <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">Why it matters</h3>
                                <ul className="space-y-1.5">
                                    {(catalogNode.whyItMatters || []).map((point, i) => (
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
                                    {(catalogNode.enables || []).map(tag => {
                                        const config = (enablesConfig as Record<string, { icon: React.ElementType; color: string; bg: string }>)[tag]
                                        const IconComp = config?.icon ?? Zap
                                        return (
                                            <div
                                                key={tag}
                                                className={cn(
                                                    'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                                                    config?.bg || 'bg-secondary',
                                                    config?.color || 'text-foreground'
                                                )}
                                            >
                                                {React.createElement(IconComp, { className: 'w-2.5 h-2.5' })}
                                                {tag}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* I/O Ports */}
                            {(catalogNode.inputs.length > 0 || catalogNode.outputs.length > 0) && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">I/O Ports</h3>
                                        {catalogNode.inputs.length > 0 && (
                                            <div className="mb-2">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inputs</div>
                                                <div className="space-y-1">
                                                    {catalogNode.inputs.map(port => (
                                                        <div key={port.id} className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-600 dark:text-slate-300 truncate">{port.name}</span>
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                                                {port.type.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {catalogNode.outputs.length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Outputs</div>
                                                <div className="space-y-1">
                                                    {catalogNode.outputs.map(port => (
                                                        <div key={port.id} className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-600 dark:text-slate-300 truncate">{port.name}</span>
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                                                                {port.type.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Lineage — upstream/downstream connections on canvas */}
                            {(() => {
                                // Find all canvas nodes that match this catalogId
                                const matchingNodeIds = nodes
                                    .filter(n => (n.data as any)?.catalogId === selectedNodeId)
                                    .map(n => n.id)
                                if (matchingNodeIds.length === 0) return null

                                const upstreamIds = new Set<string>()
                                const downstreamIds = new Set<string>()
                                edges.forEach(e => {
                                    if (matchingNodeIds.includes(e.target)) upstreamIds.add(e.source)
                                    if (matchingNodeIds.includes(e.source)) downstreamIds.add(e.target)
                                })

                                const upstreamNodes = nodes.filter(n => upstreamIds.has(n.id))
                                const downstreamNodes = nodes.filter(n => downstreamIds.has(n.id))

                                if (upstreamNodes.length === 0 && downstreamNodes.length === 0) return null

                                return (
                                    <>
                                        <Separator />
                                        <div>
                                            <h3 className="text-xs font-medium mb-1.5 text-muted-foreground">Lineage</h3>
                                            {upstreamNodes.length > 0 && (
                                                <div className="mb-2">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Upstream ({upstreamNodes.length})</div>
                                                    <div className="space-y-1">
                                                        {upstreamNodes.map(n => {
                                                            const cId = (n.data as any)?.catalogId
                                                            const cNode = cId ? getNodeById(cId) : null
                                                            return (
                                                                <div key={n.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                                    <ArrowLeft className="w-3 h-3 text-blue-500 shrink-0" />
                                                                    <span className="truncate">{cNode?.name || (n.data as any)?.label || n.id}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            {downstreamNodes.length > 0 && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Downstream ({downstreamNodes.length})</div>
                                                    <div className="space-y-1">
                                                        {downstreamNodes.map(n => {
                                                            const cId = (n.data as any)?.catalogId
                                                            const cNode = cId ? getNodeById(cId) : null
                                                            return (
                                                                <div key={n.id} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                                    <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                                                                    <span className="truncate">{cNode?.name || (n.data as any)?.label || n.id}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )
                            })()}

                            {/* Prerequisites */}
                            {catalogNode.prerequisites && catalogNode.prerequisites.length > 0 && (
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
                                            {(catalogNode.proofPoints || []).slice(0, 2).map((proof: any) => (
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
