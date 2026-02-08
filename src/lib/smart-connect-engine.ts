// Smart Connect Engine - Level 2
// Generates suggested edges and node insertions for MDF architecture coherence
// Non-destructive: shows preview, user confirms before applying

import type {
    NodeCategory,
    PipelineStage,
    PortType,
    NodeRole,
    CatalogNode
} from '@/types'
import { STAGE_TO_COLUMN } from '@/types'
import { getNodeById, nodeCatalog } from '@/data/node-catalog'
import { generateId } from '@/lib/utils'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import type { ProfileDefinition } from '@/data/profile-definitions'

// ============================================
// TYPES
// ============================================

export interface SuggestedEdge {
    id: string
    source: string           // RFNode id
    sourceHandle: string     // Port id
    target: string           // RFNode id
    targetHandle: string     // Port id
    portType: PortType

    reason: string           // Human-readable explanation
    confidence: 'high' | 'medium' | 'low'
    required: boolean        // True = architectural necessity
    ruleId: string           // Which rule generated this

    selected: boolean        // User toggle (default: true if high/required)
}

export interface SuggestedNodeInsertion {
    id: string
    catalogId: string
    suggestedPosition?: { x: number; y: number }

    connectFrom?: { nodeId: string; portId: string }[]
    connectTo?: { nodeId: string; portId: string }[]

    reason: string
    required: boolean
    selected: boolean
}

export interface DuplicateResolution {
    uniquenessKey: string
    existingNodeId: string
    conflictingCatalogId: string
    resolution: 'keep_existing' | 'replace' | 'pending'
}

export interface FixPlan {
    suggestedEdges: SuggestedEdge[]
    suggestedInsertions: SuggestedNodeInsertion[]
    duplicateResolutions: DuplicateResolution[]

    totalSuggestions: number
    requiredFixes: number
    highConfidence: number
}

export interface ConnectivityGap {
    type: 'missing_upstream' | 'missing_downstream' | 'broken_chain' | 'orphan' | 'missing_rail'
    nodeId: string
    expectedRole?: NodeRole
    expectedStage?: PipelineStage
    severity: 'error' | 'warning' | 'info'
}

interface StageGraphNode {
    catalogNode: CatalogNode
    rfNode: RFNode
}

export interface StageGraph {
    nodes: Map<string, StageGraphNode>
    stageGroups: Map<PipelineStage, string[]>
    outbound: Map<string, Set<string>>
    inbound: Map<string, Set<string>>
    railNodes: string[]
    hubNodes: string[]
}

// ============================================
// CONSTANTS
// ============================================

const STAGE_ORDER: PipelineStage[] = [
    'sources', 'collection', 'ingestion', 'storage_raw',
    'storage_warehouse', 'transform', 'identity',
    'governance', 'analytics', 'activation', 'destination'
]

const STAGE_COLUMNS = STAGE_TO_COLUMN

// Port compatibility matrix
const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
    raw_events: ['raw_events', 'raw_records'],
    raw_records: ['raw_records', 'raw_events'],

    identity_keys: ['identity_keys', 'raw_records'],
    curated_entities: ['curated_entities', 'audiences_accounts', 'audiences_people', 'raw_records'],
    graph_edges: ['graph_edges', 'identity_keys'],

    metrics: ['metrics', 'curated_entities'],
    audiences_accounts: ['audiences_accounts', 'curated_entities'],
    audiences_people: ['audiences_people', 'curated_entities'],

    governance_policies: ['governance_policies'],
    audit_events: ['audit_events', 'governance_policies'],

    // New Schema Types
    dataset_raw: ['dataset_raw', 'raw_records'],
    crm_data: ['crm_data', 'raw_records', 'curated_entities'],
    activation_payload: ['activation_payload', 'audiences_people', 'audiences_accounts'],
    analysis_result: ['analysis_result', 'metrics'],
    identity_resolution: ['identity_resolution', 'identity_keys'],
    stream_events: ['stream_events', 'raw_events']
}

// Destination input restrictions
const DESTINATION_ALLOWED_INPUTS: PortType[] = [
    'audiences_accounts', 'audiences_people', 'curated_entities'
]

// Role to expected upstream/downstream
const UPSTREAM_ROLE_MAP: Partial<Record<NodeRole, NodeRole>> = {
    collector: 'source',
    ingestor: 'collector',
    storage_raw: 'ingestor',
    warehouse: 'storage_raw',
    transform: 'warehouse',
    identity_hub: 'transform',
    analytics: 'transform',
    activation_connector: 'identity_hub',
    destination: 'activation_connector'
}

const DOWNSTREAM_ROLE_MAP: Partial<Record<NodeRole, NodeRole>> = {
    source: 'collector',
    collector: 'ingestor',
    ingestor: 'storage_raw',
    storage_raw: 'warehouse',
    warehouse: 'transform',
    transform: 'identity_hub',
    identity_hub: 'activation_connector',
    activation_connector: 'destination'
}

// ============================================
// STEP A: BUILD STAGE GRAPH
// ============================================

export function buildStageGraph(
    nodes: RFNode[],
    edges: RFEdge[]
): StageGraph {
    const stageGraph: StageGraph = {
        nodes: new Map(),
        stageGroups: new Map(),
        outbound: new Map(),
        inbound: new Map(),
        railNodes: [],
        hubNodes: []
    }

    // Ensure arrays are valid
    const safeNodes = nodes ?? []
    const safeEdges = edges ?? []

    // Build node map with catalog info
    for (const rfNode of safeNodes) {
        if (!rfNode?.id) continue

        const catalogId = (rfNode.data as { catalogId?: string })?.catalogId
        if (!catalogId) continue

        const catalogNode = getNodeById(catalogId)
        if (!catalogNode) continue

        stageGraph.nodes.set(rfNode.id, { catalogNode, rfNode })

        // Determine stage from catalog
        const stage = inferStage(catalogNode)
        if (!stageGraph.stageGroups.has(stage)) {
            stageGraph.stageGroups.set(stage, [])
        }
        stageGraph.stageGroups.get(stage)!.push(rfNode.id)

        // Track rails and hubs
        if (catalogNode.isRailNode) {
            stageGraph.railNodes.push(rfNode.id)
        }
        if (catalogNode.isHub) {
            stageGraph.hubNodes.push(rfNode.id)
        }

        // Init adjacency
        stageGraph.outbound.set(rfNode.id, new Set())
        stageGraph.inbound.set(rfNode.id, new Set())
    }

    // Build adjacency from edges (with null checks)
    for (const edge of safeEdges) {
        if (!edge?.source || !edge?.target) continue
        stageGraph.outbound.get(edge.source)?.add(edge.target)
        stageGraph.inbound.get(edge.target)?.add(edge.source)
    }

    return stageGraph
}

function inferStage(catalogNode: CatalogNode): PipelineStage {
    // Use explicit stage if available
    if (catalogNode.stage) return catalogNode.stage

    // Infer from category
    // Infer from category
    const categoryToStage: Record<NodeCategory, PipelineStage> = {
        sources: 'sources',
        collection: 'collection',
        ingestion: 'ingestion',
        storage_raw: 'storage_raw',
        storage_warehouse: 'storage_warehouse',
        transform: 'transform',
        identity: 'identity',
        governance: 'governance',
        analytics: 'analytics',
        activation: 'activation',
        destination: 'destination',
        clean_room: 'clean_room',
        realtime_serving: 'realtime_serving'
    }
    return categoryToStage[catalogNode.category] || 'sources'
}

// ============================================
// STEP B: FIND CONNECTIVITY GAPS
// ============================================

export function findConnectivityGaps(graph: StageGraph): ConnectivityGap[] {
    const gaps: ConnectivityGap[] = []

    for (const [nodeId, { catalogNode }] of graph.nodes) {
        const inbound = graph.inbound.get(nodeId) || new Set()
        const outbound = graph.outbound.get(nodeId) || new Set()

        // Skip governance rails for orphan detection  
        if (catalogNode.isRailNode && catalogNode.category === 'governance') continue

        const role = catalogNode.nodeRole || inferRoleFromCategory(catalogNode.category)

        // Orphan detection (except sources and governance)
        if (inbound.size === 0 && outbound.size === 0 && role !== 'source' && role !== 'governance') {
            gaps.push({ type: 'orphan', nodeId, severity: 'warning' })
        }

        // Missing upstream (non-sources should have inbound)
        if (role !== 'source' && role !== 'governance' && role !== 'enrichment' && inbound.size === 0) {
            gaps.push({
                type: 'missing_upstream',
                nodeId,
                expectedRole: UPSTREAM_ROLE_MAP[role],
                severity: 'error'
            })
        }

        // Missing downstream (non-terminal nodes should have outbound)
        if (!['destination', 'analytics', 'governance'].includes(role) && outbound.size === 0) {
            gaps.push({
                type: 'missing_downstream',
                nodeId,
                expectedRole: DOWNSTREAM_ROLE_MAP[role],
                severity: 'warning'
            })
        }
    }

    const nodesArray = [...graph.nodes.values()]
    const hasActivation = nodesArray.some(
        n => n.catalogNode.nodeRole === 'activation_connector' ||
            n.catalogNode.nodeRole === 'destination'
    )
    const hasConsent = nodesArray.some(
        n => n.catalogNode.id === 'consent_manager'
    )

    if (hasActivation && !hasConsent) {
        gaps.push({
            type: 'missing_rail',
            nodeId: 'graph',
            expectedRole: 'governance',
            severity: 'error'
        })
    }

    const hasAnalyticsModels = nodesArray.some(
        n => ['attribution_model', 'mmm_model'].includes(n.catalogNode.id)
    )
    const hasSemanticLayer = nodesArray.some(
        n => n.catalogNode.category === 'transform' && n.catalogNode.id.includes('semantic')
    )

    if (hasAnalyticsModels && !hasSemanticLayer) {
        gaps.push({
            type: 'broken_chain',
            nodeId: 'graph',
            expectedStage: 'transform',
            severity: 'warning'
        })
    }

    // Check for missing identity hub when activation exists
    const hasIdentityHub = [...graph.nodes.values()].some(
        n => n.catalogNode.isHub || n.catalogNode.category === 'identity'
    )
    if (hasActivation && !hasIdentityHub) {
        gaps.push({
            type: 'missing_rail',
            nodeId: 'graph',
            expectedRole: 'identity_hub',
            severity: 'error'
        })
    }

    return gaps
}

function inferRoleFromCategory(category: NodeCategory): NodeRole {
    const mapping: Record<NodeCategory, NodeRole> = {
        sources: 'source',
        collection: 'collector',
        ingestion: 'ingestor',
        storage_raw: 'storage_raw',
        storage_warehouse: 'warehouse',
        transform: 'transform',
        identity: 'identity_hub',
        governance: 'governance',
        analytics: 'analytics',
        activation: 'activation_connector',
        destination: 'destination',
        clean_room: 'clean_room',
        realtime_serving: 'realtime_serving'
    }
    return mapping[category] || 'source'
}

// ============================================
// STEP C: PROPOSE EDGES FOR GAPS
// ============================================

export function proposeEdgesForGap(
    gap: ConnectivityGap,
    graph: StageGraph,
    profileDef?: ProfileDefinition | null
): SuggestedEdge[] {
    const suggestions: SuggestedEdge[] = []

    // Skip graph-level gaps (handled by node insertions)
    if (gap.nodeId === 'graph') return suggestions

    const node = graph.nodes.get(gap.nodeId)
    if (!node) return suggestions

    const { catalogNode, rfNode } = node
    const currentStage = inferStage(catalogNode)
    const currentStageIdx = STAGE_ORDER.indexOf(currentStage)

    if (gap.type === 'missing_upstream') {
        // Find candidates in previous stages
        const prevStages = STAGE_ORDER.slice(0, currentStageIdx).reverse()

        for (const stage of prevStages) {
            const candidates = graph.stageGroups.get(stage) || []

            for (const candidateId of candidates) {
                const candidate = graph.nodes.get(candidateId)
                if (!candidate) continue

                // Check if candidate already connects to this node
                if (graph.outbound.get(candidateId)?.has(rfNode.id)) continue

                const portMatch = findCompatiblePorts(
                    candidate.catalogNode.outputs ?? [],
                    catalogNode.inputs ?? []
                )

                if (portMatch) {
                    suggestions.push({
                        id: `suggest-${generateId()}`,
                        source: candidateId,
                        sourceHandle: portMatch.output.id,
                        target: rfNode.id,
                        targetHandle: portMatch.input.id,
                        portType: portMatch.output.type,
                        reason: `${candidate.catalogNode.name} → ${catalogNode.name}`,
                        confidence: calculateConfidence(candidate.catalogNode, catalogNode, profileDef),
                        required: false,
                        ruleId: 'missing_upstream',
                        selected: true
                    })
                    // Take first good match per stage
                    break
                }
            }

            // Stop after finding at least one suggestion
            if (suggestions.length > 0) break
        }
    }

    if (gap.type === 'missing_downstream') {
        // Find candidates in next stages
        const nextStages = STAGE_ORDER.slice(currentStageIdx + 1)

        for (const stage of nextStages) {
            const candidates = graph.stageGroups.get(stage) || []

            for (const candidateId of candidates) {
                const candidate = graph.nodes.get(candidateId)
                if (!candidate) continue

                // Check if already connected
                if (graph.outbound.get(rfNode.id)?.has(candidateId)) continue

                const portMatch = findCompatiblePorts(
                    catalogNode.outputs ?? [],
                    candidate.catalogNode.inputs ?? []
                )

                if (portMatch) {
                    // Check destination input restrictions
                    if (candidate.catalogNode.nodeRole === 'destination') {
                        if (!DESTINATION_ALLOWED_INPUTS.includes(portMatch.output.type)) {
                            continue // Skip invalid destination inputs
                        }
                    }

                    suggestions.push({
                        id: `suggest-${generateId()}`,
                        source: rfNode.id,
                        sourceHandle: portMatch.output.id,
                        target: candidateId,
                        targetHandle: portMatch.input.id,
                        portType: portMatch.output.type,
                        reason: `${catalogNode.name} → ${candidate.catalogNode.name}`,
                        confidence: calculateConfidence(catalogNode, candidate.catalogNode, profileDef),
                        required: false,
                        ruleId: 'missing_downstream',
                        selected: true
                    })
                    break
                }
            }

            if (suggestions.length > 0) break
        }
    }

    return suggestions
}

function findCompatiblePorts(
    outputs: Array<{ id: string; type: PortType }>,
    inputs: Array<{ id: string; type: PortType }>
): { output: { id: string; type: PortType }; input: { id: string; type: PortType } } | null {
    for (const output of outputs) {
        for (const input of inputs) {
            if (isPortCompatible(output.type, input.type)) {
                return { output, input }
            }
        }
    }
    return null
}

function isPortCompatible(outputType: PortType, inputType: PortType): boolean {
    if (outputType === inputType) return true

    const compatible = PORT_COMPATIBILITY[outputType] || []
    return compatible.includes(inputType)
}

function calculateConfidence(
    source: CatalogNode,
    target: CatalogNode,
    profileDef?: ProfileDefinition | null
): 'high' | 'medium' | 'low' {
    // 1. Profile-specific rule (Highest Priority)
    if (profileDef) {
        // If this edge is explicitly required/recommended in profile, high confidence
        // (Simplified check: if both nodes are required in profile, assume connection is good)
        if (profileDef.requiredNodes.includes(source.id) && profileDef.requiredNodes.includes(target.id)) {
            // Check if valid connection exists in profile definition's recommended edges (if we had that detailed a map)
            // For now, boost confidence if they are key stack components
            return 'high'
        }
    }

    // 2. Explicit recommendation in Catalog
    if (source.recommendedNext?.includes(target.id)) return 'high'

    // 3. Adjacent stages
    const sourceStage = inferStage(source)
    const targetStage = inferStage(target)
    const stageDiff = Math.abs(
        STAGE_ORDER.indexOf(sourceStage) - STAGE_ORDER.indexOf(targetStage)
    )

    if (stageDiff <= 1) return 'medium'
    return 'low'
}

// ============================================
// STEP C2: INSERT REQUIRED INTERMEDIATE NODES
// ============================================

export function insertRequiredIntermediateNodes(
    graph: StageGraph,
    gaps: ConnectivityGap[]
): SuggestedNodeInsertion[] {
    const insertions: SuggestedNodeInsertion[] = []

    // Check: Attribution/MMM without Semantic Layer
    const analyticsModels = [...graph.nodes.values()].filter(
        n => ['attribution_model', 'mmm_model'].includes(n.catalogNode.id)
    )
    const hasSemanticLayer = [...graph.nodes.values()].some(
        n => n.catalogNode.category === 'transform' && n.catalogNode.id.includes('semantic')
    )
    const dbtNode = [...graph.nodes.values()].find(
        n => n.catalogNode.id === 'dbt_core' || n.catalogNode.id === 'dbt_cloud'
    )

    if (analyticsModels.length > 0 && !hasSemanticLayer && dbtNode) {
        insertions.push({
            id: `insert-${generateId()}`,
            catalogId: 'looker',
            suggestedPosition: {
                x: dbtNode.rfNode.position.x + 260,
                y: dbtNode.rfNode.position.y
            },
            connectFrom: [{ nodeId: dbtNode.rfNode.id, portId: 'entities_out' }],
            connectTo: analyticsModels.map(m => ({ nodeId: m.rfNode.id, portId: 'metrics_in' })),
            reason: 'Attribution/MMM models require a Semantic Layer (Rule 4)',
            required: true,
            selected: true
        })
    }

    // Check: Destination without activation connector
    const destinations = [...graph.nodes.values()].filter(
        n => n.catalogNode.nodeRole === 'destination'
    )
    const hasActivation = [...graph.nodes.values()].some(
        n => n.catalogNode.nodeRole === 'activation_connector'
    )

    if (destinations.length > 0 && !hasActivation) {
        const avgY = destinations.length > 0
            ? destinations.reduce((sum, d) => sum + (d.rfNode.position?.y ?? 0), 0) / destinations.length
            : 300
        const positions = destinations.map(d => d.rfNode.position?.x ?? 500)
        const minX = positions.length > 0 ? Math.min(...positions) : 500

        insertions.push({
            id: `insert-${generateId()}`,
            catalogId: 'hightouch',
            suggestedPosition: { x: minX - 260, y: avgY },
            connectTo: destinations.map(d => ({ nodeId: d.rfNode.id, portId: 'audiences_in' })),
            reason: 'Destinations require an activation connector (Reverse ETL)',
            required: true,
            selected: true
        })
    }

    // Check: Activation without consent governance
    if (gaps.some(g => g.type === 'missing_rail' && g.expectedRole === 'governance')) {
        const activationNodes = [...graph.nodes.values()].filter(
            n => n.catalogNode.nodeRole === 'activation_connector'
        )

        if (activationNodes.length > 0) {
            const firstActivation = activationNodes[0]
            insertions.push({
                id: `insert-${generateId()}`,
                catalogId: 'consent_manager',
                suggestedPosition: {
                    x: firstActivation.rfNode.position.x - 260,
                    y: 40  // Rail position at top
                },
                connectTo: activationNodes.map(a => ({ nodeId: a.rfNode.id, portId: 'policies_in' })),
                reason: 'Activation requires Consent governance (Rule 1)',
                required: true,
                selected: true
            })
        }
    }

    // Check: Identity hub without upstream connection
    const identityHub = [...graph.nodes.values()].find(
        n => (n.catalogNode.isHub || n.catalogNode.category === 'identity')
    )

    // Suggest Identity Hub if missing but Activation is present
    if (!identityHub && hasActivation && dbtNode) {
        insertions.push({
            id: `insert-${generateId()}`,
            catalogId: 'neptune_graph',
            suggestedPosition: {
                x: dbtNode.rfNode.position.x + 260,
                y: dbtNode.rfNode.position.y + 100
            },
            connectFrom: [{ nodeId: dbtNode.rfNode.id, portId: 'identity_out' }],
            reason: 'B2B Activation requires a central Identity Hub (Account Graph).',
            required: true,
            selected: true
        })
    }

    // Check for missing transform (dbt) between Warehouse and Analytics/Activation
    const warehouses = [...graph.nodes.values()].filter(n => n.catalogNode.category === 'storage_warehouse')
    const hasAnalyticsModels = [...graph.nodes.values()].some(n => n.catalogNode.category === 'analytics')
    const needsTransform = warehouses.length > 0 && !dbtNode && (hasAnalyticsModels || hasActivation)

    if (needsTransform) {
        const warehouse = warehouses[0]
        insertions.push({
            id: `insert-${generateId()}`,
            catalogId: 'dbt_core',
            suggestedPosition: {
                x: warehouse.rfNode.position.x + 260,
                y: warehouse.rfNode.position.y
            },
            connectFrom: [{ nodeId: warehouse.rfNode.id, portId: 'records_out' }],
            reason: 'Bridge missing: Add a transformation layer (dbt) to curate warehouse data.',
            required: true,
            selected: true
        })
    }

    return insertions
}

// ============================================
// HELPER: SANITIZE EDGES
// ============================================

export function sanitizeEdges(edges: any[]): RFEdge[] {
    if (!Array.isArray(edges)) return []
    return edges.filter(e =>
        e &&
        typeof e === 'object' &&
        typeof e.source === 'string' &&
        typeof e.target === 'string'
    )
}

// ============================================
// STEP D: GENERATE FIX PLAN
// ============================================

// Helper: Suggest Governance Connections (Rule 1)
function suggestGovernanceConnections(
    graph: StageGraph
): SuggestedEdge[] {
    const suggestions: SuggestedEdge[] = []
    // Find Policy-Providing Nodes (Consent Manager, Governance)
    const policyProviders = [...graph.nodes.values()].filter(n =>
        n.catalogNode.outputs?.some(p => p.type === 'governance_policies')
    )

    if (policyProviders.length === 0) return suggestions

    // Find Policy-Consuming Nodes (Activation, Ingestion, Sources)
    const policyConsumers = [...graph.nodes.values()].filter(n =>
        n.catalogNode.inputs?.some(p => p.type === 'governance_policies')
    )

    for (const consumer of policyConsumers) {
        // Find best policy provider (closest or preferred)
        const provider = policyProviders[0] // Simplify: Connect to first available

        // Check if already connected
        if (graph.inbound.get(consumer.rfNode.id)?.has(provider.rfNode.id)) continue

        suggestions.push({
            id: `suggest-gov-${generateId()}`,
            source: provider.rfNode.id,
            target: consumer.rfNode.id,
            sourceHandle: provider.catalogNode.outputs!.find(p => p.type === 'governance_policies')!.id,
            targetHandle: consumer.catalogNode.inputs!.find(p => p.type === 'governance_policies')!.id,
            portType: 'governance_policies',
            reason: 'Apply governance policies to data flow.',
            confidence: 'high',
            required: true,
            ruleId: 'governance-policy',
            selected: true
        })
    }
    return suggestions
}

export function generateFixPlan(
    nodes: RFNode[],
    edges: RFEdge[],
    profileDef?: ProfileDefinition | null
): FixPlan {
    // Aggressive sanitization
    const safeNodes = Array.isArray(nodes) ? nodes.filter(n => n?.id) : []
    const safeEdges = sanitizeEdges(edges)

    const graph = buildStageGraph(safeNodes, safeEdges)
    const gaps = findConnectivityGaps(graph)

    // Generate suggested edges for each node-specific gap
    let suggestedEdges: SuggestedEdge[] = []

    // 1. Suggest Governance Connections (Rule 1)
    suggestedEdges.push(...suggestGovernanceConnections(graph))

    for (const gap of gaps) {
        if (gap.nodeId !== 'graph') {
            suggestedEdges.push(...proposeEdgesForGap(gap, graph, profileDef))
        }
    }

    // Deduplicate edges (same source-target pair)
    const edgeKeys = new Set<string>()
    suggestedEdges = suggestedEdges.filter(edge => {
        const key = `${edge.source}->${edge.target}`
        if (edgeKeys.has(key)) return false
        edgeKeys.add(key)
        return true
    })

    // Generate node insertions for structural gaps
    const suggestedInsertions = insertRequiredIntermediateNodes(graph, gaps)

    // Check for singleton violations
    const duplicateResolutions = checkSingletonViolations(safeNodes)

    // Sort by priority: required first, then by confidence
    suggestedEdges.sort((a, b) => {
        if (a.required !== b.required) return a.required ? -1 : 1
        const confOrder = { high: 0, medium: 1, low: 2 }
        return confOrder[a.confidence] - confOrder[b.confidence]
    })

    return {
        suggestedEdges,
        suggestedInsertions,
        duplicateResolutions,
        totalSuggestions: suggestedEdges.length + suggestedInsertions.length,
        requiredFixes: suggestedEdges.filter(e => e.required).length +
            suggestedInsertions.filter(i => i.required).length,
        highConfidence: suggestedEdges.filter(e => e.confidence === 'high').length
    }
}

function checkSingletonViolations(nodes: RFNode[]): DuplicateResolution[] {
    if (!nodes || !Array.isArray(nodes)) return []
    const resolutions: DuplicateResolution[] = []
    const singletonTracker = new Map<string, string>() // uniquenessKey → nodeId

    for (const node of nodes) {
        const catalogId = (node.data as { catalogId?: string })?.catalogId
        if (!catalogId) continue

        const catalogNode = getNodeById(catalogId)
        if (!catalogNode?.uniquenessKey) continue

        const existing = singletonTracker.get(catalogNode.uniquenessKey)
        if (existing && existing !== node.id) {
            resolutions.push({
                uniquenessKey: catalogNode.uniquenessKey,
                existingNodeId: existing,
                conflictingCatalogId: catalogId,
                resolution: 'pending'
            })
        } else {
            singletonTracker.set(catalogNode.uniquenessKey, node.id)
        }
    }

    return resolutions
}

// ============================================
// STEP E: APPLY FIX PLAN
// ============================================

export function applyFixPlan(
    fixPlan: FixPlan,
    currentNodes: RFNode[],
    currentEdges: RFEdge[]
): { nodes: RFNode[]; edges: RFEdge[] } {
    let nodes = [...currentNodes]
    let edges = [...currentEdges]

    // Track node ID mapping for insertions
    const insertedNodeMap = new Map<string, string>()

    // Apply selected node insertions first
    for (const insertion of fixPlan.suggestedInsertions) {
        if (!insertion.selected) continue

        const catalogNode = getNodeById(insertion.catalogId)
        if (!catalogNode) continue

        const newNodeId = `node-${generateId()}`
        insertedNodeMap.set(insertion.id, newNodeId)

        const newNode: RFNode = {
            id: newNodeId,
            type: 'mdfNode',
            position: insertion.suggestedPosition || { x: 500, y: 300 },
            data: {
                catalogId: insertion.catalogId,
                label: catalogNode.name,
                category: catalogNode.category,
                status: 'recommended',
                isRailNode: catalogNode.isRailNode
            }
        }
        nodes.push(newNode)

        // Create edges from connectFrom
        for (const from of insertion.connectFrom || []) {
            edges.push({
                id: `edge-${generateId()}`,
                source: from.nodeId,
                target: newNodeId,
                sourceHandle: from.portId,
                targetHandle: catalogNode.inputs?.[0]?.id
            })
        }

        // Create edges to connectTo
        for (const to of insertion.connectTo || []) {
            edges.push({
                id: `edge-${generateId()}`,
                source: newNodeId,
                target: to.nodeId,
                sourceHandle: catalogNode.outputs?.[0]?.id,
                targetHandle: to.portId
            })
        }
    }

    // Apply selected edge suggestions
    for (const suggestion of fixPlan.suggestedEdges) {
        if (!suggestion.selected) continue

        // Skip if edge already exists
        const exists = edges.some(
            e => e.source === suggestion.source && e.target === suggestion.target
        )
        if (exists) continue

        edges.push({
            id: suggestion.id,
            source: suggestion.source,
            target: suggestion.target,
            sourceHandle: suggestion.sourceHandle,
            targetHandle: suggestion.targetHandle
        })
    }

    return { nodes, edges }
}

// ============================================
// HELPER: Get summary stats
// ============================================

export function getFixPlanSummary(fixPlan: FixPlan): string {
    const parts: string[] = []

    if (fixPlan.requiredFixes > 0) {
        parts.push(`${fixPlan.requiredFixes} required fix${fixPlan.requiredFixes === 1 ? '' : 'es'}`)
    }
    if (fixPlan.highConfidence > 0) {
        parts.push(`${fixPlan.highConfidence} high-confidence`)
    }

    const optional = fixPlan.totalSuggestions - fixPlan.requiredFixes - fixPlan.highConfidence
    if (optional > 0) {
        parts.push(`${optional} optional`)
    }

    if (fixPlan.suggestedInsertions.length > 0) {
        parts.push(`${fixPlan.suggestedInsertions.length} node insertion${fixPlan.suggestedInsertions.length === 1 ? '' : 's'}`)
    }

    return parts.join(', ') || 'No suggestions'
}
