// Snapshot Store — Save/Load/Compare graph states
// Part of Phase 2: Collaboration & Versioning

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SimulationSnapshot, ValidationOutput } from '@/types'
import { generateId } from '@/lib/utils'

// ============================================
// DIFF TYPES
// ============================================

export interface SnapshotDiff {
    addedNodes: string[]       // catalogIds added in B
    removedNodes: string[]     // catalogIds removed in B
    addedEdges: string[]       // "source→target" strings
    removedEdges: string[]
    movedNodes: Array<{
        catalogId: string
        from: { x: number; y: number }
        to: { x: number; y: number }
    }>
    summary: string
}

// ============================================
// SNAPSHOT STORE
// ============================================

interface SnapshotStore {
    snapshots: SimulationSnapshot[]
    maxSnapshots: number

    // Actions
    saveSnapshot: (
        name: string,
        nodes: any[],
        edges: any[],
        validationResults?: ValidationOutput,
        description?: string
    ) => SimulationSnapshot

    loadSnapshot: (id: string) => SimulationSnapshot | null
    deleteSnapshot: (id: string) => void
    renameSnapshot: (id: string, newName: string) => void

    compareSnapshots: (idA: string, idB: string) => SnapshotDiff | null

    getLatestSnapshot: () => SimulationSnapshot | null
    clearAll: () => void
}

export const useSnapshotStore = create<SnapshotStore>()(
    persist(
        (set, get) => ({
            snapshots: [],
            maxSnapshots: 20,

            saveSnapshot: (name, nodes, edges, validationResults, description) => {
                const snapshot: SimulationSnapshot = {
                    id: `snap-${generateId()}`,
                    name,
                    timestamp: Date.now(),
                    description,
                    nodes: JSON.parse(JSON.stringify(nodes)), // Deep clone
                    edges: JSON.parse(JSON.stringify(edges)),
                    validationResults
                }

                set(state => {
                    const updated = [snapshot, ...state.snapshots]
                    // Trim to max
                    if (updated.length > state.maxSnapshots) {
                        updated.splice(state.maxSnapshots)
                    }
                    return { snapshots: updated }
                })

                return snapshot
            },

            loadSnapshot: (id) => {
                return get().snapshots.find(s => s.id === id) || null
            },

            deleteSnapshot: (id) => {
                set(state => ({
                    snapshots: state.snapshots.filter(s => s.id !== id)
                }))
            },

            renameSnapshot: (id, newName) => {
                set(state => ({
                    snapshots: state.snapshots.map(s =>
                        s.id === id ? { ...s, name: newName } : s
                    )
                }))
            },

            compareSnapshots: (idA, idB) => {
                const snapA = get().snapshots.find(s => s.id === idA)
                const snapB = get().snapshots.find(s => s.id === idB)
                if (!snapA || !snapB) return null

                // Extract catalogIds
                const catalogIdsA = new Set(snapA.nodes.map((n: any) => n.data?.catalogId).filter(Boolean))
                const catalogIdsB = new Set(snapB.nodes.map((n: any) => n.data?.catalogId).filter(Boolean))

                const addedNodes = [...catalogIdsB].filter(id => !catalogIdsA.has(id))
                const removedNodes = [...catalogIdsA].filter(id => !catalogIdsB.has(id))

                // Extract edge keys
                const edgeKeyA = new Set(snapA.edges.map((e: any) => `${e.source}→${e.target}`))
                const edgeKeyB = new Set(snapB.edges.map((e: any) => `${e.source}→${e.target}`))

                const addedEdges = [...edgeKeyB].filter(k => !edgeKeyA.has(k))
                const removedEdges = [...edgeKeyA].filter(k => !edgeKeyB.has(k))

                // Detect moved nodes (same catalogId, different position)
                const nodeMapA = new Map<string, any>()
                snapA.nodes.forEach((n: any) => {
                    if (n.data?.catalogId) nodeMapA.set(n.data.catalogId, n)
                })

                const movedNodes: SnapshotDiff['movedNodes'] = []
                snapB.nodes.forEach((nB: any) => {
                    const catalogId = nB.data?.catalogId
                    if (!catalogId) return
                    const nA = nodeMapA.get(catalogId)
                    if (!nA) return

                    const dx = Math.abs((nA.position?.x || 0) - (nB.position?.x || 0))
                    const dy = Math.abs((nA.position?.y || 0) - (nB.position?.y || 0))
                    if (dx > 10 || dy > 10) {
                        movedNodes.push({
                            catalogId,
                            from: nA.position || { x: 0, y: 0 },
                            to: nB.position || { x: 0, y: 0 }
                        })
                    }
                })

                const parts: string[] = []
                if (addedNodes.length) parts.push(`+${addedNodes.length} nodes`)
                if (removedNodes.length) parts.push(`-${removedNodes.length} nodes`)
                if (addedEdges.length) parts.push(`+${addedEdges.length} edges`)
                if (removedEdges.length) parts.push(`-${removedEdges.length} edges`)
                if (movedNodes.length) parts.push(`${movedNodes.length} moved`)

                return {
                    addedNodes,
                    removedNodes,
                    addedEdges,
                    removedEdges,
                    movedNodes,
                    summary: parts.length > 0 ? parts.join(', ') : 'No changes'
                }
            },

            getLatestSnapshot: () => {
                const snaps = get().snapshots
                return snaps.length > 0 ? snaps[0] : null
            },

            clearAll: () => set({ snapshots: [] })
        }),
        {
            name: 'mdf-snapshots',
            partialize: (state) => ({
                snapshots: state.snapshots.slice(0, 10) // Only persist last 10 in localStorage
            })
        }
    )
)
