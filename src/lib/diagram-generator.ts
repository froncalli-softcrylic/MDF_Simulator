// B2B SaaS Diagram Generator
// Creates enterprise-ready diagrams with proper governance rail and account graph hub

import type {
    WizardData, DemoProfile, MdfNodeData, GraphData, NodeStatus, GapAnalysis,
    NodeCategory, PipelineCategory
} from '@/types'
import { CATEGORY_ORDER } from '@/types'
import { getNodeById, nodeCatalog } from '@/data/node-catalog'
import { isNodeVisibleInProfile } from '@/data/demo-profiles'
import { logger } from '@/lib/logger'
import {
    getExistingNodesFromTools,
    getRecommendedNodesFromPainPoints,
    getRequiredNodesFromGoals
} from '@/data/wizard-options'
import { generateId } from '@/lib/utils'

// ============================================
// LAYOUT CONSTANTS
// ============================================

const COLUMN_WIDTH = 260
const ROW_HEIGHT = 120
const START_X = 80
const START_Y = 100
const RAIL_TOP_Y = 30      // Governance rail at top
const RAIL_CENTER_Y = 300  // Account graph hub centered

// Column mapping for pipeline categories
// Using imported CATEGORY_ORDER for columns

// ============================================
// B2B SAAS DEFAULT STACKS (by profile)
// ============================================

interface ProfileStack {
    nodes: string[]
    edges: Array<{ source: string; target: string }>
}

const profileStacks: Partial<Record<DemoProfile, ProfileStack>> = {
    // ==================================================
    // GENERIC (Simple starter)
    // ==================================================
    generic: {
        nodes: [
            // Sources (col 0)
            'product_events', 'salesforce_crm', 'billing_system',
            // Collection (col 1)
            'segment',
            // Ingestion (col 2)
            'fivetran',
            // Raw Storage (col 3)
            's3_raw',
            // Warehouse (col 4)
            'snowflake',
            // Transform (col 5)
            'dbt_core',
            // MDF Hub (col 6 - Center)
            'mdf_hub',
            // Governance Rail (should be added by rules, but listing here for completeness if needed)
            'consent_manager',
            // Analytics (col 7)
            'looker',
            // Activation (col 8)
            'hightouch',
            // Destinations (col 9)
            'salesforce_crm_dest', 'linkedin_ads', 'slack_alerts'
        ],
        edges: [
            // Standard Flow
            { source: 'product_events', target: 'segment' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'segment', target: 's3_raw' },
            { source: 's3_raw', target: 'snowflake' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'mdf_hub' }, // Into the Hub
            { source: 'mdf_hub', target: 'hightouch' }, // Out of the Hub
            { source: 'mdf_hub', target: 'looker' },    // Measurement
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'linkedin_ads' },
            { source: 'hightouch', target: 'slack_alerts' },

            // Optional/Wizard Tool Connections
            // CRM
            { source: 'hubspot_crm', target: 'fivetran' },
            // Marketing
            { source: 'marketo', target: 'fivetran' },
            // Analytics
            { source: 'amplitude', target: 'snowflake' }, // Or via Segment
            { source: 'web_app_events', target: 'segment' },
            // Activation Apps
            { source: 'hightouch', target: 'braze' },
            { source: 'hightouch', target: 'outreach' },
            { source: 'hightouch', target: 'salesloft' },
            { source: 'hightouch', target: 'google_ads' },
            { source: 'hightouch', target: 'meta_ads' },
            // Governance
            { source: 'consent_manager', target: 'mdf_hub' }
        ]
    }
}

// ============================================
// POSITION CALCULATION
// ============================================

function getCategoryColumn(category: NodeCategory): number {
    // Rail categories get special positioning (not in column flow)
    if (category === 'governance') return 4  // Center-ish
    if (category === 'identity') return 5    // After transform

    // Pipeline categories use the defined order
    return CATEGORY_ORDER[category as PipelineCategory] ?? 4
}

function calculateNodePositions(
    nodesToInclude: string[],
    profile: DemoProfile
): Record<string, { x: number; y: number }> {
    const positions: Record<string, { x: number; y: number }> = {}

    // Group nodes by their category
    const categoryGroups: Record<string, string[]> = {}

    nodesToInclude.forEach(nodeId => {
        const catalogNode = getNodeById(nodeId)
        if (!catalogNode) return

        const category = catalogNode.category
        if (!categoryGroups[category]) {
            categoryGroups[category] = []
        }
        categoryGroups[category].push(nodeId)
    })

    // Position governance rail nodes at the TOP
    const governanceNodes = categoryGroups['governance'] || []
    governanceNodes.forEach((nodeId, idx) => {
        positions[nodeId] = {
            x: START_X + (idx + 2) * COLUMN_WIDTH, // Spread across top
            y: RAIL_TOP_Y
        }
    })

    // Position identity hub nodes in CENTER cluster
    const accountGraphNodes = categoryGroups['identity'] || []
    const graphStartX = START_X + 5 * COLUMN_WIDTH
    accountGraphNodes.forEach((nodeId, idx) => {
        const row = Math.floor(idx / 2)
        const col = idx % 2
        positions[nodeId] = {
            x: graphStartX + col * (COLUMN_WIDTH * 0.8),
            y: RAIL_CENTER_Y + row * (ROW_HEIGHT * 0.9)
        }
    })

    // Position pipeline nodes in columns
    const pipelineCategories: PipelineCategory[] = [
        'sources', 'collection', 'ingestion', 'storage_raw',
        'storage_warehouse', 'transform', 'identity', 'governance', 'analytics', 'activation', 'destination'
    ]

    pipelineCategories.forEach(category => {
        const nodes = categoryGroups[category] || []
        const column = CATEGORY_ORDER[category]
        const x = START_X + column * COLUMN_WIDTH

        nodes.forEach((nodeId, idx) => {
            positions[nodeId] = {
                x,
                y: START_Y + idx * ROW_HEIGHT
            }
        })
    })

    return positions
}

// ============================================
// GAP ANALYSIS (for wizard-based generation)
// ============================================

export function analyzeGaps(wizardData: WizardData, profile: DemoProfile): GapAnalysis {
    const existingNodes = getExistingNodesFromTools(wizardData.tools)
    const recommendedFromPainPoints = getRecommendedNodesFromPainPoints(wizardData.painPoints)
    const requiredFromGoals = getRequiredNodesFromGoals(wizardData.goals)
    const gapNodes = requiredFromGoals.filter(n => !existingNodes.includes(n))

    // Start with the profile's default stack
    const profileStack = profileStacks[profile] || profileStacks.generic!
    const allNodesSet = new Set([...profileStack.nodes])

    // Add user's existing tools
    existingNodes.forEach(n => allNodesSet.add(n))

    // Add recommendations and requirements
    recommendedFromPainPoints.forEach(n => allNodesSet.add(n))
    requiredFromGoals.forEach(n => allNodesSet.add(n))

    // Filter to only nodes visible in this profile
    const filteredNodes = Array.from(allNodesSet).filter(nodeId =>
        isNodeVisibleInProfile(nodeId, profile)
    )

    return {
        existingNodes,
        recommendedNodes: recommendedFromPainPoints.filter(n => !existingNodes.includes(n)),
        requiredNodes: requiredFromGoals,
        gapNodes,
        allNodes: filteredNodes
    }
}

function getNodeStatus(catalogId: string, analysis: GapAnalysis): NodeStatus {
    if (analysis.existingNodes.includes(catalogId)) return 'existing'
    if (analysis.gapNodes.includes(catalogId)) return 'gap'
    if (analysis.requiredNodes.includes(catalogId)) return 'required'
    if (analysis.recommendedNodes.includes(catalogId)) return 'recommended'
    return 'optional'
}

// ============================================
// MAIN GENERATION FUNCTIONS
// ============================================

/**
 * Generate diagram from wizard data (with gap analysis)
 */
export function generateDiagramFromWizard(
    wizardData: WizardData,
    profile: DemoProfile
): GraphData {
    const analysis = analyzeGaps(wizardData, profile)
    const profileStack = profileStacks[profile] || profileStacks.generic!

    logger.debug('📊 Generating B2B SaaS diagram for profile:', profile, {
        existing: analysis.existingNodes,
        gaps: analysis.gapNodes,
        total: analysis.allNodes.length
    })

    // Filter to valid catalog nodes
    const nodesToInclude = analysis.allNodes.filter(nodeId => getNodeById(nodeId) !== undefined)

    // Build node map
    const nodeMap: Record<string, string> = {}
    nodesToInclude.forEach(catalogId => {
        nodeMap[catalogId] = `node-${generateId()}`
    })

    // Calculate positions
    const positions = calculateNodePositions(nodesToInclude, profile)

    // Create nodes
    const nodes: GraphData['nodes'] = nodesToInclude.map(catalogId => {
        const catalogNode = getNodeById(catalogId)
        const status = getNodeStatus(catalogId, analysis)
        const pos = positions[catalogId] || { x: START_X, y: START_Y }

        return {
            id: nodeMap[catalogId],
            type: 'mdfNode',
            position: pos,
            data: {
                catalogId,
                label: catalogNode?.name || catalogId,
                category: catalogNode?.category || 'sources',
                status,
                isRailNode: catalogNode?.isRailNode,
                railPosition: catalogNode?.category === 'governance' ? 'top' :
                    catalogNode?.category === 'identity' ? 'center' : undefined
            } as MdfNodeData
        }
    })

    // Use profile's edge definitions, filtered to existing nodes
    const edges: GraphData['edges'] = profileStack.edges
        .filter(edge => nodeMap[edge.source] && nodeMap[edge.target])
        .map(edge => {
            const sourceNode = getNodeById(edge.source)
            return {
                id: `edge-${generateId()}`,
                source: nodeMap[edge.source],
                target: nodeMap[edge.target],
                isGovernanceEdge: sourceNode?.category === 'governance'
            }
        })

    logger.debug(`✅ Generated ${profile} diagram: ${nodes.length} nodes, ${edges.length} edges`)

    return { nodes, edges }
}

/**
 * Generate default diagram for a profile (no wizard data)
 */
export function generateDefaultDiagramForProfile(profile: DemoProfile): GraphData {
    const profileStack = profileStacks[profile] || profileStacks.generic!

    // Filter to valid catalog nodes
    const nodesToInclude = profileStack.nodes.filter(nodeId => getNodeById(nodeId) !== undefined)

    // Build node map
    const nodeMap: Record<string, string> = {}
    nodesToInclude.forEach(catalogId => {
        nodeMap[catalogId] = `node-${generateId()}`
    })

    // Calculate positions
    const positions = calculateNodePositions(nodesToInclude, profile)

    // Create nodes (all optional since no wizard data)
    const nodes: GraphData['nodes'] = nodesToInclude.map(catalogId => {
        const catalogNode = getNodeById(catalogId)
        const pos = positions[catalogId] || { x: START_X, y: START_Y }

        return {
            id: nodeMap[catalogId],
            type: 'mdfNode',
            position: pos,
            data: {
                catalogId,
                label: catalogNode?.name || catalogId,
                category: catalogNode?.category || 'sources',
                status: 'optional' as NodeStatus,
                isRailNode: catalogNode?.isRailNode,
                railPosition: catalogNode?.category === 'governance' ? 'top' :
                    catalogNode?.category === 'identity' ? 'center' : undefined
            } as MdfNodeData
        }
    })

    // Create edges
    const edges: GraphData['edges'] = profileStack.edges
        .filter(edge => nodeMap[edge.source] && nodeMap[edge.target])
        .map(edge => {
            const sourceNode = getNodeById(edge.source)
            return {
                id: `edge-${generateId()}`,
                source: nodeMap[edge.source],
                target: nodeMap[edge.target],
                isGovernanceEdge: sourceNode?.category === 'governance'
            }
        })

    logger.debug(`✅ Generated default ${profile} diagram: ${nodes.length} nodes, ${edges.length} edges`)

    return { nodes, edges }
}

/**
 * Template generation (for manual template selection)
 */
export function generateDiagramFromTemplate(
    templateNodes: Array<{ catalogId: string; position: { x: number; y: number } }>,
    templateEdges: Array<{ source: string; target: string }>
): GraphData {
    const nodeMap: Record<string, string> = {}

    const nodes: GraphData['nodes'] = templateNodes.map(spec => {
        const catalogNode = getNodeById(spec.catalogId)
        const nodeId = `node-${generateId()}`
        nodeMap[spec.catalogId] = nodeId

        return {
            id: nodeId,
            type: 'mdfNode',
            position: spec.position,
            data: {
                catalogId: spec.catalogId,
                label: catalogNode?.name || spec.catalogId,
                category: catalogNode?.category || 'sources',
                status: 'optional' as NodeStatus,
                isRailNode: catalogNode?.isRailNode
            } as MdfNodeData
        }
    })

    const edges: GraphData['edges'] = templateEdges.map(spec => ({
        id: `edge-${generateId()}`,
        source: nodeMap[spec.source],
        target: nodeMap[spec.target]
    })).filter(e => e.source && e.target)

    return { nodes, edges }
}

// ============================================
// EDGE CASE TEMPLATES (B2B SaaS Patterns)
// ============================================

export interface EdgeCaseTemplate {
    id: string
    name: string
    description: string
    useCase: string
    nodes: string[]
    edges: Array<{ source: string; target: string }>
}

export const edgeCaseTemplates: EdgeCaseTemplate[] = [
    // -------------------------------------------
    // Warehouse-First Architecture
    // -------------------------------------------
    {
        id: 'warehouse_first',
        name: 'Warehouse-First',
        description: 'Skip the data lake — load directly into Snowflake for faster Time-to-Value.',
        useCase: 'Teams that prioritize speed and have structured data sources (CRM, Billing, SaaS tools).',
        nodes: [
            'salesforce_crm', 'hubspot_crm', 'billing_system',
            'fivetran',
            'snowflake',
            'dbt_core',
            'cube_js',
            'neptune_graph', 'account_resolution',
            'consent_manager', 'snowflake_horizon',
            'looker', 'opportunity_influence',
            'hightouch',
            'salesforce_crm_dest', 'linkedin_ads'
        ],
        edges: [
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'hubspot_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'cube_js' },
            { source: 'cube_js', target: 'looker' },
            { source: 'dbt_core', target: 'neptune_graph' },
            { source: 'neptune_graph', target: 'account_resolution' },
            { source: 'dbt_core', target: 'opportunity_influence' },
            { source: 'account_resolution', target: 'hightouch' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'linkedin_ads' },
            { source: 'consent_manager', target: 'hightouch' },
            { source: 'snowflake_horizon', target: 'snowflake' }
        ]
    },

    // -------------------------------------------
    // Lake-First Architecture
    // -------------------------------------------
    {
        id: 'lake_first',
        name: 'Lake-First (Medallion)',
        description: 'Immutable raw data lake with Apache Iceberg before warehouse loading.',
        useCase: 'Enterprises with compliance requirements, ML workloads, or need for replayability.',
        nodes: [
            'product_events', 'salesforce_crm', 'billing_system', 'web_app_events',
            'segment',
            'kinesis', 'kinesis_firehose', 'fivetran',
            's3_raw', 'iceberg',
            'snowflake',
            'dbt_core', 'glue',
            'neptune_graph', 'account_resolution',
            'consent_manager', 'access_control', 'pii_detection', 'data_quality',
            'looker',
            'hightouch',
            'salesforce_crm_dest', 'slack_alerts'
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'web_app_events', target: 'segment' },
            { source: 'segment', target: 'kinesis' },
            { source: 'kinesis', target: 'kinesis_firehose' },
            { source: 'kinesis_firehose', target: 's3_raw' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'fivetran', target: 's3_raw' },
            { source: 's3_raw', target: 'iceberg' },
            { source: 'iceberg', target: 'snowflake' },
            { source: 'iceberg', target: 'glue' },
            { source: 'glue', target: 'neptune_graph' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'neptune_graph' },
            { source: 'neptune_graph', target: 'account_resolution' },
            { source: 'dbt_core', target: 'looker' },
            { source: 'account_resolution', target: 'hightouch' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'slack_alerts' },
            { source: 'pii_detection', target: 's3_raw' },
            { source: 'consent_manager', target: 'hightouch' },
            { source: 'access_control', target: 'snowflake' }
        ]
    },

    // -------------------------------------------
    // Streaming-First Architecture
    // -------------------------------------------
    {
        id: 'streaming_first',
        name: 'Real-Time Streaming',
        description: 'Event-driven architecture for real-time personalization and alerts.',
        useCase: 'PLG companies with product-led growth, in-app messaging, or real-time triggers.',
        nodes: [
            'product_events', 'web_app_events',
            'segment', 'rudderstack',
            'kinesis', 'pubsub',
            's3_raw',
            'bigquery',
            'dbt_cloud', 'spark',
            'neptune_graph', 'account_resolution',
            'data_quality',
            'churn_model', 'looker',
            'braze',
            'slack_alerts', 'outreach'
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'web_app_events', target: 'rudderstack' },
            { source: 'segment', target: 'kinesis' },
            { source: 'rudderstack', target: 'pubsub' },
            { source: 'kinesis', target: 's3_raw' },
            { source: 'kinesis', target: 'braze' }, // Real-time activation
            { source: 'pubsub', target: 'bigquery' },
            { source: 's3_raw', target: 'bigquery' },
            { source: 'bigquery', target: 'dbt_cloud' },
            { source: 'dbt_cloud', target: 'spark' },
            { source: 'spark', target: 'churn_model' },
            { source: 'dbt_cloud', target: 'neptune_graph' },
            { source: 'neptune_graph', target: 'account_resolution' },
            { source: 'account_resolution', target: 'braze' },
            { source: 'churn_model', target: 'slack_alerts' },
            { source: 'dbt_cloud', target: 'looker' },
            { source: 'account_resolution', target: 'outreach' }
        ]
    },

    // -------------------------------------------
    // Opportunity Influence / Attribution
    // -------------------------------------------
    {
        id: 'opportunity_influence',
        name: 'Opportunity Influence & Attribution',
        description: 'Full B2B attribution model with opportunity touchpoint analysis.',
        useCase: 'Revenue teams measuring marketing influence on closed/won deals.',
        nodes: [
            'salesforce_crm', 'marketo', 'web_app_events',
            'fivetran', 'segment',
            'snowflake',
            'dbt_core',
            'neptune_graph', 'account_resolution', 'hierarchy_modeling',
            'data_quality',
            'attribution_model', 'opportunity_influence', 'mmm_model',
            'looker', 'tableau',
            'hightouch',
            'salesforce_crm_dest', 'slack_alerts'
        ],
        edges: [
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'marketo', target: 'fivetran' },
            { source: 'web_app_events', target: 'segment' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'segment', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'neptune_graph' },
            { source: 'neptune_graph', target: 'account_resolution' },
            { source: 'neptune_graph', target: 'hierarchy_modeling' },
            { source: 'dbt_core', target: 'attribution_model' },
            { source: 'account_resolution', target: 'opportunity_influence' },
            { source: 'attribution_model', target: 'opportunity_influence' },
            { source: 'opportunity_influence', target: 'looker' },
            { source: 'attribution_model', target: 'mmm_model' },
            { source: 'mmm_model', target: 'tableau' },
            { source: 'account_resolution', target: 'hightouch' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'slack_alerts' }
        ]
    },

    // -------------------------------------------
    // Intent & ABM
    // -------------------------------------------
    {
        id: 'abm_intent',
        name: 'ABM & Intent Signals',
        description: 'Account-based marketing with third-party intent data enrichment.',
        useCase: 'B2B marketing teams running targeted ABM campaigns.',
        nodes: [
            'salesforce_crm', 'billing_system',
            'fivetran',
            'snowflake',
            'dbt_core',
            'neptune_graph', 'account_resolution', 'contact_stitching',
            'sixsense', 'bombora', 'clearbit', 'zoominfo',
            'consent_manager',
            'looker',
            'hightouch',
            'linkedin_ads', 'google_ads', 'outreach', 'salesloft'
        ],
        edges: [
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'neptune_graph' },
            { source: 'neptune_graph', target: 'account_resolution' },
            { source: 'neptune_graph', target: 'contact_stitching' },
            { source: 'sixsense', target: 'account_resolution' },
            { source: 'bombora', target: 'account_resolution' },
            { source: 'clearbit', target: 'account_resolution' },
            { source: 'zoominfo', target: 'contact_stitching' },
            { source: 'account_resolution', target: 'looker' },
            { source: 'account_resolution', target: 'hightouch' },
            { source: 'contact_stitching', target: 'hightouch' },
            { source: 'consent_manager', target: 'hightouch' },
            { source: 'hightouch', target: 'linkedin_ads' },
            { source: 'hightouch', target: 'google_ads' },
            { source: 'hightouch', target: 'outreach' },
            { source: 'hightouch', target: 'salesloft' }
        ]
    }
]

/**
 * Generate diagram from an edge case template
 */
export function generateDiagramFromEdgeCaseTemplate(
    templateId: string,
    profile: DemoProfile = 'generic'
): GraphData | null {
    const template = edgeCaseTemplates.find(t => t.id === templateId)
    if (!template) {
        logger.warn(`Template ${templateId} not found`)
        return null
    }

    const nodeMap: Record<string, string> = {}
    const validNodes = template.nodes.filter(nodeId => getNodeById(nodeId) !== undefined)

    // Calculate positions
    const positions = calculateNodePositions(validNodes, profile)

    const nodes: GraphData['nodes'] = validNodes.map(catalogId => {
        const catalogNode = getNodeById(catalogId)
        const nodeId = `node-${generateId()}`
        nodeMap[catalogId] = nodeId
        const pos = positions[catalogId] || { x: START_X, y: START_Y }

        return {
            id: nodeId,
            type: 'mdfNode',
            position: pos,
            data: {
                catalogId,
                label: catalogNode?.name || catalogId,
                category: catalogNode?.category || 'source',
                status: 'optional' as NodeStatus,
                isRailNode: catalogNode?.isRailNode
            } as MdfNodeData
        }
    })

    const edges: GraphData['edges'] = template.edges
        .filter(edge => nodeMap[edge.source] && nodeMap[edge.target])
        .map(edge => ({
            id: `edge-${generateId()}`,
            source: nodeMap[edge.source],
            target: nodeMap[edge.target]
        }))

    logger.debug(`✅ Generated ${template.name} template: ${nodes.length} nodes, ${edges.length} edges`)

    return { nodes, edges }
}

/**
 * Get all available edge case templates
 */
export function getEdgeCaseTemplates(): EdgeCaseTemplate[] {
    return edgeCaseTemplates
}



