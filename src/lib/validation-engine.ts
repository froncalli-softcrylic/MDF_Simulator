// Validation Engine - Deterministic rules for MDF diagram validation
// Updated with B2B SaaS edge validation and port-type checking

import type { MdfNodeData, ValidationOutput, ValidationResult, WizardData, PortType, NodeCategory } from '@/types'
import { ALLOWED_CATEGORY_EDGES, INVALID_EDGE_RULES } from '@/types'
import { getNodeById } from '@/data/node-catalog'

// Local simplified types to avoid @xyflow/react import issues
interface RFNode {
    id: string
    data: unknown
}

interface RFEdge {
    id?: string
    source: string
    target: string
    sourceHandle?: string | null
    targetHandle?: string | null
}

interface RFConnection {
    source: string | null
    target: string | null
    sourceHandle?: string | null
    targetHandle?: string | null
}

// ============================================
// CONTEXT AND HELPERS
// ============================================

interface ValidationContext {
    nodes: RFNode[]
    edges: RFEdge[]
    wizardData?: WizardData | null
}

// Get node data safely
function getNodeData(node: RFNode): MdfNodeData | null {
    return node.data as MdfNodeData | null
}

// Get nodes by category
function getNodesByCategory(nodes: RFNode[], category: NodeCategory): RFNode[] {
    return nodes.filter(n => {
        const data = getNodeData(n)
        return data?.category === category
    })
}

// Get nodes by catalogId
function getNodesByCatalogId(nodes: RFNode[], catalogId: string): RFNode[] {
    return nodes.filter(n => {
        const data = getNodeData(n)
        return data?.catalogId === catalogId
    })
}

// Check if node has upstream connection to specific catalogId
function hasUpstreamNode(
    nodeId: string,
    targetCatalogId: string,
    nodes: RFNode[],
    edges: RFEdge[]
): boolean {
    const visited = new Set<string>()
    const queue = [nodeId]

    while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)

        const upstreamEdges = edges.filter(e => e.target === current)
        for (const edge of upstreamEdges) {
            const sourceNode = nodes.find(n => n.id === edge.source)
            if (sourceNode) {
                const data = getNodeData(sourceNode)
                if (data?.catalogId === targetCatalogId) {
                    return true
                }
                queue.push(sourceNode.id)
            }
        }
    }
    return false
}

// ============================================
// EDGE VALIDATION - Port Type Checking
// ============================================

export interface EdgeValidationResult {
    isValid: boolean
    errorMessage?: string
    warningMessage?: string
    portMatch?: {
        sourcePort: PortType | 'any'
        targetPort: PortType | 'any'
        isCompatible: boolean
    }
}

/**
 * Validate a proposed edge connection before it happens
 * Called when user drags an edge or in real-time
 */
export function validateEdgeConnection(
    sourceNodeId: string,
    targetNodeId: string,
    nodes: RFNode[],
    sourceHandle?: string | null,
    targetHandle?: string | null
): EdgeValidationResult {
    const sourceNode = nodes.find(n => n.id === sourceNodeId)
    const targetNode = nodes.find(n => n.id === targetNodeId)

    if (!sourceNode || !targetNode) {
        return { isValid: false, errorMessage: 'Source or target node not found' }
    }

    const sourceData = getNodeData(sourceNode)
    const targetData = getNodeData(targetNode)

    if (!sourceData || !targetData) {
        return { isValid: false, errorMessage: 'Invalid node data' }
    }

    // Get catalog definitions
    const sourceCatalog = getNodeById(sourceData.catalogId)
    const targetCatalog = getNodeById(targetData.catalogId)

    if (!sourceCatalog || !targetCatalog) {
        // Allow connections for nodes not in catalog (custom nodes)
        return { isValid: true, warningMessage: 'Custom node - validation skipped' }
    }

    const sourceCategory = sourceData.category as NodeCategory
    const targetCategory = targetData.category as NodeCategory

    // Check invalid edge rules first (nonsense prevention)
    for (const rule of INVALID_EDGE_RULES) {
        if (rule.sourceCategory && rule.targetCategory) {
            if (sourceCategory === rule.sourceCategory && targetCategory === rule.targetCategory) {
                return { isValid: false, errorMessage: rule.message }
            }
        }
        if (rule.targetCategory && !rule.sourceCategory) {
            if (targetCategory === rule.targetCategory) {
                return { isValid: false, errorMessage: rule.message }
            }
        }
    }

    // Find matching allowed edge rule
    const allowedRule = ALLOWED_CATEGORY_EDGES.find(
        rule => rule.source === sourceCategory && rule.target === targetCategory
    )

    if (!allowedRule) {
        // Check if it's a governance connection (allows looser rules)
        if (sourceCategory === 'governance_rail') {
            return { isValid: true, warningMessage: 'Governance connection (outside standard flow)' }
        }

        // Special case: Allow direct source to storage for simpler diagrams
        if (sourceCategory === 'source' && (targetCategory === 'storage_raw' || targetCategory === 'storage_warehouse')) {
            return { isValid: true, warningMessage: 'Direct source-to-storage (consider adding collection/ingestion)' }
        }

        return {
            isValid: false,
            errorMessage: `${sourceCatalog.name} (${sourceCategory}) cannot directly connect to ${targetCatalog.name} (${targetCategory})`
        }
    }

    // Validate port types
    const sourceOutputPorts = sourceCatalog.outputs || []
    const targetInputPorts = targetCatalog.inputs || []

    // Find the specific ports being connected (or use first available)
    const sourcePort = sourceHandle
        ? sourceOutputPorts.find(p => p.id === sourceHandle)
        : sourceOutputPorts[0]
    const targetPort = targetHandle
        ? targetInputPorts.find(p => p.id === targetHandle)
        : targetInputPorts[0]

    const sourcePortType = sourcePort?.type || 'any'
    const targetPortType = targetPort?.type || 'any'

    // Check if port types are compatible
    const isPortCompatible =
        sourcePortType === 'any' ||
        targetPortType === 'any' ||
        sourcePortType === targetPortType ||
        allowedRule.allowedPortTypes.includes(sourcePortType)

    if (!isPortCompatible) {
        return {
            isValid: false,
            errorMessage: `Port type mismatch: ${sourcePortType} output cannot connect to ${targetPortType} input`,
            portMatch: { sourcePort: sourcePortType, targetPort: targetPortType, isCompatible: false }
        }
    }

    return {
        isValid: true,
        portMatch: { sourcePort: sourcePortType, targetPort: targetPortType, isCompatible: true }
    }
}

/**
 * Validate a Connection event from React Flow
 */
export function validateConnection(connection: RFConnection, nodes: RFNode[]): EdgeValidationResult {
    return validateEdgeConnection(
        connection.source || '',
        connection.target || '',
        nodes,
        connection.sourceHandle,
        connection.targetHandle
    )
}

// ============================================
// GRAPH-LEVEL VALIDATION RULES
// ============================================

// Rule: Activation destinations require consent
function checkActivationConsent(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const activationNodes = getNodesByCategory(ctx.nodes, 'activation')
    const destinationNodes = getNodesByCategory(ctx.nodes, 'destination')
    const hasConsent = getNodesByCatalogId(ctx.nodes, 'consent_manager').length > 0 ||
        getNodesByCatalogId(ctx.nodes, 'consent_preferences').length > 0

    if ((activationNodes.length > 0 || destinationNodes.length > 0) && !hasConsent) {
        results.push({
            id: 'activation-no-consent',
            severity: 'warning',
            message: 'Activation destinations should have Consent & Preferences governance in place.',
            nodeIds: [...activationNodes.map(n => n.id), ...destinationNodes.map(n => n.id)],
            recommendation: {
                action: 'Add Consent Manager',
                nodeToAdd: 'consent_manager'
            }
        })
    }

    return results
}

// Rule: Account Graph requires identity sources
function checkAccountGraphSources(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const accountGraphNodes = getNodesByCategory(ctx.nodes, 'account_graph')

    if (accountGraphNodes.length > 0) {
        // Check for CRM or identity-bearing sources
        const hasIdentitySources = ctx.nodes.some(n => {
            const data = getNodeData(n)
            if (!data) return false
            return ['salesforce_crm', 'hubspot_crm', 'product_events'].includes(data.catalogId)
        })

        if (!hasIdentitySources) {
            results.push({
                id: 'account-graph-no-sources',
                severity: 'warning',
                message: 'Account Graph hub requires identity-bearing sources (e.g., CRM, Product Events).',
                nodeIds: accountGraphNodes.map(n => n.id),
                recommendation: {
                    action: 'Add Salesforce CRM',
                    nodeToAdd: 'salesforce_crm'
                }
            })
        }
    }

    return results
}

// Rule: Check for missing governance
function checkGovernance(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const governanceNodes = getNodesByCategory(ctx.nodes, 'governance_rail')

    if (ctx.nodes.length > 3 && governanceNodes.length === 0) {
        results.push({
            id: 'no-governance',
            severity: 'warning',
            message: 'No governance components detected. Consider adding data quality checks or consent management.',
            recommendation: {
                action: 'Add Data Quality',
                nodeToAdd: 'data_quality'
            }
        })
    }

    return results
}

// Rule: Check for disconnected nodes
function checkDisconnectedNodes(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = ctx

    for (const node of nodes) {
        const hasConnections = edges.some(e => e.source === node.id || e.target === node.id)
        if (!hasConnections && nodes.length > 1) {
            const data = getNodeData(node)
            // Skip warning for governance rail nodes (they connect conceptually)
            if (data?.category !== 'governance_rail') {
                results.push({
                    id: `disconnected-${node.id}`,
                    severity: 'warning',
                    message: `${data?.label || 'Node'} is not connected to other components.`,
                    nodeIds: [node.id]
                })
            }
        }
    }

    return results
}

// Rule: Transform should flow to Account Graph for B2B
function checkAccountGraphFlow(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const transformNodes = getNodesByCategory(ctx.nodes, 'transform')
    const accountGraphNodes = getNodesByCategory(ctx.nodes, 'account_graph')

    if (transformNodes.length > 0 && accountGraphNodes.length === 0) {
        results.push({
            id: 'recommend-account-graph',
            severity: 'info',
            message: 'For B2B SaaS, consider adding an Account Graph Hub to unify account relationships.',
            recommendation: {
                action: 'Add AWS Neptune Graph',
                nodeToAdd: 'neptune_graph'
            }
        })
    }

    return results
}

// Rule: Wizard-driven recommendations
function checkWizardRecommendations(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { wizardData, nodes } = ctx

    if (!wizardData) return results

    // ABM targeting
    if (wizardData.goals?.includes('abm_targeting')) {
        const hasSixsense = getNodesByCatalogId(nodes, 'sixsense').length > 0
        const hasBombora = getNodesByCatalogId(nodes, 'bombora').length > 0
        if (!hasSixsense && !hasBombora) {
            results.push({
                id: 'recommend-intent-data',
                severity: 'info',
                message: 'For ABM targeting, add intent data providers like 6sense or Bombora.',
                recommendation: {
                    action: 'Add 6sense Intent Data',
                    nodeToAdd: 'sixsense'
                }
            })
        }
    }

    // Churn prevention
    if (wizardData.goals?.includes('reduce_churn')) {
        const hasChurnModel = getNodesByCatalogId(nodes, 'churn_model').length > 0
        if (!hasChurnModel) {
            results.push({
                id: 'recommend-churn-model',
                severity: 'info',
                message: 'Add a Churn Prediction Model to identify at-risk accounts.',
                recommendation: {
                    action: 'Add Churn Model',
                    nodeToAdd: 'churn_model'
                }
            })
        }
    }

    return results
}

// ============================================
// MAIN VALIDATION FUNCTION
// ============================================

export function validateGraph(
    nodes: RFNode[],
    edges: RFEdge[],
    wizardData?: WizardData | null
): ValidationOutput {
    const ctx: ValidationContext = { nodes, edges, wizardData }

    const allResults: ValidationResult[] = [
        ...checkActivationConsent(ctx),
        ...checkAccountGraphSources(ctx),
        ...checkGovernance(ctx),
        ...checkAccountGraphFlow(ctx),
        ...checkWizardRecommendations(ctx),
        ...checkDisconnectedNodes(ctx)
    ]

    const errors = allResults.filter(r => r.severity === 'error')
    const warnings = allResults.filter(r => r.severity === 'warning')
    const recommendations = allResults.filter(r => r.severity === 'info')

    return {
        errors,
        warnings,
        recommendations,
        isValid: errors.length === 0
    }
}

// ============================================
// NODE PREREQUISITE CHECK
// ============================================

export function checkNodePrerequisites(
    catalogId: string,
    nodes: RFNode[],
    _edges: RFEdge[]
): { met: string[]; missing: string[] } {
    const catalogNode = getNodeById(catalogId)
    if (!catalogNode) return { met: [], missing: [] }

    const met: string[] = []
    const missing: string[] = []

    for (const prereqId of catalogNode.prerequisites) {
        const hasPrereq = nodes.some(n => {
            const data = getNodeData(n)
            return data?.catalogId === prereqId
        })
        if (hasPrereq) {
            met.push(prereqId)
        } else {
            missing.push(prereqId)
        }
    }

    return { met, missing }
}
