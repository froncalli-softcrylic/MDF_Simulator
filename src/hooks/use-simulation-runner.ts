import { useCallback, useRef } from 'react'
import { useUIStore, SimulationPathStep } from '@/store/ui-store'
import { Edge, Node } from '@xyflow/react'
import { categoryMeta } from '@/data/node-catalog'

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
                    node: nodeLabel
                }
            }
        case 'storage_raw':
            return {
                input: {
                    ...MESSY_PROFILE,
                    storage: 'S3 / Raw',
                    schema: 'Loose'
                }
            }
        case 'storage_warehouse':
            return {
                input: {
                    ...MESSY_PROFILE,
                    storage: 'Snowflake',
                    schema: 'Structured'
                }
            }
        case 'transform':
        case 'mdf':
        case 'identity':
            return {
                diff: {
                    firstName: { original: MESSY_PROFILE.firstName, new: CLEAN_PROFILE.firstName },
                    lastName: { original: MESSY_PROFILE.lastName, new: CLEAN_PROFILE.lastName },
                    email: { original: MESSY_PROFILE.email, new: CLEAN_PROFILE.email },
                    phone: { original: MESSY_PROFILE.phone, new: CLEAN_PROFILE.phone }
                }
            }
        case 'analytics':
        case 'activation':
        case 'destination':
            return {
                output: {
                    ...CLEAN_PROFILE,
                    node: nodeLabel,
                    confidence: '99.8%',
                    segment: 'Premium Customer'
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

export function useSimulationRunner() {
    const { setSimulationState, setSimulationRunning } = useUIStore()
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    const clearAllTimeouts = () => {
        timeoutsRef.current.forEach(t => clearTimeout(t))
        timeoutsRef.current = []
    }

    const runSimulation = useCallback((nodes: Node[], edges: Edge[]) => {
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

        // Build path steps
        const pathSteps: SimulationPathStep[] = path.map(n => {
            const cat = (n.data as any).category as string
            const meta = categoryMeta[cat as keyof typeof categoryMeta]
            return {
                nodeId: n.id,
                label: (n.data.label as string) || meta?.label || cat,
                category: cat,
                description: meta?.description || ''
            }
        })

        // Start simulation
        setSimulationRunning(true)
        clearAllTimeouts()

        // Set initial state with path
        setSimulationState({
            status: 'stepping',
            activeNodeId: path[0].id,
            pathSteps,
            currentStepIndex: 0,
            dataPayload: getPayloadForCategory(
                (path[0].data as any).category as string,
                (path[0].data.label as string) || 'Node'
            ),
            resultsData: null
        })

        // Schedule remaining steps
        const STEP_DURATION = 3500 // Time to view each step
        const TRANSITION_DURATION = 1200 // Time for edge travel animation

        let delay = STEP_DURATION
        for (let i = 1; i < path.length; i++) {
            const stepIndex = i
            const node = path[i]
            const cat = (node.data as any).category as string

            // Transition phase (edge travel)
            const transitionTimeout = setTimeout(() => {
                setSimulationState({
                    status: 'transitioning',
                    activeNodeId: null,
                    currentStepIndex: stepIndex - 1
                })
            }, delay)
            timeoutsRef.current.push(transitionTimeout)
            delay += TRANSITION_DURATION

            // Step phase (arrive at next node)
            const stepTimeout = setTimeout(() => {
                setSimulationState({
                    status: 'stepping',
                    activeNodeId: node.id,
                    currentStepIndex: stepIndex,
                    dataPayload: getPayloadForCategory(cat, (node.data.label as string) || 'Node')
                })
            }, delay)
            timeoutsRef.current.push(stepTimeout)
            delay += STEP_DURATION
        }

        // Complete phase
        const completeTimeout = setTimeout(() => {
            const sourceNodes = path.filter(n => (n.data as any).category === 'sources')
            const destNodes = path.filter(n => ['activation', 'destination'].includes((n.data as any).category))
            const uniqueCategories = [...new Set(path.map(n => (n.data as any).category as string))]

            setSimulationState({
                status: 'results',
                activeNodeId: null,
                currentStepIndex: path.length,
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
