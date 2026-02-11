'use client'

// Simulator Canvas Page - Main React Flow canvas with all panels
// Optimized for smooth drag and drop performance

import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
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
    type Node,
    type Edge
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '@/styles/react-flow.css'

import { useCanvasStore } from '@/store/canvas-store'
import { useUIStore } from '@/store/ui-store'
import { useProfileStore } from '@/store/profile-store'
import { validateGraph } from '@/lib/validation-engine'
import { generateDiagramFromWizard, generateDiagramFromTemplate } from '@/lib/diagram-generator'
import { loadProfileDefinition } from '@/lib/profile-pipeline'
import { getTemplateById } from '@/data/templates'
import { debounce } from '@/lib/utils'
import { logger } from '@/lib/logger'

import MdfNode from '@/components/canvas/MdfNode'
import NodePalette from '@/components/canvas/NodePalette'
import Inspector from '@/components/canvas/Inspector'
import Toolbar from '@/components/canvas/Toolbar'
import SimulationStepper from '@/components/canvas/SimulationStepper'

// ... existing imports


import StatusLegend from '@/components/canvas/StatusLegend'
import SmartConnectPanel from '@/components/canvas/SmartConnectPanel'
import AIAssistantPanel from '@/components/canvas/AIAssistantPanel'
import LeadCaptureModal from '@/components/modals/LeadCaptureModal'
import ReplaceModal from '@/components/modals/ReplaceModal'
import GuidedTour from '@/components/tour/GuidedTour'
import { SimulationOverlay } from '@/components/canvas/SimulationOverlay'
import SimulationResults from '@/components/simulation/SimulationResults'
import StageLabels from '@/components/canvas/StageLabels'
import type { SuggestedEdge } from '@/types'
import { generateId, cn } from '@/lib/utils'

// Custom node types - memoized outside component to prevent re-renders
const nodeTypes = {
    mdfNode: MdfNode
} as const

// Default edge options for smoother connections
const defaultEdgeOptions = {
    type: 'default', // Changed from smoothstep to default (Bezier) for better routing
    animated: false,
    style: { strokeWidth: 2.5, stroke: '#b0b8c8' },
    // pathOptions: { borderRadius: 16 } // borderRadius not used for Bezier edges
}

// Pro options for better performance
const proOptions = {
    hideAttribution: true
}

import SimulatorCinematicLoader from '@/components/ui/SimulatorCinematicLoader'
import { AnimatePresence } from 'framer-motion'

function SimulatorCanvas() {
    const params = useParams()
    const searchParams = useSearchParams()
    const projectId = params.projectId as string
    const templateId = searchParams.get('template')
    const fromWizard = searchParams.get('fromWizard') === 'true'
    const canvasRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Simulating initial construction time
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3500)
        return () => clearTimeout(timer)
    }, [])

    const { fitView, screenToFlowPosition } = useReactFlow()
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        loadGraph,
        setProjectId,
        setNodes
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
        setPendingReplaceConflict,
        isPaletteOpen,
        showAIAssistant,
        setShowAIAssistant,
        isSimulationRunning // Added
    } = useUIStore()
    const { wizardData, activeProfile, setWizardData } = useProfileStore()
    const { setEdges, removeNode } = useCanvasStore()

    // Track if we've initialized
    const hasInitialized = useRef(false)

    // Handle Simulation Mode - Animate edges
    useEffect(() => {
        const currentEdges = useCanvasStore.getState().edges
        if (currentEdges.length === 0) return

        const shouldBeAnimated = isSimulationRunning
        // Note: We don't want to re-run this effect constantly if edges change, ONLY if simulation state toggles.
        // However, if we add new nodes while simulation is running, they should get animated.

        const { nodes } = useCanvasStore.getState()

        setEdges(currentEdges.map(e => {
            // Determine default color based on source category
            let defaultColor = '#b0b8c8'
            if (!shouldBeAnimated) {
                const sourceNode = nodes.find(n => n.id === e.source)
                // We need to resolve the category. The node data might have it.
                // Or look up in catalog if needed, but node.data.category should be there.
                const category = (sourceNode?.data as any)?.category || 'sources'

                // We need to import these constants. 
                // Since I can't easily add imports in this partial replace without breaking the file structure,
                // I will hardcode the lookup access for now or assume imports are added. 
                // Wait, I can't assume imports. I'll dynamically import or just replicate the map here for safety?
                // Better: I added the import in the previous step (Wait, no I didn't add the import line in the file header yet).
                // I will use a helper function that I'll declare inside or just use the raw values if I can't import.

                // Actually, I will use a dynamic import approach for the constants if needed, OR 
                // I will handle the import in a separate tool call. 
                // For now, let's assume I will add the import at the top of the file in a separate call.
                // Using a placeholder variable for now to act as if it's available.
                const { CATEGORY_EDGE_COLORS, DEFAULT_EDGE_COLOR } = require('@/lib/diagram-generator')
                defaultColor = CATEGORY_EDGE_COLORS[category] || DEFAULT_EDGE_COLOR
            }

            return {
                ...e,
                animated: shouldBeAnimated,
                style: {
                    ...e.style,
                    stroke: shouldBeAnimated ? '#10b981' : defaultColor,
                    strokeWidth: shouldBeAnimated ? 3 : 2.5,
                    opacity: shouldBeAnimated ? 1 : 1
                }
            }
        }))
    }, [isSimulationRunning, setEdges]) // Removed 'edges' to prevent loop, relying on explicit toggle or store state access

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
                        // Apply semantic auto-layout after loading
                        const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
                        const layoutedNodes = await semanticAutoLayout(project.graphData.nodes, project.graphData.edges)
                        setNodes(layoutedNodes)
                        setTimeout(() => fitView({ padding: 0.35, duration: 200 }), 100)
                        return
                    }
                } catch (error) {
                    logger.error('Failed to load project:', error)
                }
            }
            // 2. Check if duplicated from a share link
            const fromShare = searchParams.get('from')
            if (fromShare === 'share') {
                try {
                    const sharedGraphRaw = sessionStorage.getItem('mdf_shared_graph')
                    if (sharedGraphRaw) {
                        const sharedGraph = JSON.parse(sharedGraphRaw)
                        const sharedProfile = sessionStorage.getItem('mdf_shared_profile') || ''
                        sessionStorage.removeItem('mdf_shared_graph')
                        sessionStorage.removeItem('mdf_shared_profile')
                        loadGraph(sharedGraph)
                        hasInitialized.current = true
                        const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
                        const layoutedNodes = await semanticAutoLayout(sharedGraph.nodes, sharedGraph.edges)
                        setNodes(layoutedNodes)
                        setTimeout(() => fitView({ padding: 0.35, duration: 200 }), 100)
                        logger.debug('📋 Loaded duplicated share graph, profile:', sharedProfile)
                        return
                    }
                } catch (error) {
                    logger.error('Failed to load shared graph:', error)
                }
            }

            // 3. Generate from wizard data if available (from wizard flow OR persisted)
            if (wizardData && wizardData.tools.length > 0) {
                logger.debug('🎯 Generating diagram from wizard data:', wizardData)
                const graph = generateDiagramFromWizard(wizardData, activeProfile)
                loadGraph(graph)
                hasInitialized.current = true
                // Apply semantic auto-layout
                const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
                const layoutedNodes = await semanticAutoLayout(graph.nodes, graph.edges)
                setNodes(layoutedNodes)
                setTimeout(() => fitView({ padding: 0.35, duration: 200 }), 100)
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
                    // Apply semantic auto-layout
                    const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
                    const layoutedNodes = await semanticAutoLayout(graph.nodes, graph.edges)
                    setNodes(layoutedNodes)
                    setTimeout(() => fitView({ padding: 0.35, duration: 200 }), 100)
                    return
                }
            }

            // 4. Use Profile Pipeline for default diagram (deterministic MDF flow)
            logger.debug('📊 Generating profile-based diagram for:', activeProfile)
            try {
                const { loadProfileDefinition, buildGraphFromProfile, normalizeGraph } = await import('@/lib/profile-pipeline')

                const profileDef = loadProfileDefinition(activeProfile)
                if (profileDef) {
                    let graph = buildGraphFromProfile(profileDef)
                    graph = normalizeGraph(graph, profileDef)
                    loadGraph(graph)
                    hasInitialized.current = true

                    // Apply semantic auto-layout
                    const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
                    const layoutedNodes = await semanticAutoLayout(graph.nodes, graph.edges)
                    setNodes(layoutedNodes)
                    setTimeout(() => fitView({ padding: 0.35, duration: 600 }), 100)
                    return
                }
            } catch (error) {
                logger.error('Profile pipeline failed, falling back:', error)
            }

            // 5. Fallback: Generate default diagram for the active profile
            logger.debug('📊 Fallback: generating default diagram for profile:', activeProfile)
            const { generateDefaultDiagramForProfile } = await import('@/lib/diagram-generator')
            const graph = generateDefaultDiagramForProfile(activeProfile)
            loadGraph(graph)
            hasInitialized.current = true
            const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
            const layoutedNodes = await semanticAutoLayout(graph.nodes, graph.edges)
            setNodes(layoutedNodes)
            setTimeout(() => fitView({ padding: 0.35, duration: 200 }), 100)
        }

        // Wait a tick for store hydration
        const timer = setTimeout(initializeCanvas, 50)
        return () => clearTimeout(timer)
    }, [projectId, templateId, fromWizard, wizardData, activeProfile, loadGraph, fitView, setProjectId])

    // Validation on graph changes (debounced for performance)
    const runValidation = useMemo(
        () => debounce(() => {
            const profileDef = loadProfileDefinition(activeProfile)
            const results = validateGraph(nodes, edges, profileDef, wizardData)
            setValidationResults(results)
        }, 500), // Increased debounce for better performance
        [nodes, edges, wizardData, activeProfile, setValidationResults]
    )

    useEffect(() => {
        runValidation()
        return () => runValidation.cancel()
    }, [nodes, edges, runValidation])

    // Regenerate graph when activeProfile changes (after initial load)
    const prevProfileRef = useRef(activeProfile)
    useEffect(() => {
        if (!hasInitialized.current) return
        if (prevProfileRef.current === activeProfile) return
        prevProfileRef.current = activeProfile

        const regenerate = async () => {
            // Prevent regeneration if we just loaded wizard data for this profile
            if (wizardData && wizardData.tools.length > 0 && activeProfile === 'generic') {
                logger.debug('🛑 Skipping profile regeneration (Wizard Data active)')
                return
            }

            const { loadProfileDefinition: loadPD, buildGraphFromProfile, normalizeGraph } = await import('@/lib/profile-pipeline')
            const profileDef = loadPD(activeProfile)
            if (!profileDef) return
            let graph = buildGraphFromProfile(profileDef)
            graph = normalizeGraph(graph, profileDef)
            loadGraph(graph)
            const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
            const layoutedNodes = await semanticAutoLayout(graph.nodes, graph.edges)
            setNodes(layoutedNodes)
            setTimeout(() => fitView({ padding: 0.35, duration: 600 }), 100)
        }
        regenerate()
    }, [activeProfile, loadGraph, setNodes, fitView])

    // Sanitized edges for ReactFlow to prevent crashes
    const safeEdges = useMemo(() => {
        return edges.filter(e => e && e.source && e.target)
    }, [edges])

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

            // Add node with AUTO-CONNECT + LAYOUT
            requestAnimationFrame(async () => {
                // 1. Add the new node
                addNode(catalogId, name, category, position)

                // 2. Auto-Connect: find the just-added node (unconnected, matching catalogId)
                const state = useCanvasStore.getState()
                const newNode = state.nodes.find(n =>
                    (n.data as any).catalogId === catalogId &&
                    !state.edges.some(e => e.source === n.id || e.target === n.id)
                )

                if (newNode) {
                    const autoEdges: Edge[] = []

                    // RULE 1: Sources/Collection → connect TO MDF Hub or Ingestion
                    if (['sources', 'collection'].includes(category)) {
                        const target = state.nodes.find(n =>
                            (n.data as any).category === 'mdf' || (n.data as any).category === 'ingestion'
                        )
                        if (target) {
                            autoEdges.push({
                                id: `edge-auto-${Date.now()}-out`,
                                source: newNode.id,
                                target: target.id,
                                sourceHandle: 'right',
                                targetHandle: 'left'
                            })
                        }
                    }

                    // RULE 2: Analytics/Activation/Destination → connect FROM MDF Hub
                    if (['analytics', 'activation', 'destination', 'realtime_serving'].includes(category)) {
                        const source = state.nodes.find(n => (n.data as any).category === 'mdf')
                        if (source) {
                            autoEdges.push({
                                id: `edge-auto-${Date.now()}-in`,
                                source: source.id,
                                target: newNode.id,
                                sourceHandle: 'right',
                                targetHandle: 'left'
                            })
                        }
                    }

                    // Apply auto-edges
                    if (autoEdges.length > 0) {
                        const { setEdges } = useCanvasStore.getState()
                        setEdges([...useCanvasStore.getState().edges, ...autoEdges])
                    }
                }

                // 3. Immediate Auto-Layout to enforce structure
                const { semanticAutoLayout } = await import('@/lib/semantic-layout-engine')
                const { nodes: updatedNodes, edges: updatedEdges } = useCanvasStore.getState()
                const layoutedNodes = await semanticAutoLayout(updatedNodes, updatedEdges)
                setNodes(layoutedNodes)
            })
        },
        [screenToFlowPosition, addNode, setNodes]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
    }, [])

    // Handle node selection
    // Design choice: we use catalogId as the selected ID so the Inspector can
    // look up catalog metadata via getNodeById(). This means clicking different
    // instances of the same catalog node references the same catalog entry.
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

    const handleConnect = useCallback(async (params: any) => {
        // Run strict validation
        const { validateEdgeConnection } = await import('@/lib/validation-engine')
        const result = validateEdgeConnection(
            params.source,
            params.target,
            nodes,
            params.sourceHandle,
            params.targetHandle
        )

        if (!result.isValid) {
            // Toast would be nice here, but for now just log or we can construct a temp edge with error style
            // Better: Don't allow connection and show alert?
            // Since we don't have a toast hook imported easily here without checking imports,
            // we will just block it.
            // Ideally should show feedback.
            console.warn('Connection blocked:', result.errorMessage)
            alert(`Cannot connect: ${result.errorMessage}`) // Simple fallback
            return
        }

        if (result.warningMessage) {
            // Allow but warn?
            // alert(`Warning: ${result.warningMessage}`)
        }

        onConnect(params)
    }, [nodes, onConnect])

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <SimulatorCinematicLoader onComplete={() => setIsLoading(false)} />
                )}
            </AnimatePresence>

            {/* Canvas */}
            <div ref={canvasRef} className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={safeEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={handleConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionMode={ConnectionMode.Loose}
                    selectionMode={SelectionMode.Partial}
                    fitView
                    fitViewOptions={{ padding: 0.35 }}
                    deleteKeyCode={['Backspace', 'Delete']}
                    multiSelectionKeyCode={['Control', 'Meta']}
                    proOptions={proOptions}
                    minZoom={0.1}
                    maxZoom={2}
                    className="bg-background"
                    // Performance optimizations
                    nodesDraggable={false} // LOCKED LAYOUT
                    nodesConnectable={true}
                    elementsSelectable={true}
                    panOnDrag={true}
                    zoomOnScroll={true}
                    zoomOnPinch={true}
                    panOnScroll={false}
                    preventScrolling={true}
                    snapToGrid={true}
                    snapGrid={[15, 15]}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={15}
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

                {/* Stage column labels — positioned in flow space */}
                <StageLabels />

                {/* Panels */}
                <Toolbar />
                <SimulationStepper />
                <NodePalette />
                <Inspector />
                <GuidedTour />
                <SimulationOverlay />
                <SimulationResults />

                {/* Status Legend - show when nodes have status */}
                {nodes.some(n => n.data?.status && n.data.status !== 'optional') && (
                    <StatusLegend className={cn(
                        "absolute bottom-4 transition-all duration-300 ease-out",
                        isPaletteOpen ? "left-56 md:left-64 lg:left-68" : "left-4"
                    )} />
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

            {/* AI Assistant Panel */}
            {showAIAssistant && (
                <AIAssistantPanel onClose={() => setShowAIAssistant(false)} />
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
