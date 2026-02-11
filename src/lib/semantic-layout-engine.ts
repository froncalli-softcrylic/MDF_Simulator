// Semantic Layout Engine — Unified layout pipeline for MDF Simulator
// Single entry point for both Profile Selection and Auto Layout button
// Uses ELK partitioning to enforce stage-ordered columns (L→R),
// pins governance rail at bottom, and centers identity hub.

import ELK from 'elkjs/lib/elk.bundled.js'
import type { Node, Edge } from '@xyflow/react'
import type { MdfNodeData, PipelineStage, NodeCategory } from '@/types'
import { getNodeById } from '@/data/node-catalog'
import { sanitizeEdges } from '@/lib/smart-connect-engine'

// ============================================
// CONSTANTS
// ============================================

const elk = new ELK()

const NODE_WIDTH = 260 // Updated for larger typography
const NODE_HEIGHT = 160 // Estimated height with larger fonts
const HUB_WIDTH = 400
const HUB_HEIGHT = 280

// Spacing constants — generous for readable flowcharts
const NODE_NODE_SPACING = 140          // Vertical spacing between nodes in same column
const LAYER_SPACING = 400              // Horizontal spacing between pipeline stages
const EDGE_NODE_SPACING = 80           // Edge-to-node breathing room
const LEFT_PADDING = 150               // Left padding (sidebar handled by fitView now)
const TOP_PADDING = 150                // Top padding for stage labels
const BOTTOM_PADDING = 120
const RIGHT_PADDING = 120

// Governance rail (positioned below main pipeline as cross-cutting concern)
const GOVERNANCE_GAP_X = 300           // X spacing between governance nodes
const GOVERNANCE_BOTTOM_MARGIN = 120   // How far below the main pipeline

// Minimum bounding box to prevent cramped layouts
const MIN_CANVAS_WIDTH = 1400

// Pipeline stage order (left to right)
const STAGE_ORDER: PipelineStage[] = [
    'sources',
    'collection',
    'ingestion',
    'storage_raw',
    'storage_warehouse',
    'transform',
    'mdf_hygiene',
    'mdf',
    'mdf_measurement',
    'identity',
    'analytics',
    'activation',
    'clean_room',
    'realtime_serving',
    'destination'
]

// Stage to partition index (integers for ELK layered partitioning)
// Stage to partition index (Hub-Centric Layout)
// Stage to partition index (Strict Integers for ELK layered partitioning)
// Forces L->R linear flow: Source(0) -> Collection(1) -> Ingestion(2) -> Raw(3) -> Warehouse(4) -> Transform(5) -> MDF(6) -> Analytics(7) -> Activation(8) -> Dest(9)
const STAGE_PARTITION: Record<PipelineStage, number> = {
    sources: 0,
    collection: 1,
    ingestion: 2,
    storage_raw: 3,
    storage_warehouse: 4,
    transform: 5,

    // MDF HUB (Simulated Center)
    mdf_hygiene: 6,
    mdf: 6,
    mdf_measurement: 6,
    identity: 6,

    // Downstream
    analytics: 7,
    clean_room: 7,

    // Action Layer
    activation: 8,
    realtime_serving: 8,

    // Final Destination
    destination: 9,

    // Pinned separately
    governance: 99
}

// Human-readable stage labels (exported for StageLabels component)
export const STAGE_LABELS: Record<PipelineStage, string> = {
    sources: 'Data Sources',
    collection: 'Collection',
    ingestion: 'Ingestion',
    storage_raw: 'Raw Storage',
    storage_warehouse: 'Warehouse',
    transform: 'Transform',
    mdf_hygiene: 'Data Hygiene',
    mdf: 'MDF Hub',
    mdf_measurement: 'Measurement',
    identity: 'Identity',
    governance: 'Governance',
    analytics: 'Analytics',
    activation: 'Activation',
    clean_room: 'Clean Room',
    realtime_serving: 'Real-time',
    destination: 'Destinations'
}

// ============================================
// STAGE INFERENCE
// ============================================

function inferStage(category: NodeCategory, catalogId?: string): PipelineStage {
    // Check catalog node for explicit stage
    if (catalogId) {
        const catalogNode = getNodeById(catalogId)
        if (catalogNode?.stage) return catalogNode.stage

        // Dynamic sub-stage inference for MDF
        if (catalogNode?.category === 'mdf') {
            if (catalogNode.nodeRole === 'hygiene') return 'mdf_hygiene'
            if (catalogNode.nodeRole === 'measurement') return 'mdf_measurement'
        }
    }

    // Default mapping from category
    const categoryToStage: Record<string, PipelineStage> = {
        sources: 'sources',
        collection: 'collection',
        ingestion: 'ingestion',
        storage_raw: 'storage_raw',
        storage_warehouse: 'storage_warehouse',
        transform: 'transform',
        mdf: 'mdf',
        identity: 'identity',
        governance: 'governance',
        analytics: 'analytics',
        activation: 'activation',
        clean_room: 'clean_room',
        realtime_serving: 'realtime_serving',
        destination: 'destination'
    }
    return categoryToStage[category] || 'transform'
}

// ============================================
// STEP 1: NORMALIZE — Assign stages & roles to all nodes
// ============================================

interface StageAssignment {
    nodeId: string
    stage: PipelineStage
    isGovernance: boolean
    isInfrastructure: boolean
    isIdentityHub: boolean
}

function normalizeStagesAndRoles(nodes: Node[]): StageAssignment[] {
    return nodes.map(node => {
        const data = node.data as MdfNodeData
        const catalogNode = data.catalogId ? getNodeById(data.catalogId) : null
        const category = data.category || catalogNode?.category || 'transform'
        const stage = inferStage(category, data.catalogId)

        const isGovernance = category === 'governance' ||
            data.isRailNode === true ||
            catalogNode?.isRailNode === true

        // Detect Bottom Band Infrastructure
        const isInfrastructure = category === 'storage_raw' || category === 'storage_warehouse'

        const isIdentityHub = category === 'identity' ||
            catalogNode?.isHub === true ||
            data.railPosition === 'center'

        return {
            nodeId: node.id,
            stage,
            isGovernance,
            isInfrastructure,
            isIdentityHub
        }
    })
}

// ============================================
// STEP 2: RUN ELK WITH STAGE PARTITIONS
// ============================================

async function runElkWithStageConstraints(
    nodes: Node[],
    edges: Edge[],
    assignments: StageAssignment[]
): Promise<Map<string, { x: number; y: number }>> {
    const positionMap = new Map<string, { x: number; y: number }>()

    if (nodes.length === 0) return positionMap

    // Build assignment lookup
    const assignmentMap = new Map<string, StageAssignment>()
    for (const a of assignments) {
        assignmentMap.set(a.nodeId, a)
    }

    // Separate special nodes (Gov + Infra)
    const specialIds = new Set(
        assignments.filter(a => a.isGovernance || a.isInfrastructure).map(a => a.nodeId)
    )

    // Filter nodes for ELK (exclude special nodes)
    const elkNodes = nodes.filter(n => !specialIds.has(n.id))
    const elkNodeIds = new Set(elkNodes.map(n => n.id))

    // Filter edges where both endpoints are in the ELK graph
    const safeEdges = edges.filter(e =>
        elkNodeIds.has(e.source) && elkNodeIds.has(e.target)
    )

    if (elkNodes.length === 0) {
        // Only governance nodes on the canvas — position them manually
        const govNodes = nodes.filter(n => assignments.find(a => a.nodeId === n.id)?.isGovernance)
        govNodes.forEach((node, idx) => {
            positionMap.set(node.id, {
                x: LEFT_PADDING + idx * GOVERNANCE_GAP_X,
                y: TOP_PADDING + 200
            })
        })
        return positionMap
    }

    // Build ELK graph with strong stage partitioning
    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': 'RIGHT',
            'elk.spacing.nodeNode': String(NODE_NODE_SPACING),
            'elk.layered.spacing.nodeNodeBetweenLayers': String(LAYER_SPACING),
            'elk.layered.spacing.edgeNodeBetweenLayers': '180', // Increased for cleaner routing
            'elk.padding': `[top=${TOP_PADDING},left=${LEFT_PADDING},bottom=${BOTTOM_PADDING},right=${RIGHT_PADDING}]`,
            'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF', // Better for straight lines
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
            'elk.partitioning.activate': 'true',
            // Encourage straight long edges
            'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
            // Better edge routing for curves
            'elk.edgeRouting': 'SPLINES',
            'elk.layered.crossingMinimization.forceNodeModelOrder': 'true', // KEY: Respect partition order strictly
            'elk.layered.nodePlacement.bk.edgeStraightening': 'IMPROVE_STRAIGHTNESS'
        },
        children: elkNodes.map(node => {
            const assignment = assignmentMap.get(node.id)
            const partition = assignment
                ? STAGE_PARTITION[assignment.stage]
                : 5 // Default to transform

            const isHub = assignment?.isIdentityHub || false

            return {
                id: node.id,
                width: isHub ? HUB_WIDTH : NODE_WIDTH,
                height: isHub ? HUB_HEIGHT : NODE_HEIGHT,
                layoutOptions: {
                    'elk.partitioning.partition': String(partition)
                }
            }
        }),
        edges: safeEdges.map(edge => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target]
        }))
    }

    try {
        const layoutedGraph = await elk.layout(elkGraph)

        // Map positions from ELK result
        layoutedGraph.children?.forEach((child: any) => {
            if (child.x !== undefined && child.y !== undefined) {
                positionMap.set(child.id, { x: child.x, y: child.y })
            }
        })
    } catch (error) {
        console.error('[SemanticLayout] ELK layout failed, falling back to grid:', error)
        return fallbackGridLayout(nodes, assignments)
    }

    return positionMap
}

// ============================================
// STEP 3: PIN GOVERNANCE RAIL AT TOP (Was Bottom)
// ============================================

function pinGovernanceRail(
    nodes: Node[],
    assignments: StageAssignment[],
    positionMap: Map<string, { x: number; y: number }>
): void {
    const governanceAssignments = assignments.filter(a => a.isGovernance)
    if (governanceAssignments.length === 0) return

    // Find main graph bounds
    let minX = Infinity, maxX = -Infinity
    for (const [, pos] of positionMap) {
        if (pos.x < minX) minX = pos.x
        if (pos.x > maxX) maxX = pos.x
    }
    if (minX === Infinity) { minX = LEFT_PADDING; maxX = MIN_CANVAS_WIDTH }

    // Place governance nodes centered TOP
    const graphWidth = maxX - minX
    const govCount = governanceAssignments.length
    const totalGovWidth = (govCount - 1) * GOVERNANCE_GAP_X
    const startX = minX + (graphWidth - totalGovWidth) / 2

    // Top Rail Y
    const govY = TOP_PADDING - 100 // Above the main graph

    governanceAssignments.forEach((a, idx) => {
        positionMap.set(a.nodeId, {
            x: Math.max(startX + idx * GOVERNANCE_GAP_X, minX),
            y: govY
        })
    })
}

// ============================================
// STEP 3b: PIN INFRASTRUCTURE BAND AT BOTTOM
// ============================================

function pinInfrastructureBand(
    nodes: Node[],
    assignments: StageAssignment[],
    positionMap: Map<string, { x: number; y: number }>
): void {
    const infraAssignments = assignments.filter(a => a.isInfrastructure)
    if (infraAssignments.length === 0) return

    // Find bounds
    let minX = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const [, pos] of positionMap) {
        if (pos.x < minX) minX = pos.x
        if (pos.x > maxX) maxX = pos.x
        if (pos.y + NODE_HEIGHT > maxY) maxY = pos.y + NODE_HEIGHT
    }
    if (minX === Infinity) { minX = LEFT_PADDING; maxX = MIN_CANVAS_WIDTH; maxY = 500 }

    // Center Infra below main graph
    const count = infraAssignments.length
    const gap = 300
    const totalWidth = (count - 1) * gap
    const startX = minX + (maxX - minX - totalWidth) / 2
    const infraY = maxY + 250 // Increased padding to prevent edge overlap with bottom nodes

    infraAssignments.forEach((a, idx) => {
        positionMap.set(a.nodeId, {
            x: startX + idx * gap,
            y: infraY
        })
    })
}

// ============================================
// STEP 4: CENTER IDENTITY HUB
// ============================================

function pinMdfCenter(
    nodes: Node[],
    assignments: StageAssignment[],
    positionMap: Map<string, { x: number; y: number }>
): void {
    // Capture ALL MDF-related nodes for centering
    const mdfAssignments = assignments.filter(a =>
        (a.stage === 'mdf' || a.stage === 'identity' || a.isIdentityHub) &&
        !a.isGovernance
    )
    if (mdfAssignments.length === 0) return

    // Find the vertical center of the main pipeline (excluding governance)
    let minY = Infinity, maxY = -Infinity

    for (const [nodeId, pos] of positionMap) {
        const assignment = assignments.find(a => a.nodeId === nodeId)
        if (!assignment || assignment.isGovernance || assignment.isInfrastructure) continue

        if (pos.y < minY) minY = pos.y
        if (pos.y > maxY) maxY = pos.y + NODE_HEIGHT
    }

    if (minY === Infinity) { minY = TOP_PADDING; maxY = 500 }

    const graphCenterY = minY + (maxY - minY) / 2

    // Calculate current hub center
    let hubMinY = Infinity, hubMaxY = -Infinity
    mdfAssignments.forEach(a => {
        const pos = positionMap.get(a.nodeId)
        if (pos) {
            if (pos.y < hubMinY) hubMinY = pos.y
            if (pos.y > hubMaxY) hubMaxY = pos.y + NODE_HEIGHT
        }
    })

    if (hubMinY === Infinity) return

    const hubCenterY = hubMinY + (hubMaxY - hubMinY) / 2

    // If already roughly centered (within 100px), assume ELK did a good job and don't force it
    // This preserves ELK's edge routing optimizations
    if (Math.abs(graphCenterY - hubCenterY) < 100) {
        return
    }

    // Otherwise, gently shift them to center
    const offsetY = graphCenterY - hubCenterY
    mdfAssignments.forEach(a => {
        const currentPos = positionMap.get(a.nodeId)
        if (currentPos) {
            positionMap.set(a.nodeId, {
                x: currentPos.x,
                y: currentPos.y + offsetY
            })
        }
    })
}

// ============================================
// STEP 5: COMPUTE STAGE COLUMN BOUNDS
// ============================================

export interface StageColumn {
    stage: PipelineStage
    label: string
    x: number       // left edge
    width: number    // column width
    nodeCount: number
}

/**
 * After layout, compute the X bounds of each stage column.
 * Used by the StageLabels component to render column headers.
 */
export function computeStageColumns(
    nodes: Node[],
    assignments: StageAssignment[]
): StageColumn[] {
    const assignmentMap = new Map<string, StageAssignment>()
    for (const a of assignments) assignmentMap.set(a.nodeId, a)

    // Group node X positions by stage
    const stagePositions = new Map<PipelineStage, number[]>()
    for (const node of nodes) {
        const a = assignmentMap.get(node.id)
        if (!a || a.isGovernance) continue
        const stage = a.stage

        if (!stagePositions.has(stage)) stagePositions.set(stage, [])
        // Account for node width when finding bounds
        stagePositions.get(stage)!.push(node.position.x)
        stagePositions.get(stage)!.push(node.position.x + (a.isIdentityHub ? HUB_WIDTH : NODE_WIDTH))
    }

    const columns: StageColumn[] = []
    const padding = LAYER_SPACING / 2 - 20

    for (const stage of STAGE_ORDER) {
        const positions = stagePositions.get(stage)
        if (!positions || positions.length === 0) continue

        const minX = Math.min(...positions)
        const maxX = Math.max(...positions)

        columns.push({
            stage,
            label: STAGE_LABELS[stage],
            x: minX - 30,
            width: maxX - minX + 60,
            nodeCount: positions.length / 2 // Each node pushed 2 positions
        })
    }

    return columns
}

// ============================================
// FALLBACK: Grid Layout by Stage
// ============================================

function fallbackGridLayout(
    nodes: Node[],
    assignments: StageAssignment[]
): Map<string, { x: number; y: number }> {
    const positionMap = new Map<string, { x: number; y: number }>()
    const COLUMN_WIDTH = 320
    const ROW_HEIGHT = 120
    const START_X = LEFT_PADDING
    const START_Y = TOP_PADDING + 60

    const assignmentMap = new Map<string, StageAssignment>()
    for (const a of assignments) {
        assignmentMap.set(a.nodeId, a)
    }

    // Group by stage
    const stageGroups = new Map<PipelineStage, Node[]>()
    for (const node of nodes) {
        const a = assignmentMap.get(node.id)
        const stage = a?.stage || 'transform'
        if (!stageGroups.has(stage)) stageGroups.set(stage, [])
        stageGroups.get(stage)!.push(node)
    }

    for (const [stage, stageNodes] of stageGroups) {
        const col = STAGE_PARTITION[stage] || 5
        const x = START_X + col * COLUMN_WIDTH

        stageNodes.forEach((node, idx) => {
            positionMap.set(node.id, { x, y: START_Y + idx * ROW_HEIGHT })
        })
    }

    return positionMap
}

// ============================================
// MAIN ENTRY POINT
// ============================================

/**
 * Unified semantic layout for the MDF Simulator.
 * Used by both Profile Selection and Auto Layout button.
 *
 * Pipeline:
 *   1. Normalize stages and roles
 *   2. Run ELK with stage partitioning (generous spacing)
 *   3. Pin governance rail at bottom
 *   4. Center identity hub vertically
 *   5. Return positioned nodes + stage column data
 */
export async function semanticAutoLayout(
    nodes: Node[],
    edges: Edge[]
): Promise<Node[]> {
    if (!nodes || nodes.length === 0) return nodes ?? []

    // Sanitize inputs
    const safeNodes = nodes.filter(n => n?.id)
    const nodeIds = new Set(safeNodes.map(n => n.id))
    const safeEdges = sanitizeEdges(edges).filter(e =>
        nodeIds.has(e.source) && nodeIds.has(e.target)
    )

    // Step 1: Normalize — assign stages and roles
    const assignments = normalizeStagesAndRoles(safeNodes)

    // Step 2: Run ELK with stage partitions
    const positionMap = await runElkWithStageConstraints(safeNodes, safeEdges, assignments)

    // Step 3: Pin governance rail at bottom (cross-cutting concern)
    // Step 3: Pin governance rail at TOP
    pinGovernanceRail(safeNodes, assignments, positionMap)

    // Step 3b: Pin infrastructure at BOTTOM
    pinInfrastructureBand(safeNodes, assignments, positionMap)

    // Step 4: Center MDF Hub vertically
    pinMdfCenter(safeNodes, assignments, positionMap)

    // Step 5: Enforce Vertical Non-Overlap (The "Ladder" Fix)
    enforceVerticalNonOverlap(safeNodes, assignments, positionMap)

    // Apply positions to nodes
    const layoutedNodes = safeNodes.map(node => {
        const newPos = positionMap.get(node.id)
        if (newPos) {
            return {
                ...node,
                position: newPos
            }
        }
        return node
    })

    return layoutedNodes
}

// ============================================
// STEP 5: ENFORCE VERTICAL NON-OVERLAP
// ============================================

function enforceVerticalNonOverlap(
    nodes: Node[],
    assignments: StageAssignment[],
    positionMap: Map<string, { x: number; y: number }>
): void {
    // Group nodes by approximate X column (or Stage) to identify stacks
    // We use the integer partition as the key
    const columns = new Map<number, string[]>() // partition -> nodeIds[]

    for (const node of nodes) {
        const assignment = assignments.find(a => a.nodeId === node.id)
        if (!assignment || assignment.isGovernance || assignment.isInfrastructure || assignment.isIdentityHub) continue

        const partition = STAGE_PARTITION[assignment.stage] || 5
        if (!columns.has(partition)) columns.set(partition, [])
        columns.get(partition)!.push(node.id)
    }

    // Process each column
    for (const [_, nodeIds] of columns) {
        if (nodeIds.length <= 1) continue

        // 1. Sort by current Y position (or ID if identical) to respect ELK's relative ordering if it exists
        nodeIds.sort((aId, bId) => {
            const posA = positionMap.get(aId)
            const posB = positionMap.get(bId)
            if (!posA || !posB) return 0
            if (Math.abs(posA.y - posB.y) < 5) return aId.localeCompare(bId) // Tie-break
            return posA.y - posB.y
        })

        // 2. Stack them with enforced spacing
        // Find the top-most Y as the starting point
        let currentY = positionMap.get(nodeIds[0])?.y || TOP_PADDING

        // Ensure strictly increasing Y
        for (let i = 0; i < nodeIds.length; i++) {
            const nodeId = nodeIds[i]
            const pos = positionMap.get(nodeId)

            if (pos) {
                // Determine height (Hub is taller, but this lopp excludes Hub usually)
                // We use standard height + spacing
                positionMap.set(nodeId, { x: pos.x, y: currentY })
                currentY += NODE_HEIGHT + NODE_NODE_SPACING
            }
        }
    }
}

/**
 * Helper to get stage columns after layout (call after semanticAutoLayout).
 * Returns column bounds for rendering stage headers.
 */
export function getStageColumnsFromNodes(nodes: Node[]): StageColumn[] {
    const assignments = normalizeStagesAndRoles(nodes)
    return computeStageColumns(nodes, assignments)
}

/**
 * Helper: Apply semantic layout to a GraphData object (for profile selection).
 * Returns nodes with updated positions.
 */
export async function layoutGraphData(
    graphNodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: MdfNodeData }>,
    graphEdges: Array<{ id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string }>
): Promise<Array<{ id: string; type: string; position: { x: number; y: number }; data: MdfNodeData }>> {
    // Convert to Node[] format
    const rfNodes: Node[] = graphNodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data as Record<string, unknown>
    }))

    const rfEdges: Edge[] = graphEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
    }))

    const positioned = await semanticAutoLayout(rfNodes, rfEdges)

    // Map back to GraphData format
    return positioned.map(n => ({
        id: n.id,
        type: n.type || 'mdfNode',
        position: n.position,
        data: n.data as MdfNodeData
    }))
}
