// Auto Layout Engine
// Semantic normalization, smart connect suggestions, and ELK.js layout

import type {
    PipelineStage,
    NodeCategory,
    PortType,
    SuggestedEdge,
    SuggestedFixes,
    DuplicateConflict,
    MissingNodeSuggestion,
    STAGE_TO_COLUMN
} from '@/types'
import { getNodeById, nodeCatalog } from '@/data/node-catalog'
import { generateId } from '@/lib/utils'
import { ALLOWED_CATEGORY_EDGES } from '@/types'

// ============================================
// LOCAL TYPES
// ============================================

interface CanvasNode {
    id: string
    catalogId: string
    category: NodeCategory
    position: { x: number; y: number }
}

interface CanvasEdge {
    id: string
    source: string
    target: string
    sourceHandle?: string | null
    targetHandle?: string | null
}

interface NormalizationResult {
    stageAssignments: Map<string, PipelineStage>
    duplicates: DuplicateConflict[]
}

// ============================================
// CONSTANTS
// ============================================

const COLUMN_WIDTH = 260
const ROW_HEIGHT = 120
const START_X = 100
const START_Y = 150
const GOVERNANCE_RAIL_Y = 40
const IDENTITY_HUB_Y = 350

// Pipeline flow order
const PIPELINE_FLOW: PipelineStage[] = [
    'source',
    'collection',
    'ingestion',
    'storage_raw',
    'storage_warehouse',
    'transform',
    'identity_hub',
    'analytics',
    'activation',
    'destination'
]

// Stage column positions
const STAGE_COLUMNS: Record<PipelineStage, number> = {
    source: 0,
    collection: 1,
    ingestion: 2,
    storage_raw: 3,
    storage_warehouse: 4,
    transform: 5,
    identity_hub: 6,
    analytics: 7,
    activation: 7,  // Parallel with analytics
    destination: 8
}

// Singleton uniqueness keys for preventing duplicates
const SINGLETON_KEYS: Record<string, string> = {
    // Warehouses
    snowflake: 'warehouse:primary',
    bigquery: 'warehouse:primary',
    redshift: 'warehouse:primary',
    databricks: 'warehouse:primary',

    // Raw landing zones (by cloud)
    s3_raw: 'raw_landing:aws',
    gcs_raw: 'raw_landing:gcp',

    // Transform
    dbt_core: 'transform:dbt',
    dbt_cloud: 'transform:dbt',

    // Identity graphs
    neptune_graph: 'identity:graph',

    // Reverse ETL
    hightouch: 'reverse_etl:primary',
    census: 'reverse_etl:primary',

    // CDPs
    segment: 'cdp:primary'
}

// ============================================
// STAGE INFERENCE
// ============================================

/**
 * Infer pipeline stage from category
 */
function inferStageFromCategory(category: NodeCategory): PipelineStage {
    const mapping: Record<NodeCategory, PipelineStage> = {
        source: 'source',
        collection: 'collection',
        ingestion: 'ingestion',
        storage_raw: 'storage_raw',
        storage_warehouse: 'storage_warehouse',
        transform: 'transform',
        analytics: 'analytics',
        activation: 'activation',
        destination: 'destination',
        governance_rail: 'transform',     // Floats at top
        account_graph: 'identity_hub'     // Hub between transform and outputs
    }
    return mapping[category] || 'source'
}

/**
 * Get stage for a canvas node
 */
function getNodeStage(node: CanvasNode): PipelineStage {
    const catalog = getNodeById(node.catalogId)
    // Use explicit stage from catalog if available
    if (catalog?.stage) return catalog.stage
    // Otherwise infer from category
    return inferStageFromCategory(node.category)
}

// ============================================
// SEMANTIC NORMALIZATION
// ============================================

/**
 * Normalize graph by assigning stages and detecting duplicates
 */
export function normalizeGraph(nodes: CanvasNode[]): NormalizationResult {
    const stageAssignments = new Map<string, PipelineStage>()
    const duplicates: DuplicateConflict[] = []
    const uniquenessTracker = new Map<string, { nodeId: string; catalogId: string }>()

    for (const node of nodes) {
        const catalog = getNodeById(node.catalogId)
        if (!catalog) continue

        // 1. Assign stage
        const stage = getNodeStage(node)
        stageAssignments.set(node.id, stage)

        // 2. Check for uniqueness conflicts
        const uniqueKey = catalog.uniquenessKey || SINGLETON_KEYS[node.catalogId]
        if (uniqueKey) {
            const existing = uniquenessTracker.get(uniqueKey)
            if (existing && existing.nodeId !== node.id) {
                duplicates.push({
                    uniquenessKey: uniqueKey,
                    existingNodeId: existing.nodeId,
                    existingCatalogId: existing.catalogId,
                    newCatalogId: node.catalogId,
                    resolution: 'pending'
                })
            } else {
                uniquenessTracker.set(uniqueKey, {
                    nodeId: node.id,
                    catalogId: node.catalogId
                })
            }
        }
    }

    return { stageAssignments, duplicates }
}

// ============================================
// SMART CONNECT SUGGESTIONS
// ============================================

/**
 * Get allowed next stages in the pipeline
 */
function getNextStages(stage: PipelineStage): PipelineStage[] {
    const flow: Record<PipelineStage, PipelineStage[]> = {
        source: ['collection', 'ingestion'],
        collection: ['ingestion'],
        ingestion: ['storage_raw', 'storage_warehouse'],
        storage_raw: ['storage_warehouse'],
        storage_warehouse: ['transform'],
        transform: ['identity_hub', 'analytics', 'activation'],
        identity_hub: ['analytics', 'activation'],
        analytics: [],
        activation: ['destination'],
        destination: []
    }
    return flow[stage] || []
}

/**
 * Find compatible ports between source and target
 */
function findCompatiblePorts(
    sourceOutputs: Array<{ id: string; type: PortType }>,
    targetInputs: Array<{ id: string; type: PortType }>
): { sourcePort: { id: string; type: PortType }; targetPort: { id: string; type: PortType } } | null {
    for (const output of sourceOutputs) {
        for (const input of targetInputs) {
            // Type match or 'any' type accepts all
            if (output.type === input.type || output.type === 'any' || input.type === 'any') {
                return { sourcePort: output, targetPort: input }
            }
        }
    }
    return null
}

/**
 * Calculate confidence for suggested edge
 */
function calculateConfidence(
    sourceCatalogId: string,
    targetCatalogId: string
): 'high' | 'medium' | 'low' {
    const sourceCatalog = getNodeById(sourceCatalogId)
    const targetCatalog = getNodeById(targetCatalogId)
    if (!sourceCatalog || !targetCatalog) return 'low'

    // High: explicit recommendedNext match
    if (sourceCatalog.recommendedNext?.includes(targetCatalogId)) return 'high'

    // High: target has preferredUpstream matching source
    if (targetCatalog.preferredUpstream?.includes(sourceCatalogId)) return 'high'

    // Medium: both are preferred stack nodes
    if (sourceCatalog.preferredStackNode && targetCatalog.preferredStackNode) return 'medium'

    return 'low'
}

/**
 * Generate smart connect edge suggestions
 */
export function generateSmartConnectSuggestions(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    stageAssignments: Map<string, PipelineStage>
): SuggestedEdge[] {
    const suggestions: SuggestedEdge[] = []
    const existingConnections = new Set(
        edges.map(e => `${e.source}->${e.target}`)
    )

    // Group nodes by stage
    const nodesByStage = new Map<PipelineStage, CanvasNode[]>()
    for (const node of nodes) {
        const stage = stageAssignments.get(node.id) || getNodeStage(node)
        if (!nodesByStage.has(stage)) {
            nodesByStage.set(stage, [])
        }
        nodesByStage.get(stage)!.push(node)
    }

    // Check each node for missing outbound connections
    for (const node of nodes) {
        const catalog = getNodeById(node.catalogId)
        if (!catalog) continue

        // Skip governance rail nodes (they connect conceptually, not physically)
        if (catalog.isRailNode && catalog.category === 'governance_rail') continue

        const currentStage = stageAssignments.get(node.id) || getNodeStage(node)
        const nextStages = getNextStages(currentStage)

        // Check if node already has outbound edges
        const hasOutbound = edges.some(e => e.source === node.id)
        if (hasOutbound) continue

        // Find candidates in next stages
        for (const nextStage of nextStages) {
            const candidates = nodesByStage.get(nextStage) || []

            for (const candidate of candidates) {
                const candidateCatalog = getNodeById(candidate.catalogId)
                if (!candidateCatalog) continue

                const connectionKey = `${node.id}->${candidate.id}`
                if (existingConnections.has(connectionKey)) continue

                // Check port compatibility
                const portMatch = findCompatiblePorts(
                    catalog.outputs || [],
                    candidateCatalog.inputs || []
                )

                if (portMatch) {
                    suggestions.push({
                        id: `suggest-${generateId()}`,
                        source: node.id,
                        target: candidate.id,
                        sourcePort: portMatch.sourcePort.id,
                        targetPort: portMatch.targetPort.id,
                        portTypes: {
                            source: portMatch.sourcePort.type,
                            target: portMatch.targetPort.type
                        },
                        confidence: calculateConfidence(node.catalogId, candidate.catalogId),
                        reason: `${catalog.name} → ${candidateCatalog.name} (${portMatch.sourcePort.type})`,
                        selected: true  // Selected by default for high confidence
                    })
                }
            }
        }
    }

    // Sort by confidence (high first)
    return suggestions.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.confidence] - order[b.confidence]
    })
}

// ============================================
// MISSING STAGE DETECTION
// ============================================

const CRITICAL_STAGES: PipelineStage[] = ['source', 'storage_warehouse', 'transform']

const DEFAULT_NODES_BY_STAGE: Record<PipelineStage, string[]> = {
    source: ['product_events', 'salesforce_crm'],
    collection: ['segment'],
    ingestion: ['kinesis_firehose', 'fivetran'],
    storage_raw: ['s3_raw'],
    storage_warehouse: ['snowflake'],
    transform: ['dbt_core'],
    identity_hub: ['neptune_graph', 'account_resolution'],
    analytics: ['looker'],
    activation: ['hightouch'],
    destination: ['salesforce_crm_dest', 'linkedin_ads']
}

/**
 * Detect missing pipeline stages
 */
export function detectMissingStages(
    nodes: CanvasNode[],
    stageAssignments: Map<string, PipelineStage>
): MissingNodeSuggestion[] {
    const presentStages = new Set(stageAssignments.values())
    const suggestions: MissingNodeSuggestion[] = []

    // Check critical stages
    for (const stage of CRITICAL_STAGES) {
        if (!presentStages.has(stage)) {
            suggestions.push({
                stage,
                recommendedCatalogIds: DEFAULT_NODES_BY_STAGE[stage] || [],
                reason: `Missing ${stage} - required for complete MDF`,
                severity: 'critical'
            })
        }
    }

    // If destinations exist, recommend activation
    if (presentStages.has('destination') && !presentStages.has('activation')) {
        suggestions.push({
            stage: 'activation',
            recommendedCatalogIds: ['hightouch', 'census'],
            reason: 'Destinations without Reverse ETL - add activation layer',
            severity: 'recommended'
        })
    }

    // If activation exists, recommend identity hub
    if (presentStages.has('activation') && !presentStages.has('identity_hub')) {
        suggestions.push({
            stage: 'identity_hub',
            recommendedCatalogIds: ['neptune_graph', 'account_resolution'],
            reason: 'Account Graph Hub recommended for B2B SaaS accuracy',
            severity: 'recommended'
        })
    }

    return suggestions
}

// ============================================
// LAYOUT CALCULATION
// ============================================

interface LayoutResult {
    positions: Map<string, { x: number; y: number }>
}

/**
 * Calculate node positions based on stage assignments (simplified ELK-like layout)
 */
export function calculateLayout(
    nodes: CanvasNode[],
    stageAssignments: Map<string, PipelineStage>
): LayoutResult {
    const positions = new Map<string, { x: number; y: number }>()

    // Group nodes by stage for row positioning
    const nodesByStage = new Map<PipelineStage, CanvasNode[]>()
    const governanceNodes: CanvasNode[] = []
    const hubNodes: CanvasNode[] = []

    for (const node of nodes) {
        const catalog = getNodeById(node.catalogId)
        const stage = stageAssignments.get(node.id) || getNodeStage(node)

        // Separate governance rail and hub nodes
        if (catalog?.category === 'governance_rail') {
            governanceNodes.push(node)
        } else if (catalog?.isHub || catalog?.category === 'account_graph') {
            hubNodes.push(node)
        } else {
            if (!nodesByStage.has(stage)) {
                nodesByStage.set(stage, [])
            }
            nodesByStage.get(stage)!.push(node)
        }
    }

    // Position governance rail at top
    governanceNodes.forEach((node, idx) => {
        const column = 3 + idx  // Start at column 3 (after ingestion)
        positions.set(node.id, {
            x: START_X + column * COLUMN_WIDTH,
            y: GOVERNANCE_RAIL_Y
        })
    })

    // Position identity hub nodes in center
    hubNodes.forEach((node, idx) => {
        const column = STAGE_COLUMNS['identity_hub']
        const row = idx % 2
        const col = Math.floor(idx / 2)
        positions.set(node.id, {
            x: START_X + (column + col * 0.8) * COLUMN_WIDTH,
            y: IDENTITY_HUB_Y + row * ROW_HEIGHT
        })
    })

    // Position pipeline nodes by stage
    for (const [stage, stageNodes] of nodesByStage) {
        const column = STAGE_COLUMNS[stage]
        const x = START_X + column * COLUMN_WIDTH

        stageNodes.forEach((node, idx) => {
            positions.set(node.id, {
                x,
                y: START_Y + idx * ROW_HEIGHT
            })
        })
    }

    return { positions }
}

// ============================================
// COMPLETE SUGGESTED FIXES
// ============================================

/**
 * Generate complete suggested fixes for the graph
 */
export function generateSuggestedFixes(
    nodes: CanvasNode[],
    edges: CanvasEdge[]
): SuggestedFixes {
    const { stageAssignments, duplicates } = normalizeGraph(nodes)
    const suggestedEdges = generateSmartConnectSuggestions(nodes, edges, stageAssignments)
    const missingNodes = detectMissingStages(nodes, stageAssignments)

    // Find orphaned nodes (no connections)
    const connectedNodeIds = new Set<string>()
    for (const edge of edges) {
        connectedNodeIds.add(edge.source)
        connectedNodeIds.add(edge.target)
    }
    const orphanedNodes = nodes
        .filter(n => !connectedNodeIds.has(n.id) && nodes.length > 1)
        .map(n => n.id)

    return {
        suggestedEdges,
        missingNodes,
        duplicates,
        orphanedNodes
    }
}

// ============================================
// DROP VALIDATION (for guardrails)
// ============================================

interface DropResult {
    action: 'allow' | 'prompt_replace' | 'warn' | 'block'
    conflict?: DuplicateConflict
    message?: string
}

/**
 * Validate a node drop for singleton conflicts
 */
export function validateNodeDrop(
    catalogId: string,
    nodes: CanvasNode[]
): DropResult {
    const catalog = getNodeById(catalogId)
    if (!catalog) return { action: 'allow' }

    // Get uniqueness key
    const uniqueKey = catalog.uniquenessKey || SINGLETON_KEYS[catalogId]
    if (!uniqueKey) return { action: 'allow' }

    // Check for existing node with same key
    const existingNode = nodes.find(n => {
        const nodeCatalog = getNodeById(n.catalogId)
        const nodeKey = nodeCatalog?.uniquenessKey || SINGLETON_KEYS[n.catalogId]
        return nodeKey === uniqueKey
    })

    if (existingNode) {
        return {
            action: 'prompt_replace',
            conflict: {
                uniquenessKey: uniqueKey,
                existingNodeId: existingNode.id,
                existingCatalogId: existingNode.catalogId,
                newCatalogId: catalogId,
                resolution: 'pending'
            }
        }
    }

    return { action: 'allow' }
}

/**
 * Check if a node is a singleton (only one allowed)
 */
export function isSingletonNode(catalogId: string): boolean {
    const catalog = getNodeById(catalogId)
    return !!(catalog?.uniquenessKey || SINGLETON_KEYS[catalogId])
}

/**
 * Check if a singleton already exists on canvas
 */
export function singletonExistsOnCanvas(
    catalogId: string,
    nodes: CanvasNode[]
): { exists: boolean; existingNodeId?: string; existingCatalogId?: string } {
    const catalog = getNodeById(catalogId)
    const uniqueKey = catalog?.uniquenessKey || SINGLETON_KEYS[catalogId]
    if (!uniqueKey) return { exists: false }

    const existing = nodes.find(n => {
        const nodeCatalog = getNodeById(n.catalogId)
        const nodeKey = nodeCatalog?.uniquenessKey || SINGLETON_KEYS[n.catalogId]
        return nodeKey === uniqueKey
    })

    if (existing) {
        return {
            exists: true,
            existingNodeId: existing.id,
            existingCatalogId: existing.catalogId
        }
    }

    return { exists: false }
}
