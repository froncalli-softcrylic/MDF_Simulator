'use client'

// Simulator Canvas Page - Main React Flow canvas with all panels
// Optimized for smooth drag and drop performance

import { useCallback, useEffect, useRef, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
    BackgroundVariant,
    SelectionMode,
    ConnectionMode,
    type Node
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '@/styles/react-flow.css'

import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { useProfileStore } from '@/store/profile-store'
import { validateGraph } from '@/lib/validation-engine'
import { generateDiagramFromWizard, generateDiagramFromTemplate } from '@/lib/diagram-generator'
import { getTemplateById } from '@/data/templates'
import { debounce } from '@/lib/utils'
import { logger } from '@/lib/logger'

import MdfNode from '@/components/canvas/MdfNode'
import NodePalette from '@/components/canvas/NodePalette'
import Inspector from '@/components/canvas/Inspector'
import Toolbar from '@/components/canvas/Toolbar'
import ValidationPanel from '@/components/canvas/ValidationPanel'
import StatusLegend from '@/components/canvas/StatusLegend'
import SmartConnectPanel from '@/components/canvas/SmartConnectPanel'
import LeadCaptureModal from '@/components/modals/LeadCaptureModal'
import ReplaceModal from '@/components/modals/ReplaceModal'
import type { SuggestedEdge } from '@/types'
import { generateId } from '@/lib/utils'

// Custom node types - memoized outside component to prevent re-renders
const nodeTypes = {
    mdfNode: MdfNode
} as const

// Default edge options for smoother connections
const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: false,
    style: { strokeWidth: 2 }
}

// Pro options for better performance
const proOptions = {
    hideAttribution: true
}

function SimulatorCanvas() {
    const params = useParams()
    const searchParams = useSearchParams()
    const projectId = params.projectId as string
    const templateId = searchParams.get('template')
    const fromWizard = searchParams.get('fromWizard') === 'true'
    const canvasRef = useRef<HTMLDivElement>(null)

    const { fitView, screenToFlowPosition } = useReactFlow()
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        loadGraph,
        setProjectId
    } = useCanvasStore()

    const {
        setValidationResults,
        setSelectedNodeId,
        isMinimapVisible,
        smartConnectFixes,
        showSmartConnectPanel,
        setShowSmartConnectPanel,
        setSmartConnectFixes,
        pendingReplaceConflict,
        setPendingReplaceConflict
    } = useUIStore()
    const { wizardData, activeProfile, setWizardData } = useProfileStore()
    const { setEdges, removeNode } = useCanvasStore()

    // Track if we've initialized
    const hasInitialized = useRef(false)

    // Initialize project - generate diagram from wizard data
    useEffect(() => {
        // Skip if already initialized or if store hasn't hydrated yet
        if (hasInitialized.current) return

        setProjectId(projectId === 'new' ? null : projectId)

        const initializeCanvas = async () => {
            // 1. Try to load existing project by ID
            if (projectId !== 'new') {
                try {
                    const response = await fetch(`/api/projects/${projectId}`)
                    if (response.ok) {
                        const project = await response.json()
                        loadGraph(project.graphData)
                        hasInitialized.current = true
                        setTimeout(() => fitView({ padding: 0.2, duration: 200 }), 100)
                        return
                    }
                } catch (error) {
                    logger.error('Failed to load project:', error)
                }
            }

            // 2. Generate from wizard data if available (from wizard flow OR persisted)
            if (wizardData && wizardData.tools.length > 0) {
                logger.debug('🎯 Generating diagram from wizard data:', wizardData)
                const graph = generateDiagramFromWizard(wizardData, activeProfile)
                loadGraph(graph)
                hasInitialized.current = true
                setTimeout(() => fitView({ padding: 0.2, duration: 200 }), 100)
                return
            }

            // 3. Generate from template if specified
            if (templateId) {
                const template = getTemplateById(templateId)
                if (template) {
                    logger.debug('📋 Generating diagram from template:', templateId)
                    const graph = generateDiagramFromTemplate(template.nodes, template.edges)
                    loadGraph(graph)
                    hasInitialized.current = true
                    setTimeout(() => fitView({ padding: 0.2, duration: 200 }), 100)
                    return
                }
            }

            // 4. Generate default diagram for the active profile
            logger.debug('📊 Generating default diagram for profile:', activeProfile)
            const { generateDefaultDiagramForProfile } = await import('@/lib/diagram-generator')
            const graph = generateDefaultDiagramForProfile(activeProfile)
            loadGraph(graph)
            hasInitialized.current = true
            setTimeout(() => fitView({ padding: 0.2, duration: 200 }), 100)
        }

        // Wait a tick for store hydration
        const timer = setTimeout(initializeCanvas, 50)
        return () => clearTimeout(timer)
    }, [projectId, templateId, fromWizard, wizardData, activeProfile, loadGraph, fitView, setProjectId])

    // Validation on graph changes (debounced for performance)
    const runValidation = useMemo(
        () => debounce(() => {
            const results = validateGraph(nodes, edges, wizardData)
            setValidationResults(results)
        }, 500), // Increased debounce for better performance
        [nodes, edges, wizardData, setValidationResults]
    )

    useEffect(() => {
        runValidation()
        return () => runValidation.cancel()
    }, [nodes, edges, runValidation])

    // Handle drop from palette - optimized with screenToFlowPosition
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault()

            const data = event.dataTransfer.getData('application/mdf-node')
            if (!data) return

            const { catalogId, name, category } = JSON.parse(data)

            // Use React Flow's screenToFlowPosition for accurate coordinates
            // This accounts for zoom and pan automatically
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY
            })

            // Offset to center the node on the cursor
            position.x -= 80
            position.y -= 30

            // Add node with smooth animation hint
            requestAnimationFrame(() => {
                addNode(catalogId, name, category, position)
            })
        },
        [screenToFlowPosition, addNode]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
    }, [])

    // Handle node selection
    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            const data = node.data as { catalogId?: string }
            if (data?.catalogId) {
                setSelectedNodeId(data.catalogId)
            }
        },
        [setSelectedNodeId]
    )

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null)
    }, [setSelectedNodeId])

    // MiniMap node color function - memoized
    const getNodeColor = useCallback((n: Node) => {
        const data = n.data as { category?: string } | undefined
        switch (data?.category) {
            case 'identity': return 'hsl(158, 64%, 52%)'
            case 'source': return 'hsl(199, 89%, 48%)'
            case 'activation': return 'hsl(142, 71%, 45%)'
            case 'governance': return 'hsl(43, 96%, 56%)'
            default: return 'hsl(217, 91%, 60%)'
        }
    }, [])

    return (
        <div className="h-screen w-screen flex flex-col">
            {/* Canvas */}
            <div ref={canvasRef} className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionMode={ConnectionMode.Loose}
                    selectionMode={SelectionMode.Partial}
                    snapToGrid
                    snapGrid={[20, 20]}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    deleteKeyCode={['Backspace', 'Delete']}
                    multiSelectionKeyCode={['Control', 'Meta']}
                    proOptions={proOptions}
                    minZoom={0.1}
                    maxZoom={2}
                    className="bg-background"
                    // Performance optimizations
                    nodesDraggable={true}
                    nodesConnectable={true}
                    elementsSelectable={true}
                    panOnDrag={true}
                    zoomOnScroll={true}
                    zoomOnPinch={true}
                    panOnScroll={false}
                    preventScrolling={true}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="hsl(var(--muted-foreground) / 0.2)"
                    />
                    <Controls
                        position="bottom-right"
                        showZoom={false}
                        showFitView={false}
                        showInteractive={false}
                        className="!bg-card !border !shadow-lg"
                    />
                    {isMinimapVisible && (
                        <MiniMap
                            position="bottom-right"
                            className="!bg-card/80 !border"
                            maskColor="hsl(var(--background) / 0.8)"
                            nodeColor={getNodeColor}
                            pannable
                            zoomable
                        />
                    )}
                </ReactFlow>

                {/* Panels */}
                <Toolbar />
                <NodePalette />
                <Inspector />
                <ValidationPanel />

                {/* Status Legend - show when nodes have status */}
                {nodes.some(n => n.data?.status && n.data.status !== 'optional') && (
                    <StatusLegend className="absolute bottom-4 left-56 md:left-64 lg:left-68" />
                )}
            </div>

            {/* Modals */}
            <LeadCaptureModal />

            {/* Smart Connect Panel */}
            {showSmartConnectPanel && smartConnectFixes && (
                <SmartConnectPanel
                    suggestedFixes={smartConnectFixes}
                    onApply={(selectedEdges: SuggestedEdge[]) => {
                        // Add selected edges to canvas
                        const newEdges = selectedEdges.map(e => ({
                            id: `edge-${generateId()}`,
                            source: e.source,
                            target: e.target,
                            sourceHandle: e.sourcePort,
                            targetHandle: e.targetPort,
                            type: 'smoothstep'
                        }))
                        const currentEdges = useCanvasStore.getState().edges
                        setEdges([...currentEdges, ...newEdges])
                        setShowSmartConnectPanel(false)
                        setSmartConnectFixes(null)
                    }}
                    onDismiss={() => {
                        setShowSmartConnectPanel(false)
                        setSmartConnectFixes(null)
                    }}
                />
            )}

            {/* Replace Modal */}
            {pendingReplaceConflict && (
                <ReplaceModal
                    conflict={pendingReplaceConflict}
                    onReplace={() => {
                        // Remove existing node and add new one
                        if (pendingReplaceConflict) {
                            removeNode(pendingReplaceConflict.existingNodeId)
                        }
                        setPendingReplaceConflict(null)
                    }}
                    onKeepBoth={() => {
                        // Just close modal, node already added
                        setPendingReplaceConflict(null)
                    }}
                    onCancel={() => {
                        setPendingReplaceConflict(null)
                    }}
                />
            )}
        </div>
    )
}

// Wrap with ReactFlowProvider
export default function SimulatorPage() {
    return (
        <ReactFlowProvider>
            <SimulatorCanvas />
        </ReactFlowProvider>
    )
}
