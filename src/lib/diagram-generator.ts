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

const COLUMN_WIDTH = 400  // Increased for larger nodes + spacing
const ROW_HEIGHT = 220    // Increased for taller nodes + vertical spacing
const START_X = 80
const START_Y = 100
const RAIL_TOP_Y = 30      // Governance rail at top
const RAIL_CENTER_Y = 300  // Account graph hub centered

// Column mapping for pipeline categories
// Using imported CATEGORY_ORDER for columns

// ============================================
// VISUAL CONSTANTS
// ============================================

export const CATEGORY_EDGE_COLORS: Record<string, string> = {
    sources: 'hsl(199, 89%, 48%)', // Cyan/Blue
    collection: 'hsl(270, 70%, 60%)', // Purple
    ingestion: 'hsl(30, 90%, 55%)',   // Orange
    storage_raw: 'hsl(45, 90%, 45%)', // Gold
    storage_warehouse: 'hsl(217, 91%, 60%)', // Blue
    transform: 'hsl(250, 70%, 60%)',  // Indigo
    mdf: 'hsl(35, 90%, 50%)',         // Amber (Hub)
    identity: 'hsl(158, 64%, 52%)',   // Emerald
    governance: 'hsl(0, 70%, 55%)',   // Red
    analytics: 'hsl(330, 70%, 55%)',  // Pink
    activation: 'hsl(14, 80%, 55%)',  // Orange-Red
    destination: 'hsl(180, 70%, 40%)',// Teal
}
export const DEFAULT_EDGE_COLOR = '#b0b8c8'

// ============================================
// B2B SAAS DEFAULT STACKS (by profile)
// ============================================

interface ProfileStack {
    nodes: string[]
    edges: Array<{ source: string; target: string }>
    // Optional per-node column overrides (nodeId → column index)
    // When provided, these override the default category-based column assignment
    columnOverrides?: Record<string, number>
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
    },

    // ==================================================
    // ADOBE SUMMIT (Sources → MDF Hub → Destinations)
    // ==================================================
    // The MDF Hub encapsulates ALL Marketing Data Foundation layers:
    //   Collection, Ingestion, Raw Storage, Warehouse, Transform,
    //   Identity Resolution, Analytics, and Activation.
    // Sources and Destinations sit OUTSIDE the MDF Hub.
    adobe_summit: {
        nodes: [
            // ── DATA SOURCES (Column 0) ──
            'marketo', 'salesforce_crm', 'web_app_events', 'product_events',

            // ── MDF HUB (Column 1) ──
            'mdf_hub',

            // ── DESTINATIONS (Column 2) ──
            'adobe_target', 'journey_optimizer_dest', 'meta_ads'
        ],
        edges: [
            // Sources → MDF Hub
            { source: 'marketo', target: 'mdf_hub' },
            { source: 'salesforce_crm', target: 'mdf_hub' },
            { source: 'web_app_events', target: 'mdf_hub' },
            { source: 'product_events', target: 'mdf_hub' },

            // MDF Hub → Destinations
            { source: 'mdf_hub', target: 'adobe_target' },
            { source: 'mdf_hub', target: 'journey_optimizer_dest' },
            { source: 'mdf_hub', target: 'meta_ads' }
        ],
        // Force 3-column layout: Sources | MDF Hub | Destinations
        columnOverrides: {
            'marketo': 0,
            'salesforce_crm': 0,
            'web_app_events': 0,
            'product_events': 0,
            'mdf_hub': 1,
            'adobe_target': 2,
            'journey_optimizer_dest': 2,
            'meta_ads': 2
        }
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

    // Check for profile-specific column overrides
    const profileStack = profileStacks[profile]
    if (profileStack?.columnOverrides) {
        // Use explicit column overrides — group by assigned column
        const columnGroups: Record<number, string[]> = {}
        nodesToInclude.forEach(nodeId => {
            const col = profileStack.columnOverrides![nodeId] ?? 0
            if (!columnGroups[col]) columnGroups[col] = []
            columnGroups[col].push(nodeId)
        })

        Object.entries(columnGroups).forEach(([colStr, nodes]) => {
            const col = parseInt(colStr)
            const x = START_X + col * COLUMN_WIDTH

            // Vertically center nodes in each column
            const totalHeight = (nodes.length - 1) * ROW_HEIGHT
            const startY = START_Y + Math.max(0, (3 * ROW_HEIGHT - totalHeight) / 2)

            nodes.forEach((nodeId, idx) => {
                positions[nodeId] = { x, y: startY + idx * ROW_HEIGHT }
            })
        })

        return positions
    }

    // Default: group nodes by their category
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
    // UPDATE: User requests strict mapping of inputs. Do NOT add default profile stack.
    // const profileStack = profileStacks[profile] || profileStacks.generic!
    const allNodesSet = new Set<string>()

    // Add user's existing tools (Strict Mode)
    existingNodes.forEach(n => allNodesSet.add(n))

    // Do NOT add recommended/required nodes to the VISUAL graph yet.
    // requiredFromGoals.forEach(n => allNodesSet.add(n))

    // Filter to only nodes visible in this profile
    const filteredNodes = Array.from(allNodesSet).filter(nodeId =>
        isNodeVisibleInProfile(nodeId, profile)
    )

    // Add required/recommended nodes to the visual graph (for the "solution" view)
    // We will HIDE them initially in the UI, but they need to be in the graph data.
    const solutionNodes = [...filteredNodes]
    requiredFromGoals.forEach(n => {
        if (!solutionNodes.includes(n) && isNodeVisibleInProfile(n, profile)) {
            solutionNodes.push(n)
        }
    })
    recommendedFromPainPoints.forEach(n => {
        if (!solutionNodes.includes(n) && isNodeVisibleInProfile(n, profile)) {
            solutionNodes.push(n)
        }
    })

    return {
        existingNodes,
        recommendedNodes: recommendedFromPainPoints.filter(n => !existingNodes.includes(n)),
        requiredNodes: requiredFromGoals,
        gapNodes,
        allNodes: solutionNodes
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
    const nodes = nodesToInclude.map(catalogId => {
        const catalogNode = getNodeById(catalogId)
        const status = getNodeStatus(catalogId, analysis)
        const pos = positions[catalogId] || { x: START_X, y: START_Y }
        const isHidden = !analysis.existingNodes.includes(catalogId)

        return {
            id: nodeMap[catalogId],
            type: 'mdfNode',
            position: pos,
            hidden: isHidden, // HIDDEN INITIALLY if not existing
            data: {
                catalogId,
                label: catalogNode?.name || catalogId,
                category: catalogNode?.category || 'sources',
                status,
                isRailNode: catalogNode?.isRailNode,
                railPosition: catalogNode?.category === 'governance' ? 'top' :
                    catalogNode?.category === 'identity' ? 'center' : undefined,
                customColumn: profileStack.columnOverrides?.[catalogId]
            } as MdfNodeData
        }
    })

    // Use profile's edge definitions, filtered to existing nodes
    // Apply COLOR CODING based on source node category
    const edges: GraphData['edges'] = profileStack.edges
        .filter(edge => nodeMap[edge.source] && nodeMap[edge.target])
        .map(edge => {
            const sourceNode = getNodeById(edge.source)
            const category = sourceNode?.category || 'sources'
            const color = CATEGORY_EDGE_COLORS[category] || DEFAULT_EDGE_COLOR

            return {
                id: `edge-${generateId()}`,
                source: nodeMap[edge.source],
                target: nodeMap[edge.target],
                isGovernanceEdge: sourceNode?.category === 'governance',
                style: { stroke: color, strokeWidth: 2.5 }
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
                    catalogNode?.category === 'identity' ? 'center' : undefined,
                customColumn: profileStack.columnOverrides?.[catalogId]
            } as MdfNodeData
        }
    })

    // Create edges
    // Apply COLOR CODING based on source node category
    const edges: GraphData['edges'] = profileStack.edges
        .filter(edge => nodeMap[edge.source] && nodeMap[edge.target])
        .map(edge => {
            const sourceNode = getNodeById(edge.source)
            const category = sourceNode?.category || 'sources'
            const color = CATEGORY_EDGE_COLORS[category] || DEFAULT_EDGE_COLOR

            return {
                id: `edge-${generateId()}`,
                source: nodeMap[edge.source],
                target: nodeMap[edge.target],
                isGovernanceEdge: sourceNode?.category === 'governance',
                style: { stroke: color, strokeWidth: 2.5 }
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

    const edges: GraphData['edges'] = templateEdges.map(spec => {
        const sourceNode = getNodeById(spec.source)
        const category = sourceNode?.category || 'sources'
        const color = CATEGORY_EDGE_COLORS[category] || DEFAULT_EDGE_COLOR

        return {
            id: `edge-${generateId()}`,
            source: nodeMap[spec.source],
            target: nodeMap[spec.target],
            style: { stroke: color, strokeWidth: 2.5 }
        }
    }).filter(e => e.source && e.target)

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
    category: 'starter' | 'architecture' | 'use_case'
    nodes: string[]
    edges: Array<{ source: string; target: string }>
}

export const edgeCaseTemplates: EdgeCaseTemplate[] = [
    // -------------------------------------------
    // STARTERS — Simple entry points
    // -------------------------------------------
    {
        id: 'basic_elt',
        name: 'Basic ELT Pipeline',
        description: 'Simple extract-load-transform pipeline. The starting point for any data team.',
        useCase: 'Teams just getting started with structured data from CRM and billing.',
        category: 'starter',
        nodes: [
            'salesforce_crm', 'billing_system',
            'fivetran',
            'snowflake',
            'dbt_core',
            'looker'
        ],
        edges: [
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'looker' }
        ]
    },
    {
        id: 'mdf_foundation',
        name: 'MDF Foundation',
        description: 'Full Marketing Data Foundation with identity resolution and unified customer profiles.',
        useCase: 'Teams that need a unified view of customers across multiple data sources.',
        category: 'starter',
        nodes: [
            'product_events', 'salesforce_crm', 'billing_system',
            'segment',
            'fivetran',
            's3_raw',
            'snowflake',
            'dbt_core',
            'mdf_hub',
            'consent_manager',
            'looker',
            'hightouch',
            'salesforce_crm_dest', 'linkedin_ads', 'slack_alerts'
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'segment', target: 's3_raw' },
            { source: 's3_raw', target: 'snowflake' },
            { source: 'fivetran', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'mdf_hub' },
            { source: 'mdf_hub', target: 'hightouch' },
            { source: 'mdf_hub', target: 'looker' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'linkedin_ads' },
            { source: 'hightouch', target: 'slack_alerts' },
            { source: 'consent_manager', target: 'mdf_hub' }
        ]
    },
    {
        id: 'enterprise_mdf',
        name: 'Enterprise MDF',
        description: 'Advanced foundation with governance rails, clean rooms, ML models, and multi-channel activation.',
        useCase: 'Enterprise teams with compliance requirements, ML workloads, and complex activation needs.',
        category: 'starter',
        nodes: [
            'product_events', 'web_app_events', 'salesforce_crm', 'billing_system', 'support_tickets',
            'segment', 'rudderstack',
            'fivetran',
            's3_raw', 'iceberg',
            'snowflake',
            'dbt_core',
            'mdf_hub',
            'consent_manager', 'pii_detection', 'data_quality',
            'churn_model',
            'looker', 'tableau',
            'hightouch',
            'braze', 'salesforce_crm_dest', 'linkedin_ads', 'slack_alerts', 'outreach'
        ],
        edges: [
            { source: 'product_events', target: 'segment' },
            { source: 'web_app_events', target: 'rudderstack' },
            { source: 'salesforce_crm', target: 'fivetran' },
            { source: 'billing_system', target: 'fivetran' },
            { source: 'support_tickets', target: 'fivetran' },
            { source: 'segment', target: 's3_raw' },
            { source: 'rudderstack', target: 's3_raw' },
            { source: 'fivetran', target: 's3_raw' },
            { source: 's3_raw', target: 'iceberg' },
            { source: 'iceberg', target: 'snowflake' },
            { source: 'snowflake', target: 'dbt_core' },
            { source: 'dbt_core', target: 'mdf_hub' },
            { source: 'mdf_hub', target: 'hightouch' },
            { source: 'mdf_hub', target: 'looker' },
            { source: 'mdf_hub', target: 'tableau' },
            { source: 'mdf_hub', target: 'churn_model' },
            { source: 'churn_model', target: 'slack_alerts' },
            { source: 'hightouch', target: 'braze' },
            { source: 'hightouch', target: 'salesforce_crm_dest' },
            { source: 'hightouch', target: 'linkedin_ads' },
            { source: 'hightouch', target: 'outreach' },
            { source: 'consent_manager', target: 'mdf_hub' },
            { source: 'pii_detection', target: 's3_raw' },
            { source: 'data_quality', target: 'dbt_core' }
        ]
    },

    // -------------------------------------------
    // ARCHITECTURES — Data infrastructure patterns
    // -------------------------------------------
    // -------------------------------------------
    // Warehouse-First Architecture
    // -------------------------------------------
    {
        id: 'warehouse_first',
        name: 'Warehouse-First',
        description: 'Skip the data lake — load directly into Snowflake for faster Time-to-Value.',
        useCase: 'Teams that prioritize speed and have structured data sources (CRM, Billing, SaaS tools).',
        category: 'architecture',
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
        category: 'architecture',
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
        category: 'architecture',
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
        category: 'use_case',
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
        category: 'use_case',
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

/**
 * Generate the internal graph for the MDF Hub Drill-Down
 */
// ... (existing imports and constants)

export function generateMdfHubGraph(profile: DemoProfile): GraphData {
    // --------------------------------------------------------
    // ADOBE SUMMIT SPECIFIC VIEW
    // --------------------------------------------------------
    if (profile === 'adobe_summit') {
        // Define nodes for the Adobe-specific flow
        const adobeNodes = [
            'adobe_web_sdk',           // Collection
            'aep_sources',             // Ingestion
            'aep_data_lake',           // Raw Storage
            'aep_query_service',       // Transform & Modeling (Query Service / Data Distiller)
            'aep_identity_service',    // Identity Resolution
            'rtcdp_profile',           // Unified Profile Store
            'adobe_analytics',         // Analytics
            'customer_journey_analytics', // Analytics
            'rtcdp_activation',        // Activation
            'journey_optimizer'        // Activation
        ]

        // Filter valid nodes
        const nodesToInclude = adobeNodes.filter(nodeId => getNodeById(nodeId) !== undefined)

        // Build map
        const nodeMap: Record<string, string> = {}
        nodesToInclude.forEach(catalogId => {
            nodeMap[catalogId] = `node-${generateId()}`
        })

        // Layout: Left-to-Right Flow
        // Col 1: Collection
        // Col 2: Ingestion
        // Col 3: Storage
        // Col 4: Modeling (Hub Center)
        // Col 5: Identity
        // Col 6: Analytics (Top) & Activation (Bottom) ?? Or strictly L-R

        const positions: Record<string, { x: number; y: number }> = {}
        const startY = 300

        // 1. Collection
        if (nodeMap['adobe_web_sdk']) positions['adobe_web_sdk'] = { x: 0, y: startY }

        // 2. Ingestion
        if (nodeMap['aep_sources']) positions['aep_sources'] = { x: 300, y: startY }

        // 3. Raw Storage
        if (nodeMap['aep_data_lake']) positions['aep_data_lake'] = { x: 600, y: startY }

        // 4. Modeling (Query Service)
        if (nodeMap['aep_query_service']) positions['aep_query_service'] = { x: 900, y: startY }

        // 5. Identity & Profile (Stacked)
        if (nodeMap['aep_identity_service']) positions['aep_identity_service'] = { x: 1200, y: startY - 100 }
        if (nodeMap['rtcdp_profile']) positions['rtcdp_profile'] = { x: 1200, y: startY + 100 }

        // 6. Analytics (Top Branch)
        if (nodeMap['adobe_analytics']) positions['adobe_analytics'] = { x: 1500, y: startY - 200 }
        if (nodeMap['customer_journey_analytics']) positions['customer_journey_analytics'] = { x: 1800, y: startY - 200 }

        // 7. Activation (Bottom Branch)
        if (nodeMap['rtcdp_activation']) positions['rtcdp_activation'] = { x: 1500, y: startY + 200 }
        if (nodeMap['journey_optimizer']) positions['journey_optimizer'] = { x: 1800, y: startY + 200 }


        const nodes: GraphData['nodes'] = nodesToInclude.map(catalogId => {
            const catalogNode = getNodeById(catalogId)
            const pos = positions[catalogId] || { x: 0, y: 0 }

            return {
                id: nodeMap[catalogId],
                type: 'mdfNode',
                position: pos,
                data: {
                    catalogId,
                    label: catalogNode?.name || catalogId,
                    category: catalogNode?.category || 'mdf',
                    status: 'existing',
                    isRailNode: catalogNode?.isRailNode,
                    railPosition: undefined
                } as MdfNodeData
            }
        })

        const edges: GraphData['edges'] = []
        const addEdge = (source: string, target: string) => {
            if (nodeMap[source] && nodeMap[target]) {
                edges.push({
                    id: `edge-${generateId()}`,
                    source: nodeMap[source],
                    target: nodeMap[target],
                    style: { stroke: '#b0b8c8', strokeWidth: 2 }
                })
            }
        }

        // Define specific edges
        addEdge('adobe_web_sdk', 'aep_sources')
        addEdge('aep_sources', 'aep_data_lake')
        addEdge('aep_data_lake', 'aep_query_service') // Storage -> Modeling

        // Modeling -> Identity Services
        addEdge('aep_query_service', 'aep_identity_service')
        addEdge('aep_identity_service', 'rtcdp_profile') // Identity -> Profile

        // Profile -> Analytics & Activation
        addEdge('rtcdp_profile', 'adobe_analytics')
        addEdge('rtcdp_profile', 'customer_journey_analytics')
        addEdge('rtcdp_profile', 'rtcdp_activation')

        // Activation -> Journey Optimizer
        addEdge('rtcdp_activation', 'journey_optimizer')

        return { nodes, edges }
    }

    // --------------------------------------------------------
    // DEFAULT / GENERIC VIEW
    // --------------------------------------------------------
    // Define the nodes that live INSIDE the MDF Hub
    // These are the "Foundation" components
    const hubNodes = [
        // Identity & Profile
        'identity_resolution',
        'metrics_layer', // Semantic Layer / Unified Metrics

        // Governance Rails (Top)
        'consent_manager',
        'data_quality',
        'pii_masking',

        // Enrichment / Transform
        'clearbit', // or generic enrichment

        // Measurement / Analytics (Inside the foundation)
        'attribution_model',
        'mmm_model',
        'churn_model'
    ]

    // Filter to valid nodes
    const nodesToInclude = hubNodes.filter(nodeId => getNodeById(nodeId) !== undefined)

    // Build node map
    const nodeMap: Record<string, string> = {}
    nodesToInclude.forEach(catalogId => {
        nodeMap[catalogId] = `node-${generateId()}`
    })

    // Custom Layout for Hub View - Strict Left-to-Right Pipeline
    // 1. Ingest/Governance -> 2. Enrichment -> 3. Identity -> 4. Metrics -> 5. Models
    const positions: Record<string, { x: number; y: number }> = {}
    const startY = 250 // Center Y
    const COL_SPACING = 350
    const ROW_SPACING = 200

    // Col 1: Governance / Gatekeepers
    if (nodeMap['consent_manager']) positions['consent_manager'] = { x: 0, y: startY - ROW_SPACING }
    if (nodeMap['data_quality']) positions['data_quality'] = { x: 0, y: startY }
    if (nodeMap['pii_masking']) positions['pii_masking'] = { x: 0, y: startY + ROW_SPACING }

    // Col 2: Enrichment
    if (nodeMap['clearbit']) positions['clearbit'] = { x: COL_SPACING, y: startY }

    // Col 3: Identity (The Core)
    if (nodeMap['identity_resolution']) positions['identity_resolution'] = { x: COL_SPACING * 2, y: startY }

    // Col 4: Metrics / Semantic Layer
    if (nodeMap['metrics_layer']) positions['metrics_layer'] = { x: COL_SPACING * 3, y: startY }

    // Col 5: Models / Analytics
    if (nodeMap['attribution_model']) positions['attribution_model'] = { x: COL_SPACING * 4, y: startY - ROW_SPACING }
    if (nodeMap['mmm_model']) positions['mmm_model'] = { x: COL_SPACING * 4, y: startY }
    if (nodeMap['churn_model']) positions['churn_model'] = { x: COL_SPACING * 4, y: startY + ROW_SPACING }

    // Create Nodes
    const nodes: GraphData['nodes'] = nodesToInclude.map(catalogId => {
        const catalogNode = getNodeById(catalogId)
        const pos = positions[catalogId] || { x: 0, y: 0 }

        return {
            id: nodeMap[catalogId],
            type: 'mdfNode',
            position: pos,
            data: {
                catalogId,
                label: catalogNode?.name || catalogId,
                category: catalogNode?.category || 'mdf',
                status: 'existing',
                isRailNode: catalogNode?.isRailNode,
                railPosition: undefined
            } as MdfNodeData
        }
    })

    // Create Edges (Linear Flow)
    const edges: GraphData['edges'] = []

    const addEdge = (source: string, target: string) => {
        if (nodeMap[source] && nodeMap[target]) {
            edges.push({
                id: `edge-${generateId()}`,
                source: nodeMap[source],
                target: nodeMap[target],
                style: { stroke: '#b0b8c8', strokeWidth: 2 }
            })
        }
    }

    // Governance -> Enrichment/Identity
    addEdge('consent_manager', 'identity_resolution')
    addEdge('data_quality', 'clearbit') // Quality check before enrichment
    addEdge('pii_masking', 'identity_resolution')

    // Enrichment -> Identity
    addEdge('clearbit', 'identity_resolution')

    // Identity -> Metrics
    addEdge('identity_resolution', 'metrics_layer')

    // Metrics -> Models
    addEdge('metrics_layer', 'attribution_model')
    addEdge('metrics_layer', 'mmm_model')
    addEdge('metrics_layer', 'churn_model')

    return { nodes, edges }
}



