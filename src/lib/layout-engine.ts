// Layout Engine - ELK.js wrapper for auto-layout
// Organizes graph nodes in a clean, readable layout

import ELK from 'elkjs/lib/elk.bundled.js'
import type { Node, Edge } from '@xyflow/react'
import type { MdfNodeData } from '@/types'

const elk = new ELK()

// Default layout options optimized for data flow diagrams
const defaultLayoutOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.spacing.nodeNode': '80',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.layered.spacing.edgeNodeBetweenLayers': '40',
    'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES'
}

export interface LayoutOptions {
    direction?: 'RIGHT' | 'DOWN' | 'LEFT' | 'UP'
    nodeSpacing?: number
    layerSpacing?: number
}

export async function applyAutoLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): Promise<Node[]> {
    if (nodes.length === 0) return nodes

    // Default node dimensions
    const NODE_WIDTH = 180
    const NODE_HEIGHT = 60

    // Build ELK graph
    const elkGraph = {
        id: 'root',
        layoutOptions: {
            ...defaultLayoutOptions,
            'elk.direction': options.direction || 'RIGHT',
            'elk.spacing.nodeNode': String(options.nodeSpacing || 80),
            'elk.layered.spacing.nodeNodeBetweenLayers': String(options.layerSpacing || 100)
        },
        children: nodes.map(node => ({
            id: node.id,
            width: NODE_WIDTH,
            height: NODE_HEIGHT
        })),
        edges: edges.map(edge => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target]
        }))
    }

    try {
        const layoutedGraph = await elk.layout(elkGraph)

        // Map new positions back to nodes
        const positionMap = new Map<string, { x: number; y: number }>()
        layoutedGraph.children?.forEach(child => {
            if (child.x !== undefined && child.y !== undefined) {
                positionMap.set(child.id, { x: child.x, y: child.y })
            }
        })

        return nodes.map(node => {
            const newPos = positionMap.get(node.id)
            return newPos
                ? { ...node, position: newPos }
                : node
        })
    } catch (error) {
        console.error('Auto-layout failed:', error)
        return nodes
    }
}

// Quick layout for specific patterns
export async function applyHierarchicalLayout(
    nodes: Node[],
    edges: Edge[]
): Promise<Node[]> {
    return applyAutoLayout(nodes, edges, {
        direction: 'RIGHT',
        nodeSpacing: 60,
        layerSpacing: 120
    })
}

// Vertical layout option
export async function applyVerticalLayout(
    nodes: Node[],
    edges: Edge[]
): Promise<Node[]> {
    return applyAutoLayout(nodes, edges, {
        direction: 'DOWN',
        nodeSpacing: 80,
        layerSpacing: 100
    })
}
