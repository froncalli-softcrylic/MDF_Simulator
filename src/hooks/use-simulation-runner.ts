import { useCallback, useRef } from 'react'
import { useUIStore, SimulationPathStep } from '@/store/ui-store'
import { useCanvasStore } from '@/store/canvas-store'
import { useProfileStore } from '@/store/profile-store'
import { Edge, Node } from '@xyflow/react'
import { categoryMeta, getNodeById } from '@/data/node-catalog'
import { generateMdfHubGraph } from '@/lib/diagram-generator'
import { semanticAutoLayout } from '@/lib/semantic-layout-engine'

// Canonical left-to-right order for the pipeline
const CATEGORY_ORDER: string[] = [
    'sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse',
    'transform', 'mdf', 'identity', 'analytics', 'activation', 'destination'
]

// Consistent "Storytelling" Profiles
const MESSY_PROFILE = {
    firstName: 'john',
    lastName: 'DOE',
    email: 'JOHN.DOE@GMAIL.com',
    phone: '1234567890',
    source: 'Legacy CRM'
};

const CLEAN_PROFILE = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    phone: '(123) 456-7890',
    status: 'Verified'
};

// Generate a payload description based on category with a "Hygiene Story"
function getPayloadForCategory(category: string, nodeLabel: string): any {
    const label = nodeLabel.toLowerCase()

    switch (category) {
        case 'sources':
            return {
                input: {
                    ...MESSY_PROFILE,
                    node: nodeLabel,
                    quality: 'Poor (32%)'
                }
            }
        case 'collection':
        case 'ingestion':
            return {
                input: {
                    ...MESSY_PROFILE,
                    status: 'Captured',
                    node: nodeLabel,
                    latency: '240ms'
                }
            }
        case 'storage_raw':
            return {
                input: {
                    ...MESSY_PROFILE,
                    storage: 'S3 / Raw',
                    schema: 'Loose / JSON',
                    size: '1.2kb'
                }
            }
        case 'storage_warehouse':
            return {
                input: {
                    ...MESSY_PROFILE,
                    storage: 'Snowflake',
                    schema: 'Structured / Table',
                    rows: 1
                }
            }
        case 'governance':
            return {
                validation: {
                    rule: 'E.164 Phone Format',
                    status: 'Passed',
                    transform: '1234567890 -> (123) 456-7890',
                    pii_check: 'Cleared'
                }
            }
        case 'transform':
            // Enrichment detection
            if (label.includes('clearbit') || label.includes('zoominfo') || label.includes('enrichment')) {
                return {
                    enrichment: {
                        source: nodeLabel,
                        data_added: {
                            company: 'Acme Corp',
                            revenue: '$50M - $100M',
                            industry: 'SaaS',
                            employees: '250-500'
                        },
                        confidence: 'High'
                    }
                }
            }
            return {
                transformation: {
                    firstName: { original: MESSY_PROFILE.firstName, new: CLEAN_PROFILE.firstName },
                    lastName: { original: MESSY_PROFILE.lastName, new: CLEAN_PROFILE.lastName },
                    email: { original: MESSY_PROFILE.email, new: CLEAN_PROFILE.email },
                    normalization: 'Applied'
                }
            }
        case 'identity':
            return {
                resolution: {
                    keys_matched: ['email', 'phone', 'device_id'],
                    graph_link: 'Link established to UP-8812',
                    confidence: 'Determininstic (100%)',
                    profiles_merged: 2
                }
            }
        case 'mdf':
            // Fallback for generic MDF node if not drilled down (shouldn't happen often now)
            return {
                mdf_summary: {
                    status: 'Processing Chain',
                    stages: ['Hygiene', 'Identity', 'Enrichment', 'Modeling'],
                    health: 'Good'
                }
            }
        case 'analytics':
            if (label.includes('metric') || label.includes('semantic')) {
                return {
                    metrics: {
                        ltv: '$142,000',
                        churn_risk: 'Medium',
                        engagement_score: 85,
                        last_active: '2 hours ago'
                    }
                }
            }
            if (label.includes('churn')) {
                return {
                    prediction: {
                        model: 'XGBoost Churn v2',
                        score: '0.12 (Low Risk)',
                        factors: ['High Engagement', 'Recent Purchase'],
                        action: 'Add to "Loyal Customers"'
                    }
                }
            }
            return {
                analytics: {
                    report_generated: 'Daily Active Users',
                    view_count: 1420,
                    trend: '+5%'
                }
            }
        case 'activation':
        case 'destination':
            return {
                output: {
                    ...CLEAN_PROFILE,
                    node: nodeLabel,
                    segment: 'High-Value Enterprise',
                    sync_status: 'Success (200 OK)'
                }
            }
        default:
            return {
                input: {
                    node: nodeLabel,
                    status: 'Processing'
                }
            }
    }
}

// Get stage type for the DataTransformationCard
function getStageForCategory(category: string): 'extraction' | 'transformation' | 'activation' {
    if (['sources', 'collection', 'ingestion', 'storage_raw', 'storage_warehouse'].includes(category)) {
        return 'extraction'
    }
    if (['transform', 'mdf', 'identity', 'governance'].includes(category)) {
        return 'transformation'
    }
    return 'activation'
}

// Progressive metrics that accumulate as data flows through the pipeline
function getMetricsForCategory(category: string): {
    recordsProcessed: number;
    profilesUnified: number;
    matchRate: string;
    dupesRemoved: number;
    segmentsActive: number;
} {
    switch (category) {
        case 'sources':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '0%', dupesRemoved: 0, segmentsActive: 0 }
        case 'collection':
        case 'ingestion':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '0%', dupesRemoved: 0, segmentsActive: 0 }
        case 'storage_raw':
        case 'storage_warehouse':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '32%', dupesRemoved: 0, segmentsActive: 0 }
        case 'transform':
            return { recordsProcessed: 4200, profilesUnified: 0, matchRate: '64%', dupesRemoved: 38, segmentsActive: 0 }
        case 'mdf':
            return { recordsProcessed: 4200, profilesUnified: 1200, matchRate: '94%', dupesRemoved: 38, segmentsActive: 0 }
        case 'identity':
            return { recordsProcessed: 4200, profilesUnified: 1840, matchRate: '94%', dupesRemoved: 38, segmentsActive: 0 }
        case 'analytics':
            return { recordsProcessed: 4200, profilesUnified: 1840, matchRate: '94%', dupesRemoved: 38, segmentsActive: 12 }
        case 'activation':
        case 'destination':
            return { recordsProcessed: 4200, profilesUnified: 1840, matchRate: '94%', dupesRemoved: 38, segmentsActive: 12 }
        default:
            return { recordsProcessed: 0, profilesUnified: 0, matchRate: '0%', dupesRemoved: 0, segmentsActive: 0 }
    }
}

export function useSimulationRunner() {
    const { setSimulationState, setSimulationRunning } = useUIStore()
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    const clearAllTimeouts = () => {
        timeoutsRef.current.forEach(t => clearTimeout(t))
        timeoutsRef.current = []
    }

    const runSimulation = useCallback(async (nodes: Node[], edges: Edge[]) => {
        // BFS Pathfinding: Find a path from leftmost category to rightmost
        // Build adjacency from edges
        const adjacency: Map<string, string[]> = new Map()
        edges.forEach(e => {
            if (!adjacency.has(e.source)) adjacency.set(e.source, [])
            adjacency.get(e.source)!.push(e.target)
        })

        // Group nodes by category
        const nodesByCategory: Map<string, Node[]> = new Map()
        nodes.forEach(n => {
            const cat = (n.data as any).category as string
            if (cat) {
                if (!nodesByCategory.has(cat)) nodesByCategory.set(cat, [])
                nodesByCategory.get(cat)!.push(n)
            }
        })

        // Build path: pick one node per category in left-to-right order
        const path: Node[] = []
        for (const cat of CATEGORY_ORDER) {
            const nodesInCat = nodesByCategory.get(cat)
            if (nodesInCat && nodesInCat.length > 0) {
                // Pick the first connected node, or the first one if none are connected
                if (path.length === 0) {
                    path.push(nodesInCat[0])
                } else {
                    const lastNode = path[path.length - 1]
                    // Try to find a node in this category that's reachable from the last node
                    const neighbors = adjacency.get(lastNode.id) || []
                    const connectedNode = nodesInCat.find(n => neighbors.includes(n.id))
                    if (connectedNode) {
                        path.push(connectedNode)
                    } else {
                        // No direct connection, just pick the first node in this category
                        path.push(nodesInCat[0])
                    }
                }
            }
        }

        // Build path steps with MDF Drill-Down Support
        const pathSteps: SimulationPathStep[] = []
        const activeProfile = useProfileStore.getState().activeProfile

        // Pre-generate the hub graph so we have it available
        let mdfHubGraph = generateMdfHubGraph(activeProfile)

        // ** NEW: Auto-Layout the Hub Graph **
        try {
            // Apply semantic layout to the generated graph
            const layoutedNodes = await semanticAutoLayout(
                mdfHubGraph.nodes as Node[],
                mdfHubGraph.edges as Edge[]
            )
            // Update the graph with layouted nodes
            mdfHubGraph = {
                ...mdfHubGraph,
                nodes: layoutedNodes as any
            }
        } catch (err) {
            console.error("Failed to auto-layout MDF Hub:", err)
        }

        path.forEach(n => {
            const cat = (n.data as any).category as string
            const meta = categoryMeta[cat as keyof typeof categoryMeta]

            // Standard Node Step
            const mainStep: SimulationPathStep = {
                nodeId: n.id,
                label: (n.data.label as string) || meta?.label || cat,
                category: cat,
                description: meta?.description || '',
                viewMode: 'main'
            }

            pathSteps.push(mainStep)

            // If this is the MDF Hub node, drill down!
            if (cat === 'mdf') {
                // Identify internal steps based on the generated graph
                // We'll pick a representative "Golden Path" through the hub
                // Updated Order: Governance -> Enrichment -> Identity -> Metrics -> Models

                const internalPathIds = activeProfile === 'adobe_summit'
                    ? ['adobe_web_sdk', 'aep_sources', 'aep_query_service', 'aep_identity_service', 'rtcdp_profile', 'journey_optimizer']
                    : ['data_quality', 'clearbit', 'identity_resolution', 'metrics_layer', 'churn_model']

                internalPathIds.forEach(catalogId => {
                    // Find the node in the generated graph
                    const internalNode = mdfHubGraph.nodes.find(n => (n.data as any).catalogId === catalogId)
                    if (internalNode) {
                        const internalCat = (internalNode.data as any).category || 'mdf'
                        const internalMeta = categoryMeta[internalCat as keyof typeof categoryMeta]
                        pathSteps.push({
                            nodeId: internalNode.id,
                            label: (internalNode.data as any).label,
                            category: internalCat,
                            description: internalMeta?.description || 'Internal MDF Component',
                            viewMode: 'mdf-hub'
                        })
                    }
                })
            }
        })

        // Start simulation
        setSimulationRunning(true)
        clearAllTimeouts()

        // Set initial state
        setSimulationState({
            status: 'stepping',
            activeNodeId: pathSteps[0].nodeId,
            pathSteps,
            currentStepIndex: 0,
            dataPayload: getPayloadForCategory(pathSteps[0].category, pathSteps[0].label),
            simulationMetrics: getMetricsForCategory(pathSteps[0].category),
            resultsData: null
        })

        // Schedule steps
        const STEP_DURATION = 3500
        const TRANSITION_DURATION = 1200

        let delay = STEP_DURATION
        for (let i = 1; i < pathSteps.length; i++) {
            const stepIndex = i
            const currentStep = pathSteps[i]
            const prevStep = pathSteps[i - 1]

            // Transition logic
            const transitionTimeout = setTimeout(() => {
                // Check if we need to switch views
                if (currentStep.viewMode === 'mdf-hub' && prevStep.viewMode === 'main') {
                    // Enter MDF Hub
                    useCanvasStore.getState().enterMdfHubMode(mdfHubGraph)
                } else if (currentStep.viewMode === 'main' && prevStep.viewMode === 'mdf-hub') {
                    // Exit MDF Hub
                    useCanvasStore.getState().exitMdfHubMode()
                }

                setSimulationState({
                    status: 'transitioning',
                    activeNodeId: null, // Clear active node during move
                    currentStepIndex: stepIndex - 1
                })
            }, delay)
            timeoutsRef.current.push(transitionTimeout)
            delay += TRANSITION_DURATION

            // Step logic (Arrival)
            const stepTimeout = setTimeout(() => {
                setSimulationState({
                    status: 'stepping',
                    activeNodeId: currentStep.nodeId,
                    currentStepIndex: stepIndex,
                    dataPayload: getPayloadForCategory(currentStep.category, currentStep.label),
                    simulationMetrics: getMetricsForCategory(currentStep.category)
                })
            }, delay)
            timeoutsRef.current.push(stepTimeout)
            delay += STEP_DURATION
        }

        // Complete phase
        const completeTimeout = setTimeout(() => {
            // Ensure we are back in main view (just in case)
            if (useCanvasStore.getState().viewMode === 'mdf-hub') {
                useCanvasStore.getState().exitMdfHubMode()
            }

            const sourceNodes = path.filter(n => (n.data as any).category === 'sources')
            const destNodes = path.filter(n => ['activation', 'destination'].includes((n.data as any).category))
            const uniqueCategories = [...new Set(path.map(n => (n.data as any).category as string))]

            setSimulationState({
                status: 'results',
                activeNodeId: null,
                currentStepIndex: pathSteps.length,
                resultsData: {
                    totalNodes: path.length,
                    sourceNames: sourceNodes.map(n => (n.data.label as string) || 'Source'),
                    destinationNames: destNodes.map(n => (n.data.label as string) || 'Destination'),
                    categories: uniqueCategories,
                    finalPayload: {
                        unified_profile_id: 'UP-8812',
                        name: `${CLEAN_PROFILE.firstName} ${CLEAN_PROFILE.lastName}`,
                        email: CLEAN_PROFILE.email,
                        phone: CLEAN_PROFILE.phone,
                        segment: 'High-Value Enterprise',
                        ltv: '$142,000',
                        next_best_action: 'Upsell Premium Plan',
                        activated_channels: destNodes.map(n => (n.data.label as string) || 'Channel')
                    }
                }
            })
        }, delay)
        timeoutsRef.current.push(completeTimeout)

    }, [setSimulationState, setSimulationRunning])

    const stopSimulation = useCallback(() => {
        clearAllTimeouts()
        setSimulationRunning(false)
        useCanvasStore.getState().exitMdfHubMode() // Reset view logic
        setSimulationState({
            status: 'idle',
            activeNodeId: null,
            dataPayload: null,
            pathSteps: [],
            currentStepIndex: -1,
            resultsData: null
        })
    }, [setSimulationRunning, setSimulationState])

    return { runSimulation, stopSimulation, getStageForCategory }
}
