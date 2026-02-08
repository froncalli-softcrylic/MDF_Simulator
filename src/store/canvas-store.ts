// Canvas Store - Zustand store for React Flow state
// Manages nodes, edges, and undo/redo history

import { create } from 'zustand'
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import type { MdfNodeData, GraphData, NodeCategory } from '@/types'
import { generateId } from '@/lib/utils'

interface HistoryState {
    nodes: Node[]
    edges: Edge[]
}

interface CanvasStore {
    // State
    nodes: Node[]
    edges: Edge[]
    history: HistoryState[]
    historyIndex: number
    projectId: string | null
    isDirty: boolean

    // Actions
    setProjectId: (id: string | null) => void
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    onNodesChange: (changes: NodeChange[]) => void
    onEdgesChange: (changes: EdgeChange[]) => void
    onConnect: (connection: Connection) => void
    addNode: (catalogId: string, label: string, category: string, position: { x: number; y: number }) => string
    removeNode: (nodeId: string) => void
    updateNodeData: (nodeId: string, data: Partial<MdfNodeData>) => void

    // Graph operations
    loadGraph: (data: GraphData) => void
    exportGraph: () => GraphData
    clearCanvas: () => void

    // History
    pushHistory: () => void
    undo: () => void
    redo: () => void
    canUndo: () => boolean
    canRedo: () => boolean

    // Dirty state
    markClean: () => void
}

const MAX_HISTORY = 50

export const useCanvasStore = create<CanvasStore>((set, get) => ({
    nodes: [],
    edges: [],
    history: [],
    historyIndex: -1,
    projectId: null,
    isDirty: false,

    setProjectId: (id) => set({ projectId: id }),

    setNodes: (nodes) => set({ nodes, isDirty: true }),

    setEdges: (edges) => set({ edges, isDirty: true }),

    onNodesChange: (changes) => {
        // console.log('onNodesChange:', changes)
        set({
            nodes: applyNodeChanges(changes, get().nodes),
            isDirty: true
        })
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
            isDirty: true
        })
    },

    onConnect: (connection) => {
        const newEdge: Edge = {
            id: `edge-${generateId()}`,
            source: connection.source || '',
            target: connection.target || '',
            sourceHandle: connection.sourceHandle ?? undefined,
            targetHandle: connection.targetHandle ?? undefined
        }
        set({
            edges: addEdge(newEdge, get().edges),
            isDirty: true
        })
        get().pushHistory()
    },

    addNode: (catalogId, label, category, position) => {
        const nodeId = `node-${generateId()}`
        const newNode: Node = {
            id: nodeId,
            type: 'mdfNode',
            position,
            data: {
                catalogId,
                label,
                category: category as NodeCategory
            } as MdfNodeData
        }
        set({
            nodes: [...get().nodes, newNode],
            isDirty: true
        })
        get().pushHistory()
        return nodeId
    },

    removeNode: (nodeId) => {
        set({
            nodes: get().nodes.filter(n => n.id !== nodeId),
            edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
            isDirty: true
        })
        get().pushHistory()
    },

    updateNodeData: (nodeId, data) => {
        set({
            nodes: get().nodes.map(node =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            ),
            isDirty: true
        })
    },

    loadGraph: (data) => {
        const nodes: Node[] = data.nodes.map(n => ({
            id: n.id,
            type: 'mdfNode',
            position: n.position,
            data: n.data as MdfNodeData
        }))
        const edges: Edge[] = data.edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle ?? undefined,
            targetHandle: e.targetHandle ?? undefined
        }))
        set({
            nodes,
            edges,
            isDirty: false
        })
        // Reset history when loading
        set({
            history: [{ nodes: get().nodes, edges: get().edges }],
            historyIndex: 0
        })
    },

    exportGraph: (): GraphData => {
        const { nodes, edges } = get()
        return {
            nodes: nodes.map(n => ({
                id: n.id,
                type: n.type || 'mdfNode',
                position: n.position,
                data: n.data as MdfNodeData
            })),
            edges: edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                sourceHandle: e.sourceHandle ?? undefined,
                targetHandle: e.targetHandle ?? undefined
            }))
        }
    },

    clearCanvas: () => {
        get().pushHistory()
        set({ nodes: [], edges: [], isDirty: true })
    },

    pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get()
        // Remove any future states if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push({ nodes: [...nodes], edges: [...edges] })

        // Limit history size
        if (newHistory.length > MAX_HISTORY) {
            newHistory.shift()
        }

        set({
            history: newHistory,
            historyIndex: newHistory.length - 1
        })
    },

    undo: () => {
        const { history, historyIndex } = get()
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            const state = history[newIndex]
            set({
                nodes: [...state.nodes],
                edges: [...state.edges],
                historyIndex: newIndex,
                isDirty: true
            })
        }
    },

    redo: () => {
        const { history, historyIndex } = get()
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1
            const state = history[newIndex]
            set({
                nodes: [...state.nodes],
                edges: [...state.edges],
                historyIndex: newIndex,
                isDirty: true
            })
        }
    },

    canUndo: () => get().historyIndex > 0,

    canRedo: () => get().historyIndex < get().history.length - 1,

    markClean: () => set({ isDirty: false })
}))
