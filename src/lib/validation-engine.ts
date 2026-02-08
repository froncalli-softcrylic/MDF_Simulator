// Validation Engine - Deterministic rules for MDF diagram validation
// Updated with B2B SaaS edge validation and port-type checking

import type { MdfNodeData, ValidationOutput, ValidationResult, WizardData, PortType, NodeCategory } from '@/types'
import { ALLOWED_CATEGORY_EDGES, INVALID_EDGE_RULES } from '@/types'
import { getNodeById } from '@/data/node-catalog'
import { ProfileDefinition } from '@/data/profile-definitions'

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
    profileDef?: ProfileDefinition | null
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

        const upstreamEdges = (edges ?? []).filter(e => e?.target === current)
        for (const edge of upstreamEdges) {
            if (!edge?.source) continue
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
    latencyResult?: {
        isCompatible: boolean
        message?: string
        severity: 'error' | 'warning' | 'info'
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
        if (sourceCategory === 'governance') {
            return { isValid: true, warningMessage: 'Governance connection (outside standard flow)' }
        }

        // Special case: Allow direct source to storage for simpler diagrams
        if (sourceCategory === 'sources' && (targetCategory === 'storage_raw' || targetCategory === 'storage_warehouse')) {
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
        targetPortType === 'any' ||
        sourcePortType === targetPortType ||
        (sourcePortType !== 'any' && allowedRule.allowedPortTypes.includes(sourcePortType as PortType))

    // --------------------------------------------
    // Phase 2: Intelligence Checks (Latency)
    // --------------------------------------------
    const latencyCheck = validateLatency(sourceCatalog, targetCatalog)

    if (!isPortCompatible) {
        return {
            isValid: false,
            errorMessage: `Port type mismatch: ${sourcePortType} output cannot connect to ${targetPortType} input`,
            portMatch: { sourcePort: sourcePortType, targetPort: targetPortType, isCompatible: false },
            latencyResult: latencyCheck
        }
    }

    // --------------------------------------------
    // Phase 2: Intelligence Checks (Identifiers)
    // --------------------------------------------
    const identifierCheck = validateIdentifiers(sourceCatalog, targetCatalog)

    if (!isPortCompatible) {
        return {
            isValid: false,
            errorMessage: `Port type mismatch: ${sourcePortType} output cannot connect to ${targetPortType} input`,
            portMatch: { sourcePort: sourcePortType, targetPort: targetPortType, isCompatible: false },
            latencyResult: latencyCheck
        }
    }

    return {
        isValid: true,
        // Prioritize error messages: Latency Error > ID Error > Latency Warning > ID Warning
        warningMessage: latencyCheck.severity === 'error' ? latencyCheck.message
            : identifierCheck.severity === 'error' ? identifierCheck.message
                : latencyCheck.severity === 'warning' ? latencyCheck.message
                    : identifierCheck.message,
        portMatch: {
            sourcePort: sourcePortType,
            targetPort: targetPortType,
            isCompatible: true
        },
        latencyResult: latencyCheck
    }
}

/**
 * Check if identifier requirements are compatible
 * e.g. Cookie-based source -> Email-based destination = Resolution Warning
 */
function validateIdentifiers(source: any, target: any): { isCompatible: boolean; message?: string; severity: 'error' | 'warning' | 'info' } {
    const sourceIds = source.supportedIdentifiers || [] // e.g. ['cookie', 'device_id']
    const targetIds = target.supportedIdentifiers || [] // e.g. ['email', 'crm_id']

    // If either has no specific ID requirements, assume compatibility (or infrastructure node)
    if (sourceIds.length === 0 || targetIds.length === 0) {
        return { isCompatible: true, severity: 'info' }
    }

    // Check for exact intersection
    const intersection = sourceIds.filter((id: string) => targetIds.includes(id))

    if (intersection.length > 0) {
        return { isCompatible: true, severity: 'info' }
    }

    // Special Case: Anonymous Source -> Known Destination
    const sourceIsAnonymous = sourceIds.some((id: string) => ['cookie', 'device_id'].includes(id))
    const targetIsKnown = targetIds.some((id: string) => ['email', 'crm_id', 'account_id'].includes(id))

    if (sourceIsAnonymous && targetIsKnown) {
        return {
            isCompatible: false,
            message: 'Identity Resolution Required: Connecting anonymous data (Cookie/Device) to known profile (Email/CRM) requires an Identity Resolution step.',
            severity: 'warning'
        }
    }

    return {
        isCompatible: false,
        message: `Identifier Mismatch: Source supports [${sourceIds.join(', ')}], Target expects [${targetIds.join(', ')}].`,
        severity: 'warning'
    }
}

/**
 * Check if latency requirements are compatible
 * Realtime Source -> Batch Destination = Warning (Data freshness loss)
 * Batch Source -> Realtime Destination = Error (Impossible)
 */
function validateLatency(source: any, target: any): { isCompatible: boolean; message?: string; severity: 'error' | 'warning' | 'info' } {
    const sourceLatency = source.supportedLatency || ['batch'] // Default to batch
    const targetLatency = target.supportedLatency || ['batch']

    const sourceIsRealtime = sourceLatency.includes('realtime')
    const sourceIsBatch = sourceLatency.includes('batch')

    const targetIsRealtime = targetLatency.includes('realtime')
    const targetIsBatch = targetLatency.includes('batch')

    // Case 1: Batch trying to feed Realtime-only
    if (sourceIsBatch && !sourceIsRealtime && targetIsRealtime && !targetIsBatch) {
        return {
            isCompatible: false,
            message: 'Latency Mismatch: Batch source cannot feed Real-time destination directly.',
            severity: 'error'
        }
    }

    // Case 2: Realtime feeding Batch-only (Signal loss / freshness loss)
    if (sourceIsRealtime && !sourceIsBatch && targetIsBatch && !targetIsRealtime) {
        return {
            isCompatible: true, // It works, but waste of potential
            message: 'Architecture Warning: Real-time signal will be slowed down by Batch destination.',
            severity: 'warning'
        }
    }

    return { isCompatible: true, severity: 'info' }
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

// Rule: Activation destinations require consent (Refined Phase 2)
function checkActivationConsent(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const activationNodes = getNodesByCategory(ctx.nodes, 'activation')
    const destinationNodes = getNodesByCategory(ctx.nodes, 'destination')
    const hasConsent = getNodesByCatalogId(ctx.nodes, 'consent_manager').length > 0 ||
        getNodesByCatalogId(ctx.nodes, 'consent_preferences').length > 0 ||
        getNodesByCatalogId(ctx.nodes, 'one_trust').length > 0

    if ((activationNodes.length > 0 || destinationNodes.length > 0) && !hasConsent) {
        results.push({
            id: 'activation-no-consent',
            severity: 'warning',
            message: 'Privacy Compliance: Activation destinations and engines should have Consent Manager governance in place.',
            nodeIds: [...activationNodes.map(n => n.id), ...destinationNodes.map(n => n.id)],
            ruleViolated: 'governance-integrity',
            recommendation: {
                action: 'Add Consent Manager',
                nodeToAdd: 'consent_manager'
            },
            fixAction: {
                type: 'add_node',
                payload: { catalogId: 'consent_manager' }
            }
        })
    }

    return results
}

// Rule: Account Graph requires identity sources
function checkAccountGraphSources(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const accountGraphNodes = getNodesByCategory(ctx.nodes, 'identity')

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
    const governanceNodes = getNodesByCategory(ctx.nodes, 'governance')

    if (ctx.nodes.length > 3 && governanceNodes.length === 0) {
        results.push({
            id: 'no-governance',
            severity: 'warning',
            message: 'No governance components detected. Consider adding data quality checks or consent management.',
            recommendation: {
                action: 'Add Data Quality',
                nodeToAdd: 'data_quality'
            },
            fixAction: {
                type: 'add_node',
                payload: { catalogId: 'data_quality' }
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
            if (data?.category !== 'governance') {
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

// Rule: Transform should flow to Identity Hub for B2B
function checkAccountGraphFlow(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const transformNodes = getNodesByCategory(ctx.nodes, 'transform')
    const accountGraphNodes = getNodesByCategory(ctx.nodes, 'identity')

    if (transformNodes.length > 0 && accountGraphNodes.length === 0) {
        results.push({
            id: 'recommend-account-graph',
            severity: 'info',
            message: 'For B2B SaaS, consider adding an Identity Hub to unify account relationships.',
            recommendation: {
                action: 'Add Identity Hub',
                nodeToAdd: 'account_graph'
            },
            fixAction: {
                type: 'add_node',
                payload: { catalogId: 'account_graph' }
            }
        })
    }

    return results
}

// Rule: Profile Conformance (Strict Adherence)
function checkProfileConformance(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, profileDef } = ctx

    if (!profileDef) return results

    // Check Required Nodes
    for (const requiredId of profileDef.requiredNodes) {
        const hasNode = nodes.some(n => {
            const data = getNodeData(n)
            return data?.catalogId === requiredId
        })

        if (!hasNode) {
            const nodeName = getNodeById(requiredId)?.name || requiredId
            results.push({
                id: `missing-required-${requiredId}`,
                severity: 'error',
                message: `Profile Violation: The '${profileDef.displayName}' profile requires '${nodeName}'.`,
                ruleViolated: 'profile-conformance',
                recommendation: {
                    action: `Add ${nodeName}`,
                    nodeToAdd: requiredId
                },
                fixAction: {
                    type: 'add_node',
                    payload: { catalogId: requiredId }
                }
            })
        }
    }

    return results
}

// Rule: Wizard-driven recommendations
function checkWizardRecommendations(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { wizardData, nodes } = ctx

    if (!wizardData) return results

    // ABM targeting
    if (wizardData.goals?.some(g => g === 'abm_targeting')) {
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
    if (wizardData.goals?.some(g => g === 'reduce_churn')) {
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
// CONFORMANCE SPEC VALIDATION RULES
// ============================================

// Rule: Analytics Compliance (verify metrics nodes are fed by curated data)
function checkAnalyticsCompliance(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = ctx

    const analyticsNodes = nodes.filter(n => {
        const data = getNodeData(n)
        return data?.category === 'analytics' || data?.category === 'destination'
    })

    for (const node of analyticsNodes) {
        const data = getNodeData(node)
        if (!data) continue

        const catalogNode = getNodeById(data.catalogId)
        if (!catalogNode) continue

        // Checks for activation/analytics requiring curated entities or metrics
        const requiresCurated = catalogNode.inputs.some(i => i.type === 'curated_entities' || i.type === 'metrics')
        if (requiresCurated) {
            const incomingEdges = edges.filter(e => e.target === node.id)
            const hasCuratedInput = incomingEdges.some(e => {
                const sourceNode = nodes.find(n => n.id === e.source)
                if (!sourceNode) return false
                const sourceCatalog = getNodeById(getNodeData(sourceNode)?.catalogId || '')
                if (!sourceCatalog) return false

                // Check if source provides the required port type
                return sourceCatalog.outputs.some(o => o.type === 'curated_entities' || o.type === 'metrics' || o.type === 'audiences_people' || o.type === 'audiences_accounts')
            })

            if (!hasCuratedInput && incomingEdges.length > 0) {
                results.push({
                    id: `analytics-non-curated-input-${node.id}`,
                    severity: 'warning',
                    message: `Data Quality: '${catalogNode.name}' is consuming non-curated data. Consider adding a Transform or Semantic layer upstream.`,
                    nodeIds: [node.id],
                    ruleViolated: 'analytics-compliance'
                })
            }
        }
    }

    return results
}

// Rule: Semantic Layer presence (Conformance Spec Rule 4)
function checkSemanticLayer(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = ctx

    // Check if models typically requiring semantic layer exist
    const analyticsModels = nodes.filter(n => {
        const data = getNodeData(n)
        return data?.catalogId === 'attribution_model' ||
            data?.catalogId === 'mmm_model' ||
            data?.catalogId === 'opportunity_influence'
    })

    if (analyticsModels.length > 0) {
        const hasSemanticLayer = nodes.some(n => getNodeData(n)?.category === 'transform')

        if (!hasSemanticLayer) {
            results.push({
                id: 'semantic-layer-missing-for-models',
                severity: 'info',
                message: 'Strategic Recommendation: Advanced models (Attribution/MMM) benefit from a centralized Semantic Layer for consistent metric definitions.',
                nodeIds: analyticsModels.map(n => n.id),
                ruleViolated: 'conformance-rule-4',
                recommendation: {
                    action: 'Add Cube or dbt Semantic Layer',
                    nodeToAdd: 'cube_js'
                }
            })
        }
    }

    return results
}

// Rule: Identity Hub connectivity (Conformance Spec Rule 2 - Refined)
function checkIdentityHubConnections(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = ctx

    const hubNodes = nodes.filter(n => {
        const catalogNode = getNodeById(getNodeData(n)?.catalogId || '')
        return catalogNode?.isHub
    })

    for (const hubNode of hubNodes) {
        const catalogHub = getNodeById(getNodeData(hubNode)!.catalogId)!

        // Identity hubs should have high-quality input
        const incoming = edges.filter(e => e.target === hubNode.id)
        const hasValidInput = incoming.some(e => {
            const source = nodes.find(n => n.id === e.source)
            if (!source) return false
            const sourceCatalog = getNodeById(getNodeData(source)?.catalogId || '')
            if (!sourceCatalog) return false

            // Should be from transform or identity sources
            return sourceCatalog.stage === 'transform' || sourceCatalog.stage === 'sources' || sourceCatalog.stage === 'storage_warehouse'
        })

        if (incoming.length > 0 && !hasValidInput) {
            results.push({
                id: `hub-input-quality-${hubNode.id}`,
                severity: 'warning',
                message: `Identity Hub '${catalogHub.name}' is receiving low-fidelity input. Identity resolution works best with curated or warehouse-cleansed data.`,
                nodeIds: [hubNode.id],
                ruleViolated: 'conformance-rule-2'
            })
        }

        // Must connect to something downstream if it's a hub
        const outgoing = edges.filter(e => e.source === hubNode.id)
        if (outgoing.length === 0 && nodes.length > 3) {
            results.push({
                id: `hub-dangling-${hubNode.id}`,
                severity: 'error',
                message: `Identity Hub '${catalogHub.name}' is not powering any downstream activation or analytics.`,
                nodeIds: [hubNode.id],
                ruleViolated: 'conformance-rule-2'
            })
        }
    }

    return results
}

// Rule: Governance cross-cutting check (Conformance Spec Rule 1)
function checkGovernanceCrossCutting(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = ctx

    const consentNodes = getNodesByCatalogId(nodes, 'consent_manager')
    const activationNodes = getNodesByCategory(nodes, 'activation')
    const destinationNodes = getNodesByCategory(nodes, 'destination')

    if (consentNodes.length > 0 && (activationNodes.length > 0 || destinationNodes.length > 0)) {
        // Check if consent only connects to activation (not cross-cutting)
        const consentEdges = edges.filter(e => consentNodes.some(cn => cn.id === e.source))
        const onlyConnectsToActivation = consentEdges.every(e => {
            const targetNode = nodes.find(n => n.id === e.target)
            if (!targetNode) return true
            const data = getNodeData(targetNode)
            return data?.category === 'activation' || data?.category === 'destination'
        })

        if (onlyConnectsToActivation && consentEdges.length > 0) {
            results.push({
                id: 'governance-not-crosscutting',
                severity: 'warning',
                message: 'Consent Manager should be cross-cutting (attached to Collection, Ingestion, Storage, Transform), not only at Activation.',
                nodeIds: consentNodes.map(n => n.id),
                ruleViolated: 'conformance-rule-1'
            })
        }
    }

    return results
}

// Rule: Cardinality and Uniqueness (Phase 2)
function checkCardinalityAndUniqueness(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes } = ctx

    const keyMap = new Map<string, RFNode[]>()

    for (const node of nodes) {
        const data = getNodeData(node)
        if (!data) continue

        const catalogNode = getNodeById(data.catalogId)
        if (!catalogNode || !catalogNode.uniquenessKey) continue

        const key = catalogNode.uniquenessKey
        if (!keyMap.has(key)) {
            keyMap.set(key, [])
        }
        keyMap.get(key)!.push(node)
    }

    for (const [key, nodesWithKey] of keyMap.entries()) {
        const firstCatalogNode = getNodeById(getNodeData(nodesWithKey[0])!.catalogId)
        if (firstCatalogNode?.cardinality === 'single' && nodesWithKey.length > 1) {
            results.push({
                id: `duplicate-single-instance-${key}`,
                severity: 'error',
                message: `Architecture Violation: Multiple instances of '${key}' detected. This component type is restricted to a single instance.`,
                nodeIds: nodesWithKey.map(n => n.id),
                ruleViolated: 'cardinality-violation'
            })
        }
    }

    return results
}

// ============================================
// SPEC §4: RAW → DESTINATION BLOCK
// ============================================

// Rule: Destinations cannot receive raw_events or raw_records directly.
// They must receive audiences_*, curated_entities, or metrics.
function checkRawToDestination(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = ctx

    const FORBIDDEN_RAW_TYPES: PortType[] = ['raw_events', 'raw_records']
    const destinationNodes = getNodesByCategory(nodes, 'destination')

    for (const destNode of destinationNodes) {
        const destData = getNodeData(destNode)
        if (!destData) continue

        const incomingEdges = edges.filter(e => e.target === destNode.id)
        for (const edge of incomingEdges) {
            const sourceNode = nodes.find(n => n.id === edge.source)
            if (!sourceNode) continue
            const sourceData = getNodeData(sourceNode)
            if (!sourceData) continue

            const sourceCatalog = getNodeById(sourceData.catalogId)
            if (!sourceCatalog) continue

            // Check if any source output port is a raw type
            const hasOnlyRawOutputs = sourceCatalog.outputs.length > 0 &&
                sourceCatalog.outputs.every(o => FORBIDDEN_RAW_TYPES.includes(o.type))

            if (hasOnlyRawOutputs) {
                results.push({
                    id: `raw-to-dest-${destNode.id}-${sourceNode.id}`,
                    severity: 'error',
                    message: `Data Quality: '${sourceCatalog.name}' sends raw data directly to destination '${getNodeById(destData.catalogId)?.name || destData.catalogId}'. Insert a Transform, Identity, or Activation layer first.`,
                    nodeIds: [destNode.id, sourceNode.id],
                    ruleViolated: 'raw-to-destination'
                })
            }
        }
    }

    return results
}

// ============================================
// SPEC §4: ENRICHMENT CANNOT BE IDENTITY HUB
// ============================================

// Rule: Enrichment providers (Clearbit, ZoomInfo, 6sense, Bombora) cannot
// serve as the identity hub. They must feed into transform or identity inputs.
function checkEnrichmentNotHub(ctx: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = []
    const { nodes, edges } = ctx

    for (const node of nodes) {
        const data = getNodeData(node)
        if (!data) continue

        const catalogNode = getNodeById(data.catalogId)
        if (!catalogNode) continue

        // Only check enrichment-role nodes
        if (catalogNode.nodeRole !== 'enrichment') continue

        // Check if this enrichment node is being used AS the identity hub
        // Heuristic: an enrichment node that feeds activation/destination directly
        // without going through identity_hub or transform first
        const outEdges = edges.filter(e => e.source === node.id)
        for (const edge of outEdges) {
            const targetNode = nodes.find(n => n.id === edge.target)
            if (!targetNode) continue
            const targetData = getNodeData(targetNode)
            if (!targetData) continue
            const targetCatalog = getNodeById(targetData.catalogId)
            if (!targetCatalog) continue

            if (targetCatalog.nodeRole === 'activation_connector' || targetCatalog.nodeRole === 'destination') {
                results.push({
                    id: `enrichment-bypass-${node.id}-${targetNode.id}`,
                    severity: 'warning',
                    message: `Architecture: '${catalogNode.name}' (enrichment) feeds directly to '${targetCatalog.name}'. Enrichment data should flow through Identity Hub or Transform first.`,
                    nodeIds: [node.id, targetNode.id],
                    ruleViolated: 'enrichment-not-hub'
                })
            }
        }

        // Check if enrichment node has isHub flag set (error)
        if (catalogNode.isHub) {
            results.push({
                id: `enrichment-is-hub-${node.id}`,
                severity: 'error',
                message: `Configuration: '${catalogNode.name}' is marked as Identity Hub but is an enrichment provider. Enrichment nodes cannot serve as the identity hub.`,
                nodeIds: [node.id],
                ruleViolated: 'enrichment-not-hub'
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
    profileDef?: ProfileDefinition | null,
    wizardData?: WizardData | null
): ValidationOutput {
    // Sanitize edges to prevent undefined access crashes
    const safeEdges = (edges ?? []).filter(e => e && e.source && e.target)
    const ctx: ValidationContext = { nodes, edges: safeEdges, wizardData, profileDef }

    const allResults: ValidationResult[] = [
        ...checkActivationConsent(ctx),
        ...checkAccountGraphSources(ctx),
        ...checkGovernance(ctx),
        ...checkAccountGraphFlow(ctx),
        ...checkWizardRecommendations(ctx),
        ...checkDisconnectedNodes(ctx),
        // Conformance Spec Rules
        ...checkSemanticLayer(ctx),
        ...checkIdentityHubConnections(ctx),
        ...checkGovernanceCrossCutting(ctx),
        ...checkCardinalityAndUniqueness(ctx),
        ...checkAnalyticsCompliance(ctx),
        ...checkProfileConformance(ctx), // Added profile checks
        // Spec §4 Rules
        ...checkRawToDestination(ctx),
        ...checkEnrichmentNotHub(ctx)
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
