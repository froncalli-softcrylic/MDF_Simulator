'use client'

// Share Page - Read-only view of shared diagram

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    BackgroundVariant
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { GraphData } from '@/types'
import MdfNode from '@/components/canvas/MdfNode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitMerge, Copy, Calendar, Building } from 'lucide-react'

const nodeTypes = {
    mdfNode: MdfNode
}

interface ShareData {
    graphData: GraphData
    profile: string
    createdAt: string
}

function ShareCanvas() {
    const params = useParams()
    const shareId = params.shareId as string

    const [shareData, setShareData] = useState<ShareData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadShare() {
            try {
                const response = await fetch(`/api/share/${shareId}`)
                if (!response.ok) {
                    throw new Error('Share not found')
                }
                const data = await response.json()
                setShareData(data)
            } catch (err) {
                setError('This share link is invalid or has expired.')
            } finally {
                setLoading(false)
            }
        }

        loadShare()
    }, [shareId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading diagram...</div>
            </div>
        )
    }

    if (error || !shareData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Share Not Found</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => window.location.href = '/'}>
                            Go to MDF Simulator
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const nodes = shareData.graphData.nodes.map(n => ({
        ...n,
        type: 'mdfNode',
        draggable: false,
        selectable: false
    }))

    return (
        <div className="h-screen w-screen flex flex-col">
            {/* Header */}
            <header className="border-b bg-background/90 backdrop-blur z-10">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GitMerge className="w-5 h-5 text-emerald-500" />
                        <span className="font-semibold">MDF Simulator</span>
                        <Badge variant="secondary">Shared View</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(shareData.createdAt).toLocaleDateString()}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => {
                            // Store graph data for the simulator to pick up
                            sessionStorage.setItem('mdf_shared_graph', JSON.stringify(shareData.graphData))
                            sessionStorage.setItem('mdf_shared_profile', shareData.profile || '')
                            window.location.href = '/simulator/new?from=share'
                        }}>
                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                            Duplicate to Edit
                        </Button>
                        <Button variant="default" size="sm" onClick={() => window.location.href = '/'}>
                            Create Your Own
                        </Button>
                    </div>
                </div>
            </header>

            {/* Canvas */}
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={shareData.graphData.edges}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    zoomOnScroll={true}
                    panOnScroll={true}
                    className="bg-background"
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="hsl(var(--muted-foreground) / 0.2)"
                    />
                    <Controls
                        position="bottom-right"
                        showZoom={true}
                        showFitView={true}
                        showInteractive={false}
                    />
                    <MiniMap
                        position="bottom-left"
                        className="!bg-card/80 !border"
                        nodeColor={(n: any) => {
                            const data = n.data as { category?: string } | undefined
                            switch (data?.category) {
                                case 'account_graph': return 'hsl(158, 64%, 52%)'
                                case 'source': return 'hsl(199, 89%, 48%)'
                                case 'activation': return 'hsl(142, 71%, 45%)'
                                case 'governance_rail': return 'hsl(43, 96%, 56%)'
                                default: return 'hsl(217, 91%, 60%)'
                            }
                        }}
                    />
                </ReactFlow>

                {/* CTA Card */}
                <div className="absolute top-4 right-4 z-10">
                    <Card className="w-64 bg-card/95 backdrop-blur shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Like what you see?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Our team can help you build a production-ready Marketing Data Foundation.
                            </p>
                            <Button className="w-full" size="sm">
                                Book a Demo
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function SharePage() {
    return (
        <ReactFlowProvider>
            <ShareCanvas />
        </ReactFlowProvider>
    )
}
