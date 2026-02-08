import {
    GraphData,
    DemoProfile,
    PipelineStage,
    NodeCategory,
    SuggestedFixes,
    NodeStatus,
    MdfNodeData
} from '@/types'
import { PROFILE_DEFINITIONS, ProfileDefinition } from '@/data/profile-definitions'
import { getNodeById } from '@/data/node-catalog'
import { generateId } from '@/lib/utils'

// ============================================
// PIPELINE CORE
// ============================================

export function loadProfileDefinition(profileId: DemoProfile): ProfileDefinition | null {
    // Handle both new and legacy profile lookups
    return PROFILE_DEFINITIONS[profileId] ?? PROFILE_DEFINITIONS['preferred_stack']
}

export function buildGraphFromProfile(profileDef: ProfileDefinition): GraphData {
    const allNodes = [
        ...profileDef.requiredNodes,
        ...profileDef.recommendedNodes
    ]

    // Deduplicate
    const uniqueNodes = Array.from(new Set(allNodes))

    const nodeMap: Record<string, string> = {}

    const nodes = uniqueNodes
        .filter(catalogId => getNodeById(catalogId)) // Validate exists
        .map((catalogId, index) => {
            const catalogNode = getNodeById(catalogId)!
            const nodeId = `node-${generateId()}` // New unique ID
            nodeMap[catalogId] = nodeId

            const isRequired = profileDef.requiredNodes.includes(catalogId)
            const isRail = profileDef.governanceRailNodes.includes(catalogId)
            const isHub = profileDef.identityHubNodes.includes(catalogId)

            return {
                id: nodeId,
                type: 'mdfNode',
                // Initial position (will be fixed by ELK)
                position: { x: 0, y: index * 100 },
                data: {
                    catalogId,
                    label: catalogNode.name,
                    category: catalogNode.category,
                    status: isRequired ? 'required' : 'recommended',
                    isRailNode: isRail,
                    railPosition: (isRail ? 'top' : (isHub ? 'center' : undefined)) as 'top' | 'center' | undefined,
                    stage: categoryToStage(catalogNode.category),
                    // Additional metadata for conformance
                    isGovernanceRail: isRail,
                    isIdentityHub: isHub
                } as MdfNodeData
            }
        })

    const allEdges = [
        ...profileDef.requiredEdges,
        ...profileDef.recommendedEdges
    ]

    const edges = allEdges
        .filter(e => nodeMap[e.source] && nodeMap[e.target])
        .map(e => ({
            id: `edge-${generateId()}`,
            source: nodeMap[e.source],
            target: nodeMap[e.target],
            data: {
                required: profileDef.requiredEdges.some(
                    re => re.source === e.source && re.target === e.target
                )
            }
        }))

    return { nodes, edges }
}

export function normalizeGraph(graph: GraphData, profileDef: ProfileDefinition): GraphData {
    const normalizedNodes = graph.nodes.map(node => {
        const catalogNode = getNodeById(node.data.catalogId)
        if (!catalogNode) return node

        // Determine if node is part of the canonical profile plan
        const isRail = profileDef.governanceRailNodes.includes(node.data.catalogId)
        const isHub = profileDef.identityHubNodes.includes(node.data.catalogId)

        return {
            ...node,
            data: {
                ...node.data,
                stage: categoryToStage(catalogNode.category),
                isRailNode: isRail, // Reinforce rail status
                railPosition: (isRail ? 'top' : (isHub ? 'center' : undefined)) as 'top' | 'center' | undefined
            }
        }
    })

    return { ...graph, nodes: normalizedNodes }
}

// ============================================
// CONFORMANCE & VALIDATION
// ============================================

export function validateConformance(
    graph: GraphData,
    profileDef: ProfileDefinition
): { valid: boolean; violations: string[] } {
    const violations: string[] = []
    const presentCatalogIds = new Set(graph.nodes.map(n => n.data.catalogId))

    // Check required nodes
    for (const required of profileDef.requiredNodes) {
        if (!presentCatalogIds.has(required)) {
            const nodeName = getNodeById(required)?.name || required
            violations.push(`Missing required node: ${nodeName}`)
        }
    }

    // Check required edges
    const catalogIdToNodeId = new Map(graph.nodes.map(n => [n.data.catalogId, n.id]))

    for (const edge of profileDef.requiredEdges) {
        // Only check if both nodes exist (missing nodes already reported)
        if (presentCatalogIds.has(edge.source) && presentCatalogIds.has(edge.target)) {
            const sourceId = catalogIdToNodeId.get(edge.source)
            const targetId = catalogIdToNodeId.get(edge.target)

            if (sourceId && targetId) {
                const edgeExists = graph.edges.some(
                    e => e.source === sourceId && e.target === targetId
                )
                if (!edgeExists) {
                    const sourceName = getNodeById(edge.source)?.name || edge.source
                    const targetName = getNodeById(edge.target)?.name || edge.target
                    violations.push(`Missing required connection: ${sourceName} → ${targetName}`)
                }
            }
        }
    }

    // Check governance rail exists (if defined)
    if (profileDef.governanceRailNodes.length > 0) {
        const hasGovernance = graph.nodes.some(n =>
            profileDef.governanceRailNodes.includes(n.data.catalogId)
        )
        if (!hasGovernance) {
            violations.push('Missing governance rail components')
        }
    }

    return { valid: violations.length === 0, violations }
}

export function generateFixPlan(
    graph: GraphData,
    profileDef: ProfileDefinition
): SuggestedFixes {
    const fixes: SuggestedFixes = {
        autoApplyEdges: [],
        suggestedEdges: [],
        suggestedNodes: [],
        missingNodes: [],
        duplicates: [],
        orphanedNodes: [],
        totalSuggestions: 0
    }

    const presentCatalogIds = new Set(graph.nodes.map(n => n.data.catalogId))
    const catalogIdToNodeId = new Map(graph.nodes.map(n => [n.data.catalogId, n.id]))

    // 1. Find missing required edges (Auto-Apply)
    for (const edge of profileDef.requiredEdges) {
        if (presentCatalogIds.has(edge.source) && presentCatalogIds.has(edge.target)) {
            const sourceId = catalogIdToNodeId.get(edge.source)!
            const targetId = catalogIdToNodeId.get(edge.target)!

            const exists = graph.edges.some(e => e.source === sourceId && e.target === targetId)
            if (!exists) {
                fixes.autoApplyEdges.push({
                    source: sourceId,
                    target: targetId,
                    sourceCatalogId: edge.source,
                    targetCatalogId: edge.target
                })
            }
        }
    }

    // 2. Find missing required nodes (Suggest)
    for (const catalogId of profileDef.requiredNodes) {
        if (!presentCatalogIds.has(catalogId)) {
            const catalogNode = getNodeById(catalogId)
            if (catalogNode) {
                fixes.suggestedNodes.push({
                    catalogId,
                    reason: 'Required for profile conformance',
                    category: catalogNode.category
                })
            }
        }
    }

    // 3. Find missing recommended edges (Suggest)
    for (const edge of profileDef.recommendedEdges) {
        if (presentCatalogIds.has(edge.source) && presentCatalogIds.has(edge.target)) {
            const sourceId = catalogIdToNodeId.get(edge.source)!
            const targetId = catalogIdToNodeId.get(edge.target)!

            const exists = graph.edges.some(e => e.source === sourceId && e.target === targetId)
            if (!exists) {
                // Determine ports (simplified/mocked for now, real logic in SmartConnect)
                fixes.suggestedEdges.push({
                    id: `suggest-${generateId()}`,
                    source: sourceId,
                    target: targetId,
                    sourcePort: 'right', // Mock
                    targetPort: 'left',  // Mock
                    portTypes: { source: 'raw_records', target: 'raw_records' },
                    sourceCatalogId: edge.source,
                    targetCatalogId: edge.target,
                    confidence: 'high',
                    reason: 'Recommended by profile strategy'
                })
            }
        }
    }

    fixes.totalSuggestions =
        fixes.autoApplyEdges.length +
        fixes.suggestedEdges.length +
        fixes.suggestedNodes.length

    return fixes
}

// ============================================
// HELPERS
// ============================================

function categoryToStage(category: NodeCategory): PipelineStage {
    const mapping: Record<NodeCategory, PipelineStage> = {
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
    return mapping[category] ?? 'transform'
}
