// MDF Detection Engine
// Detects when a user's pipeline has enough components to benefit from
// consolidation into a Marketing Data Foundation (MDF Hub).

import type { NodeCategory, GraphData, MdfNodeData } from '@/types'
import { getNodeById } from '@/data/node-catalog'
import { generateId } from '@/lib/utils'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'

// ============================================
// TYPES
// ============================================

export interface MdfCandidate {
    nodeId: string           // React Flow node ID
    catalogId: string        // Catalog node ID
    name: string             // Display name
    category: NodeCategory   // Pipeline category
}

export interface MdfSuggestion {
    /** How many distinct MDF-eligible categories are covered */
    categoryCoverage: number
    /** Total MDF-eligible nodes detected */
    totalNodes: number
    /** The distinct categories present */
    coveredCategories: NodeCategory[]
    /** Detailed list of candidate nodes */
    candidates: MdfCandidate[]
    /** A human-readable summary of the opportunity */
    summary: string
}

// Categories that constitute the internal layers of an MDF
// (excludes 'sources' and 'destination' — those stay external)
const MDF_ELIGIBLE_CATEGORIES: NodeCategory[] = [
    'collection',
    'ingestion',
    'storage_raw',
    'storage_warehouse',
    'transform',
    'identity',
    'analytics',
    'activation',
]

// Minimum number of distinct MDF categories to trigger the suggestion
const MIN_CATEGORY_THRESHOLD = 3

// Pipeline ordering for auto-wiring the MDF Hub internal graph
const CATEGORY_ORDER: NodeCategory[] = [
    'collection',
    'ingestion',
    'storage_raw',
    'storage_warehouse',
    'transform',
    'identity',
    'analytics',
    'activation',
]

// ============================================
// DETECTION
// ============================================

/**
 * Analyzes the current canvas to determine if the user's pipeline
 * has enough MDF-eligible components to suggest consolidation into
 * a Marketing Data Foundation (MDF Hub).
 *
 * Returns null if:
 * - An MDF Hub node already exists on the canvas
 * - Fewer than MIN_CATEGORY_THRESHOLD distinct categories are present
 */
export function detectMdfOpportunity(
    nodes: RFNode[],
    edges: RFEdge[]
): MdfSuggestion | null {
    if (!nodes || nodes.length === 0) return null

    // Check if MDF Hub already exists on canvas
    const hasMdfHub = nodes.some(n => {
        const catalogId = (n.data as MdfNodeData)?.catalogId
        return catalogId === 'mdf_hub'
    })
    if (hasMdfHub) return null

    // Scan all nodes for MDF-eligible categories
    const candidates: MdfCandidate[] = []
    const coveredCategories = new Set<NodeCategory>()

    for (const node of nodes) {
        const data = node.data as MdfNodeData
        if (!data?.catalogId) continue

        const catalogNode = getNodeById(data.catalogId)
        if (!catalogNode) continue

        // Check if this node's category qualifies
        if (MDF_ELIGIBLE_CATEGORIES.includes(catalogNode.category)) {
            candidates.push({
                nodeId: node.id,
                catalogId: data.catalogId,
                name: catalogNode.name,
                category: catalogNode.category,
            })
            coveredCategories.add(catalogNode.category)
        }
    }

    // Not enough coverage to suggest
    if (coveredCategories.size < MIN_CATEGORY_THRESHOLD) return null

    const categoryList = Array.from(coveredCategories)
    const categoryNames = categoryList.map(c =>
        c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    )

    return {
        categoryCoverage: coveredCategories.size,
        totalNodes: candidates.length,
        coveredCategories: categoryList,
        candidates,
        summary: `Your pipeline spans ${coveredCategories.size} MDF layers (${categoryNames.join(', ')}). These ${candidates.length} components can be unified into a Marketing Data Foundation Hub for centralized data hygiene, identity resolution, and activation.`,
    }
}

// ============================================
// MDF HUB INTERNAL GRAPH BUILDER
// ============================================

/**
 * Takes MDF-eligible candidate nodes from the main canvas and builds
 * the internal graph for the MDF Hub node, automatically wiring
 * components in pipeline order.
 */
export function buildMdfHubInternalGraph(
    candidates: MdfCandidate[]
): GraphData {
    if (!candidates || candidates.length === 0) {
        return { nodes: [], edges: [] }
    }

    // Group candidates by category
    const byCategory = new Map<NodeCategory, MdfCandidate[]>()
    for (const c of candidates) {
        if (!byCategory.has(c.category)) {
            byCategory.set(c.category, [])
        }
        byCategory.get(c.category)!.push(c)
    }

    // Order categories according to pipeline flow
    const orderedCategories = CATEGORY_ORDER.filter(cat => byCategory.has(cat))

    // Build positioned nodes (Left-to-Right layout)
    const COL_SPACING = 300
    const ROW_SPACING = 120
    const START_Y = 300

    const nodeMap: Record<string, string> = {} // catalogId -> new node ID
    const graphNodes: GraphData['nodes'] = []

    for (let colIdx = 0; colIdx < orderedCategories.length; colIdx++) {
        const category = orderedCategories[colIdx]
        const categoryNodes = byCategory.get(category)!

        for (let rowIdx = 0; rowIdx < categoryNodes.length; rowIdx++) {
            const candidate = categoryNodes[rowIdx]
            const catalogNode = getNodeById(candidate.catalogId)
            if (!catalogNode) continue

            const newId = `mdf-internal-${generateId()}`
            nodeMap[candidate.catalogId] = newId

            const totalInCategory = categoryNodes.length
            const yOffset = (rowIdx - (totalInCategory - 1) / 2) * ROW_SPACING

            graphNodes.push({
                id: newId,
                type: 'mdfNode',
                position: {
                    x: colIdx * COL_SPACING,
                    y: START_Y + yOffset,
                },
                data: {
                    catalogId: candidate.catalogId,
                    label: catalogNode.name,
                    category: catalogNode.category,
                    status: 'existing',
                    isRailNode: catalogNode.isRailNode,
                    railPosition: undefined,
                } as MdfNodeData,
            })
        }
    }

    // Wire edges: connect each category's nodes to the next category's nodes
    const graphEdges: GraphData['edges'] = []

    for (let i = 0; i < orderedCategories.length - 1; i++) {
        const sourceCategory = orderedCategories[i]
        const targetCategory = orderedCategories[i + 1]

        const sourceNodes = byCategory.get(sourceCategory)!
        const targetNodes = byCategory.get(targetCategory)!

        // Connect each source node to each target node (fan-out)
        for (const srcCandidate of sourceNodes) {
            const srcId = nodeMap[srcCandidate.catalogId]
            if (!srcId) continue

            for (const tgtCandidate of targetNodes) {
                const tgtId = nodeMap[tgtCandidate.catalogId]
                if (!tgtId) continue

                graphEdges.push({
                    id: `edge-${generateId()}`,
                    source: srcId,
                    target: tgtId,
                    style: { stroke: '#b0b8c8', strokeWidth: 2 },
                })
            }
        }
    }

    return { nodes: graphNodes, edges: graphEdges }
}
